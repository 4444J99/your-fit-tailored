/**
 * Airtable Automation Script: Auto-Progress Wear Window
 *
 * Trigger: Time-based, hourly
 * Action: Progress cycles through wear window stages automatically
 *
 * This script handles two transitions:
 * 1. Delivered → WearWindowOpen (immediate after delivery)
 * 2. WearWindowOpen → ReturnWindowOpen (after wear_window_days)
 *
 * Also creates ReturnReminders when return window opens.
 */

// Configuration
const CYCLES_TABLE = 'Cycles';
const GARMENTS_TABLE = 'Garments';
const BOXES_TABLE = 'Boxes';
const EVENTS_TABLE = 'Events';
const REMINDERS_TABLE = 'ReturnReminders';
const CONFIG_TABLE = 'Configuration';

// Defaults
const DEFAULT_WEAR_WINDOW_DAYS = 5;

// Main execution
async function main() {
    const now = new Date();
    let deliveredToWear = 0;
    let wearToReturn = 0;
    let remindersCreated = 0;
    const errors = [];

    try {
        // Get tables
        const cyclesTable = base.getTable(CYCLES_TABLE);
        const garmentsTable = base.getTable(GARMENTS_TABLE);
        const eventsTable = base.getTable(EVENTS_TABLE);
        const remindersTable = base.getTable(REMINDERS_TABLE);

        // Get wear window days from config
        let wearWindowDays = DEFAULT_WEAR_WINDOW_DAYS;
        try {
            const configTable = base.getTable(CONFIG_TABLE);
            const configQuery = await configTable.selectRecordsAsync({
                fields: ['config_key', 'config_value']
            });
            const wearConfig = configQuery.records.find(
                r => r.getCellValue('config_key') === 'wear_window_days'
            );
            if (wearConfig) {
                wearWindowDays = parseInt(wearConfig.getCellValue('config_value')) || DEFAULT_WEAR_WINDOW_DAYS;
            }
        } catch (e) {
            console.log('Using default wear window days');
        }

        // Query all cycles
        const cyclesQuery = await cyclesTable.selectRecordsAsync({
            fields: ['cycle_id', 'user_id', 'cycle_state', 'delivered_at', 'box_id']
        });

        // Query garments for state updates
        const garmentsQuery = await garmentsTable.selectRecordsAsync({
            fields: ['garment_id', 'asset_state', 'current_cycle_id']
        });

        // -----------------------------------------------------------
        // Transition 1: Delivered → WearWindowOpen
        // -----------------------------------------------------------
        const deliveredCycles = cyclesQuery.records.filter(
            r => r.getCellValue('cycle_state')?.name === 'Delivered'
        );

        for (const cycle of deliveredCycles) {
            try {
                const deliveredAt = cycle.getCellValue('delivered_at');
                if (!deliveredAt) {
                    continue; // Skip if no delivery timestamp
                }

                // Transition cycle to WearWindowOpen
                await cyclesTable.updateRecordAsync(cycle.id, {
                    'cycle_state': { name: 'WearWindowOpen' }
                });

                // Transition garments to InUse
                const cycleLinkedGarments = garmentsQuery.records.filter(g => {
                    const currentCycle = g.getCellValue('current_cycle_id');
                    const cycleRecordId = Array.isArray(currentCycle)
                        ? currentCycle[0]?.id
                        : currentCycle?.id;
                    return cycleRecordId === cycle.id;
                });

                for (const garment of cycleLinkedGarments) {
                    const currentState = garment.getCellValue('asset_state')?.name;
                    if (currentState === 'Delivered' || currentState === 'Packed') {
                        await garmentsTable.updateRecordAsync(garment.id, {
                            'asset_state': { name: 'InUse' }
                        });

                        // Log event
                        await eventsTable.createRecordAsync({
                            'entity_type': { name: 'Garment' },
                            'entity_id': garment.getCellValue('garment_id'),
                            'from_state': currentState,
                            'to_state': 'InUse',
                            'transition_type': { name: 'Normal' },
                            'actor_id': 'automation:wear-window',
                            'cycle_id': cycle.getCellValue('cycle_id'),
                            'metadata': JSON.stringify({
                                triggered_by: 'auto-progress-wear-window',
                                timestamp: now.toISOString()
                            })
                        });
                    }
                }

                deliveredToWear++;

            } catch (error) {
                errors.push({
                    cycle_id: cycle.id,
                    transition: 'delivered-to-wear',
                    error: error.message
                });
            }
        }

        // -----------------------------------------------------------
        // Transition 2: WearWindowOpen → ReturnWindowOpen
        // -----------------------------------------------------------
        const wearWindowCycles = cyclesQuery.records.filter(
            r => r.getCellValue('cycle_state')?.name === 'WearWindowOpen'
        );

        for (const cycle of wearWindowCycles) {
            try {
                const deliveredAt = cycle.getCellValue('delivered_at');
                if (!deliveredAt) {
                    continue;
                }

                // Calculate wear window end
                const deliveryDate = new Date(deliveredAt);
                const wearWindowEnd = new Date(deliveryDate);
                wearWindowEnd.setDate(wearWindowEnd.getDate() + wearWindowDays);

                // Check if wear window has ended
                if (now < wearWindowEnd) {
                    continue; // Wear window still open
                }

                // Transition to ReturnWindowOpen
                await cyclesTable.updateRecordAsync(cycle.id, {
                    'cycle_state': { name: 'ReturnWindowOpen' }
                });

                // Create ReturnReminder (level 1)
                const userId = cycle.getCellValue('user_id');
                const userRecordId = Array.isArray(userId) ? userId[0]?.id : userId?.id;

                const reminderDate = new Date(now);
                reminderDate.setDate(reminderDate.getDate() + 1); // Schedule for tomorrow

                await remindersTable.createRecordAsync({
                    'cycle_id': [{ id: cycle.id }],
                    'user_id': [{ id: userRecordId }],
                    'escalation_level': 1,
                    'scheduled_for': reminderDate.toISOString(),
                    'status': { name: 'Pending' }
                });

                wearToReturn++;
                remindersCreated++;

            } catch (error) {
                errors.push({
                    cycle_id: cycle.id,
                    transition: 'wear-to-return',
                    error: error.message
                });
            }
        }

    } catch (error) {
        errors.push({
            type: 'system_error',
            error: error.message
        });
    }

    // Output summary
    output.set('delivered_to_wear', deliveredToWear);
    output.set('wear_to_return', wearToReturn);
    output.set('reminders_created', remindersCreated);
    output.set('errors', JSON.stringify(errors));

    console.log(`Wear window progression: ${deliveredToWear} to wear, ${wearToReturn} to return, ${errors.length} errors`);
}

await main();
