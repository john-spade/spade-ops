
import 'dotenv/config';
import { db } from './src/index.js';

async function checkColumns() {
    console.log('Checking table columns...');
    await db.connect();

    try {
        const applicants = await db.raw('DESCRIBE applicants');
        console.log('\nApplicants Columns:', applicants.map(c => c.Field));

        const clients = await db.raw('DESCRIBE clients');
        console.log('\nClients Columns:', clients.map(c => c.Field));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkColumns();
