import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    try {
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            multipleStatements: true
        });

        console.log('✅ Connected.');

        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema SQL...');
        // Execute the entire schema file
        await connection.query(schema);

        console.log('✅ Migration completed successfully! Tables created.');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error(error);
        process.exit(1);
    }
}

migrate();
