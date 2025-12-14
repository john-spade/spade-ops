/**
 * callie CLI - start command
 * Starts the production server
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

export async function start(options = {}) {
    const port = options.port || process.env.PORT || 3000;
    const entryFile = options.entry || findEntryFile();

    if (!entryFile) {
        throw new Error('No entry file found. Create index.js or specify with --entry');
    }

    console.log(`\n🚀 Starting callie production server...`);
    console.log(`   Entry: ${entryFile}`);
    console.log(`   Port: ${port}\n`);

    const child = spawn('node', [entryFile], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
            ...process.env,
            PORT: String(port),
            NODE_ENV: 'production'
        }
    });

    child.on('error', (err) => {
        console.error('Failed to start:', err.message);
        process.exit(1);
    });

    child.on('exit', (code) => {
        process.exit(code || 0);
    });

    // Handle signals
    process.on('SIGINT', () => {
        child.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        child.kill('SIGTERM');
    });
}

function findEntryFile() {
    const candidates = ['index.js', 'app.js', 'server.js', 'src/index.js'];

    for (const file of candidates) {
        if (fs.existsSync(path.join(process.cwd(), file))) {
            return file;
        }
    }

    return null;
}
