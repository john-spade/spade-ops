
import 'dotenv/config';
import { db } from './src/index.js';

async function migrate() {
    console.log('Running migration...');
    await db.connect();

    try {
        console.log('Adding user_id to clients table...');
        await db.raw('ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id INT DEFAULT NULL');
        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
