
import 'dotenv/config';
import { db } from './src/index.js';

async function checkTables() {
    console.log('Checking database tables...');
    await db.connect();

    try {
        const result = await db.raw('SHOW TABLES');
        console.log('Tables:', result.map(r => Object.values(r)[0]));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTables();
