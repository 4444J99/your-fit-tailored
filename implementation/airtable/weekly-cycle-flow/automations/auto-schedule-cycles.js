/**
 * Airtable Automation Script: Auto-Schedule Cycles
 *
 * Trigger: Time-based, every Sunday at 18:00 (configurable)
 * Action: Create Scheduled cycles for all Active users for the upcoming week
 *
 * This script:
 * 1. Queries all users in Active state
 * 2. Calculates the target week_id based on user's weekly_anchor
 * 3. Checks if a cycle already exists for user+week
 * 4. Creates new cycles for users who don't have one
 * 5. Logs results to SchedulingJobs table
 */

// Configuration
const USERS_TABLE = 'Users';
const CYCLES_TABLE = 'Cycles';
const CONFIG_TABLE = 'Configuration';

// Helper function to calculate week_id from date
function getWeekId(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// Helper function to get next occurrence of a weekday
function getNextWeekday(dayName, fromDate) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(dayName);
    const currentDay = fromDate.getDay();

    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) {
        daysUntil += 7; // Get next week's occurrence
    }

    const nextDate = new Date(fromDate);
    nextDate.setDate(fromDate.getDate() + daysUntil);
    return nextDate;
}

// Main execution
async function main() {
    const startTime = Date.now();
    const errors = [];

    let usersEligible = 0;
    let cyclesCreated = 0;
    let cyclesSkipped = 0;

    try {
        // Get tables
        const usersTable = base.getTable(USERS_TABLE);
        const cyclesTable = base.getTable(CYCLES_TABLE);

        // Query Active users
        const usersQuery = await usersTable.selectRecordsAsync({
            fields: ['user_id', 'display_name', 'operational_state', 'weekly_anchor']
        });

        const activeUsers = usersQuery.records.filter(
            r => r.getCellValue('operational_state')?.name === 'Active'
        );
        usersEligible = activeUsers.length;

        // Query existing cycles to check for duplicates
        const cyclesQuery = await cyclesTable.selectRecordsAsync({
            fields: ['user_id', 'week_id', 'cycle_state']
        });

        // Build lookup of existing cycles by user_week_key
        const existingCycles = new Set();
        for (const cycle of cyclesQuery.records) {
            const userId = cycle.getCellValue('user_id');
            const weekId = cycle.getCellValue('week_id');
            if (userId && weekId) {
                // Handle linked record - get the first linked record's ID
                const userIdValue = Array.isArray(userId) ? userId[0]?.id : userId?.id || userId;
                existingCycles.add(`${userIdValue}-${weekId}`);
            }
        }

        // Process each active user
        const today = new Date();
        const cyclesToCreate = [];

        for (const user of activeUsers) {
            try {
                const userId = user.id;
                const anchor = user.getCellValue('weekly_anchor')?.name || 'Monday';

                // Calculate target delivery date (next occurrence of anchor day)
                const targetDate = getNextWeekday(anchor, today);
                const targetWeekId = getWeekId(targetDate);

                // Check if cycle exists
                const userWeekKey = `${userId}-${targetWeekId}`;
                if (existingCycles.has(userWeekKey)) {
                    cyclesSkipped++;
                    continue;
                }

                // Prepare cycle record
                cyclesToCreate.push({
                    fields: {
                        'user_id': [{ id: userId }],
                        'week_id': targetWeekId,
                        'cycle_state': { name: 'Scheduled' },
                        'scheduled_at': today.toISOString()
                    }
                });

            } catch (userError) {
                errors.push({
                    user_id: user.id,
                    error: userError.message
                });
            }
        }

        // Batch create cycles (Airtable limit: 50 per batch)
        const batchSize = 50;
        for (let i = 0; i < cyclesToCreate.length; i += batchSize) {
            const batch = cyclesToCreate.slice(i, i + batchSize);
            await cyclesTable.createRecordsAsync(batch);
            cyclesCreated += batch.length;
        }

    } catch (error) {
        errors.push({
            type: 'system_error',
            error: error.message
        });
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const targetWeekId = getWeekId(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    // Output results for SchedulingJobs record creation
    output.set('run_time', new Date().toISOString());
    output.set('target_week_id', targetWeekId);
    output.set('users_eligible', usersEligible);
    output.set('cycles_created', cyclesCreated);
    output.set('cycles_skipped', cyclesSkipped);
    output.set('errors', JSON.stringify(errors));
    output.set('duration_seconds', durationSeconds);
    output.set('status', errors.length > 0 ? 'Partial' : 'Success');

    console.log(`Scheduling complete: ${cyclesCreated} created, ${cyclesSkipped} skipped, ${errors.length} errors`);
}

await main();
