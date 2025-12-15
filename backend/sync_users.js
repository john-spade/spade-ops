
import 'dotenv/config';
import { db, hashPassword } from './src/index.js';

async function syncUsers() {
    console.log('🔄 Syncing employees to users...');
    await db.connect();

    try {
        // Get employees without user_id
        const employees = await db.table('employees')
            .whereNull('user_id')
            .get();

        console.log(`Found ${employees.length} employees without user accounts.`);

        const defaultPassword = await hashPassword('password123');

        for (const emp of employees) {
            console.log(`Creating user for ${emp.first_name} ${emp.last_name}...`);

            // Check if email already used in users table (orphan user?)
            let userId;
            if (emp.email) {
                const existingUser = await db.table('users').where({ email: emp.email }).first();
                if (existingUser) {
                    console.log(`  - User already exists for email ${emp.email}. Linking...`);
                    userId = existingUser.id;
                }
            }

            if (!userId) {
                // Determine role
                let role = 'employee';
                if (emp.department && emp.department.toLowerCase() === 'admin') {
                    role = 'admin';
                }

                // Create user
                userId = await db.insert('users', {
                    name: `${emp.first_name} ${emp.last_name}`,
                    email: emp.email || `${emp.first_name.toLowerCase()}.${emp.last_name.toLowerCase()}@example.com`,
                    password: defaultPassword,
                    role: role
                });
                console.log(`  - User created (ID: ${userId})`);
            }

            // Update employee record
            await db.table('employees').where({ id: emp.id }).update({ user_id: userId });
        }

        console.log('✅ Sync complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncUsers();
