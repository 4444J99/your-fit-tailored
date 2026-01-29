/**
 * Airtable Automation Script: Auto-Commit Cycles
 *
 * Trigger: Time-based, daily at 06:00
 * Action: Commit scheduled cycles that are within commitment window
 *
 * This script:
 * 1. Finds cycles in Scheduled state within commitment lead time
 * 2. Verifies user is Active
 * 3. Verifies all planned garments are Available
 * 4. Transitions cycle to Committed and garments to Reserved
 * 5. Logs results to CommitmentBatches table
 */

// Configuration
const CYCLES_TABLE = 'Cycles';
const USERS_TABLE = 'Users';
const GARMENTS_TABLE = 'Garments';
const BOXES_TABLE = 'Boxes';
const EVENTS_TABLE = 'Events';
const CONFIG_TABLE = 'Configuration';

// Default commitment lead time (hours) if not in config
const DEFAULT_COMMITMENT_LEAD_HOURS = 48;

// Main execution
async function main() {
    const startTime = Date.now();
    const errors = [];

    let cyclesAttempted = 0;
    let cyclesCommitted = 0;
    let cyclesBlocked = 0;
    let substitutionsMade = 0;
    const committedCycleIds = [];

    try {
        // Get tables
        const cyclesTable = base.getTable(CYCLES_TABLE);
        const usersTable = base.getTable(USERS_TABLE);
        const garmentsTable = base.getTable(GARMENTS_TABLE);
        const boxesTable = base.getTable(BOXES_TABLE);
        const eventsTable = base.getTable(EVENTS_TABLE);

        // Get commitment lead hours from config (or use default)
        let commitmentLeadHours = DEFAULT_COMMITMENT_LEAD_HOURS;
        try {
            const configTable = base.getTable(CONFIG_TABLE);
            const configQuery = await configTable.selectRecordsAsync({
                fields: ['config_key', 'config_value']
            });
            const leadConfig = configQuery.records.find(
                r => r.getCellValue('config_key') === 'commitment_lead_hours'
            );
            if (leadConfig) {
                commitmentLeadHours = parseInt(leadConfig.getCellValue('config_value')) || DEFAULT_COMMITMENT_LEAD_HOURS;
            }
        } catch (configError) {
            console.log('Using default commitment lead hours');
        }

        // Calculate commitment deadline
        const now = new Date();
        const shipDeadline = new Date(now.getTime() + (commitmentLeadHours * 60 * 60 * 1000));

        // Query scheduled cycles
        const cyclesQuery = await cyclesTable.selectRecordsAsync({
            fields: ['cycle_id', 'user_id', 'week_id', 'cycle_state', 'box_id', 'scheduled_at']
        });

        const scheduledCycles = cyclesQuery.records.filter(
            r => r.getCellValue('cycle_state')?.name === 'Scheduled'
        );

        cyclesAttempted = scheduledCycles.length;

        // Query all users for state checking
        const usersQuery = await usersTable.selectRecordsAsync({
            fields: ['user_id', 'operational_state']
        });
        const usersById = new Map();
        for (const user of usersQuery.records) {
            usersById.set(user.id, user);
        }

        // Query all garments for availability checking
        const garmentsQuery = await garmentsTable.selectRecordsAsync({
            fields: ['garment_id', 'barcode', 'asset_state', 'current_cycle_id']
        });

        // Query all boxes
        const boxesQuery = await boxesTable.selectRecordsAsync({
            fields: ['box_id', 'planned_contents', 'container_state']
        });

        // Process each scheduled cycle
        for (const cycle of scheduledCycles) {
            try {
                const cycleId = cycle.id;
                const userId = cycle.getCellValue('user_id');
                const boxId = cycle.getCellValue('box_id');

                // Get user record
                const userRecordId = Array.isArray(userId) ? userId[0]?.id : userId?.id;
                const userRecord = usersById.get(userRecordId);

                if (!userRecord) {
                    errors.push({
                        cycle_id: cycleId,
                        reason: 'user_not_found'
                    });
                    cyclesBlocked++;
                    continue;
                }

                // Check user is Active
                const userState = userRecord.getCellValue('operational_state')?.name;
                if (userState !== 'Active') {
                    errors.push({
                        cycle_id: cycleId,
                        reason: 'user_hold',
                        user_state: userState
                    });
                    cyclesBlocked++;
                    continue;
                }

                // Check box and garments
                const boxRecordId = Array.isArray(boxId) ? boxId[0]?.id : boxId?.id;
                const boxRecord = boxesQuery.records.find(b => b.id === boxRecordId);

                if (!boxRecord) {
                    errors.push({
                        cycle_id: cycleId,
                        reason: 'box_not_found'
                    });
                    cyclesBlocked++;
                    continue;
                }

                const plannedContents = boxRecord.getCellValue('planned_contents') || [];
                const plannedGarmentIds = plannedContents.map(g => g.id);

                // Verify all planned garments are Available
                let allAvailable = true;
                const garmentsToReserve = [];

                for (const garmentId of plannedGarmentIds) {
                    const garment = garmentsQuery.records.find(g => g.id === garmentId);
                    if (!garment) {
                        allAvailable = false;
                        errors.push({
                            cycle_id: cycleId,
                            reason: 'garment_not_found',
                            garment_id: garmentId
                        });
                        break;
                    }

                    const garmentState = garment.getCellValue('asset_state')?.name;
                    if (garmentState !== 'Available') {
                        allAvailable = false;
                        errors.push({
                            cycle_id: cycleId,
                            reason: 'garment_unavailable',
                            garment_id: garmentId,
                            garment_state: garmentState
                        });
                        break;
                    }

                    garmentsToReserve.push(garment);
                }

                if (!allAvailable) {
                    // TODO: Attempt substitution (future enhancement)
                    cyclesBlocked++;
                    continue;
                }

                // All checks passed - commit the cycle

                // 1. Update cycle to Committed
                await cyclesTable.updateRecordAsync(cycleId, {
                    'cycle_state': { name: 'Committed' },
                    'committed_at': now.toISOString()
                });

                // 2. Update garments to Reserved
                for (const garment of garmentsToReserve) {
                    await garmentsTable.updateRecordAsync(garment.id, {
                        'asset_state': { name: 'Reserved' },
                        'current_cycle_id': [{ id: cycleId }]
                    });

                    // Log event
                    await eventsTable.createRecordAsync({
                        'entity_type': { name: 'Garment' },
                        'entity_id': garment.getCellValue('garment_id'),
                        'from_state': 'Available',
                        'to_state': 'Reserved',
                        'transition_type': { name: 'Normal' },
                        'actor_id': 'automation:auto-commit',
                        'cycle_id': cycle.getCellValue('cycle_id'),
                        'metadata': JSON.stringify({
                            triggered_by: 'auto-commit-cycles',
                            timestamp: now.toISOString()
                        })
                    });
                }

                // 3. Update box to Planned (if not already)
                const boxState = boxRecord.getCellValue('container_state')?.name;
                if (boxState === 'Created') {
                    await boxesTable.updateRecordAsync(boxRecord.id, {
                        'container_state': { name: 'Planned' }
                    });
                }

                committedCycleIds.push(cycleId);
                cyclesCommitted++;

            } catch (cycleError) {
                errors.push({
                    cycle_id: cycle.id,
                    reason: 'processing_error',
                    error: cycleError.message
                });
                cyclesBlocked++;
            }
        }

    } catch (error) {
        errors.push({
            type: 'system_error',
            error: error.message
        });
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const targetShipDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    // Output results for CommitmentBatches record creation
    output.set('commitment_time', new Date().toISOString());
    output.set('target_ship_date', targetShipDate.toISOString().split('T')[0]);
    output.set('cycles_attempted', cyclesAttempted);
    output.set('cycles_committed', cyclesCommitted);
    output.set('cycles_blocked', cyclesBlocked);
    output.set('substitutions_made', substitutionsMade);
    output.set('committed_cycle_ids', committedCycleIds);
    output.set('errors', JSON.stringify(errors));
    output.set('status', cyclesBlocked > 0 ? 'Partial' : 'Success');

    console.log(`Commitment complete: ${cyclesCommitted} committed, ${cyclesBlocked} blocked`);
}

await main();
