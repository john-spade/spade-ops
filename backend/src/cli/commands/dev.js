/**
 * callie CLI - dev command
 * Starts the development server with hot reload
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

export async function dev(options = {}) {
    const port = options.port || process.env.PORT || 3000;
    const entryFile = options.entry || findEntryFile();

    if (!entryFile) {
        throw new Error('No entry file found. Create index.js or specify with --entry');
    }

    console.log(`\n🌸 Starting callie development server...`);
    console.log(`   Entry: ${entryFile}`);
    console.log(`   Port: ${port}\n`);

    // Check if nodemon is available
    const useNodemon = await checkNodemon();

    if (useNodemon) {
        // Use nodemon for hot reload
        const nodemonArgs = [
            entryFile,
            '--watch', '.',
            '--ext', 'js,json',
            '--ignore', 'node_modules/',
            '--ignore', '.git/',
            '--ignore', 'public/'
        ];

        const child = spawn('npx', ['nodemon', ...nodemonArgs], {
            cwd: process.cwd(),
            stdio: 'inherit',
            shell: true,
            env: {
                ...process.env,
                PORT: String(port),
                NODE_ENV: 'development'
            }
        });

        child.on('error', (err) => {
            console.error('Failed to start nodemon:', err.message);
            console.log('Falling back to node...');
            runWithNode(entryFile, port);
        });

        // Handle Ctrl+C
        process.on('SIGINT', () => {
            child.kill('SIGINT');
            process.exit(0);
        });

    } else {
        // Fall back to plain node
        console.log('📝 Note: Install nodemon for hot reload (npm i -D nodemon)\n');
        runWithNode(entryFile, port);
    }
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

async function checkNodemon() {
    try {
        // Check if nodemon is in node_modules
        const nodemonPath = path.join(process.cwd(), 'node_modules', '.bin', 'nodemon');
        return fs.existsSync(nodemonPath) || fs.existsSync(nodemonPath + '.cmd');
    } catch {
        return false;
    }
}

function runWithNode(entryFile, port) {
    const child = spawn('node', [entryFile], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
            ...process.env,
            PORT: String(port),
            NODE_ENV: 'development'
        }
    });

    child.on('error', (err) => {
        console.error('Failed to start:', err.message);
        process.exit(1);
    });

    process.on('SIGINT', () => {
        child.kill('SIGINT');
        process.exit(0);
    });
}
