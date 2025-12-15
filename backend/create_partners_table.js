
import 'dotenv/config';
import { db } from './src/index.js';

async function migrate() {
    console.log('Running migration for partners table...');
    await db.connect();

    try {
        const query = `
            CREATE TABLE IF NOT EXISTS partners (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(100) DEFAULT 'Vendor',
                contact_person VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(50),
                services TEXT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

        await db.raw(query);
        console.log('✅ Partners table created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
