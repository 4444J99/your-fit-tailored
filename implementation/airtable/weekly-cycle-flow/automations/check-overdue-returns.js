/**
 * Airtable Automation Script: Check Overdue Returns
 *
 * Trigger: Time-based, daily at 09:00
 * Action: Check for overdue returns and apply escalations
 *
 * This script handles:
 * 1. Creates escalation reminders at configured thresholds
 * 2. Applies HoldLogistics to users at hold threshold
 * 3. Declares garments as Lost at loss threshold
 */

// Configuration
const CYCLES_TABLE = 'Cycles';
const USERS_TABLE = 'Users';
const GARMENTS_TABLE = 'Garments';
const EVENTS_TABLE = 'Events';
const REMINDERS_TABLE = 'ReturnReminders';
const CONFIG_TABLE = 'Configuration';

// Defaults
const DEFAULT_REMINDER_DAY_2 = 3;
const DEFAULT_HOLD_THRESHOLD = 7;
const DEFAULT_LOSS_THRESHOLD = 14;
const DEFAULT_RETURN_WINDOW_DAYS = 2;
const DEFAULT_WEAR_WINDOW_DAYS = 5;

// Main execution
async function main() {
    const now = new Date();
    let remindersCreated = 0;
    let holdsApplied = 0;
    let lossesDeclarad = 0;
    const errors = [];

    try {
        // Get tables
        const cyclesTable = base.getTable(CYCLES_TABLE);
        const usersTable = base.getTable(USERS_TABLE);
        const garmentsTable = base.getTable(GARMENTS_TABLE);
        const eventsTable = base.getTable(EVENTS_TABLE);
        const remindersTable = base.getTable(REMINDERS_TABLE);

        // Load configuration
        let reminderDay2 = DEFAULT_REMINDER_DAY_2;
        let holdThreshold = DEFAULT_HOLD_THRESHOLD;
        let lossThreshold = DEFAULT_LOSS_THRESHOLD;
        let wearWindowDays = DEFAULT_WEAR_WINDOW_DAYS;
        let returnWindowDays = DEFAULT_RETURN_WINDOW_DAYS;

        try {
            const configTable = base.getTable(CONFIG_TABLE);
            const configQuery = await configTable.selectRecordsAsync({
                fields: ['config_key', 'config_value']
            });

            for (const config of configQuery.records) {
                const key = config.getCellValue('config_key');
                const value = parseInt(config.getCellValue('config_value'));

                switch (key) {
                    case 'reminder_day_2': reminderDay2 = value; break;
                    case 'hold_threshold_days': holdThreshold = value; break;
                    case 'loss_threshold_days': lossThreshold = value; break;
                    case 'wear_window_days': wearWindowDays = value; break;
                    case 'return_window_days': returnWindowDays = value; break;
                }
            }
        } catch (e) {
            console.log('Using default thresholds');
        }

        // Query cycles in ReturnWindowOpen state
        const cyclesQuery = await cyclesTable.selectRecordsAsync({
            fields: ['cycle_id', 'user_id', 'cycle_state', 'delivered_at', 'box_id']
        });

        const returnWindowCycles = cyclesQuery.records.filter(
            r => r.getCellValue('cycle_state')?.name === 'ReturnWindowOpen'
        );

        // Query existing reminders to avoid duplicates
        const remindersQuery = await remindersTable.selectRecordsAsync({
            fields: ['cycle_id', 'escalation_level', 'status']
        });

        // Query users for state updates
        const usersQuery = await usersTable.selectRecordsAsync({
            fields: ['user_id', 'operational_state']
        });
        const usersById = new Map();
        for (const user of usersQuery.records) {
            usersById.set(user.id, user);
        }

        // Query garments for loss processing
        const garmentsQuery = await garmentsTable.selectRecordsAsync({
            fields: ['garment_id', 'asset_state', 'current_cycle_id']
        });

        // Process each cycle in return window
        for (const cycle of returnWindowCycles) {
            try {
                const deliveredAt = cycle.getCellValue('delivered_at');
                if (!deliveredAt) continue;

                // Calculate days overdue
                const deliveryDate = new Date(deliveredAt);
                const wearEnd = new Date(deliveryDate);
                wearEnd.setDate(wearEnd.getDate() + wearWindowDays);
                const returnEnd = new Date(wearEnd);
                returnEnd.setDate(returnEnd.getDate() + returnWindowDays);

                const daysOverdue = Math.floor((now - returnEnd) / (24 * 60 * 60 * 1000));

                if (daysOverdue <= 0) continue; // Not overdue

                const cycleId = cycle.id;
                const userId = cycle.getCellValue('user_id');
                const userRecordId = Array.isArray(userId) ? userId[0]?.id : userId?.id;

                // Check existing reminders for this cycle
                const cycleReminders = remindersQuery.records.filter(r => {
                    const reminderCycle = r.getCellValue('cycle_id');
                    const cycleRefId = Array.isArray(reminderCycle)
                        ? reminderCycle[0]?.id
                        : reminderCycle?.id;
                    return cycleRefId === cycleId;
                });

                const hasLevel2 = cycleReminders.some(
                    r => r.getCellValue('escalation_level') === 2
                );
                const hasLevel3 = cycleReminders.some(
                    r => r.getCellValue('escalation_level') === 3
                );

                // -----------------------------------------------------------
                // Check for Loss Threshold (highest priority)
                // -----------------------------------------------------------
                if (daysOverdue >= lossThreshold) {
                    // Declare garments as Lost
                    const cycleGarments = garmentsQuery.records.filter(g => {
                        const currentCycle = g.getCellValue('current_cycle_id');
                        const cycleRefId = Array.isArray(currentCycle)
                            ? currentCycle[0]?.id
                            : currentCycle?.id;
                        return cycleRefId === cycleId;
                    });

                    for (const garment of cycleGarments) {
                        const currentState = garment.getCellValue('asset_state')?.name;
                        if (currentState !== 'Lost') {
                            await garmentsTable.updateRecordAsync(garment.id, {
                                'asset_state': { name: 'Lost' }
                            });

                            await eventsTable.createRecordAsync({
                                'entity_type': { name: 'Garment' },
                                'entity_id': garment.getCellValue('garment_id'),
                                'from_state': currentState,
                                'to_state': 'Lost',
                                'transition_type': { name: 'Normal' },
                                'actor_id': 'automation:overdue-check',
                                'cycle_id': cycle.getCellValue('cycle_id'),
                                'metadata': JSON.stringify({
                                    reason: 'loss_threshold_exceeded',
                                    days_overdue: daysOverdue,
                                    timestamp: now.toISOString()
                                })
                            });

                            lossesDeclarad++;
                        }
                    }

                    // Log cycle exception event
                    await eventsTable.createRecordAsync({
                        'entity_type': { name: 'Cycle' },
                        'entity_id': cycle.getCellValue('cycle_id'),
                        'from_state': 'ReturnWindowOpen',
                        'to_state': 'ReturnWindowOpen',
                        'transition_type': { name: 'Normal' },
                        'actor_id': 'automation:overdue-check',
                        'metadata': JSON.stringify({
                            event_type: 'LossDeclaration',
                            days_overdue: daysOverdue,
                            timestamp: now.toISOString()
                        })
                    });

                    continue; // Skip other escalations
                }

                // -----------------------------------------------------------
                // Check for Hold Threshold
                // -----------------------------------------------------------
                if (daysOverdue >= holdThreshold) {
                    const userRecord = usersById.get(userRecordId);
                    if (userRecord) {
                        const currentState = userRecord.getCellValue('operational_state')?.name;
                        if (currentState === 'Active') {
                            await usersTable.updateRecordAsync(userRecordId, {
                                'operational_state': { name: 'HoldLogistics' }
                            });

                            await eventsTable.createRecordAsync({
                                'entity_type': { name: 'User' },
                                'entity_id': userRecord.getCellValue('user_id'),
                                'from_state': 'Active',
                                'to_state': 'HoldLogistics',
                                'transition_type': { name: 'Normal' },
                                'actor_id': 'automation:overdue-check',
                                'metadata': JSON.stringify({
                                    reason: 'late_return',
                                    days_overdue: daysOverdue,
                                    cycle_id: cycle.getCellValue('cycle_id'),
                                    timestamp: now.toISOString()
                                })
                            });

                            holdsApplied++;
                        }
                    }

                    // Create level 3 reminder (final warning) if not exists
                    if (!hasLevel3) {
                        await remindersTable.createRecordAsync({
                            'cycle_id': [{ id: cycleId }],
                            'user_id': [{ id: userRecordId }],
                            'escalation_level': 3,
                            'scheduled_for': now.toISOString(),
                            'status': { name: 'Pending' }
                        });
                        remindersCreated++;
                    }

                    continue;
                }

                // -----------------------------------------------------------
                // Check for Level 2 Reminder
                // -----------------------------------------------------------
                if (daysOverdue >= reminderDay2 && !hasLevel2) {
                    await remindersTable.createRecordAsync({
                        'cycle_id': [{ id: cycleId }],
                        'user_id': [{ id: userRecordId }],
                        'escalation_level': 2,
                        'scheduled_for': now.toISOString(),
                        'status': { name: 'Pending' }
                    });
                    remindersCreated++;
                }

            } catch (error) {
                errors.push({
                    cycle_id: cycle.id,
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
    output.set('reminders_created', remindersCreated);
    output.set('holds_applied', holdsApplied);
    output.set('losses_declared', lossesDeclarad);
    output.set('errors', JSON.stringify(errors));

    console.log(`Overdue check: ${remindersCreated} reminders, ${holdsApplied} holds, ${lossesDeclarad} losses, ${errors.length} errors`);
}

await main();
