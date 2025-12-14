/**
 * callie CLI - build command
 * Prepares the application for production deployment
 * 
 * For callie.js, "build" is mostly a no-op since we don't bundle.
 * This command validates the project and copies necessary files.
 */

import fs from 'node:fs';
import path from 'node:path';

export async function build(options = {}) {
    const outputDir = options.output || 'dist';

    console.log(`\n🔨 Building callie application for production...\n`);

    // Validation checks
    const checks = [
        checkPackageJson,
        checkEnvExample,
        checkEntryFile,
        checkDependencies
    ];

    let hasErrors = false;

    for (const check of checks) {
        const result = await check();
        if (!result.passed) {
            console.log(`  ❌ ${result.message}`);
            hasErrors = true;
        } else {
            console.log(`  ✅ ${result.message}`);
        }
    }

    if (hasErrors) {
        console.log(`\n⚠️  Build completed with warnings. Please fix the issues above.\n`);
    } else {
        console.log(`\n✅ Build validation passed!\n`);
    }

    // Production tips
    console.log(`📋 Production Deployment Checklist:`);
    console.log(`   1. Set NODE_ENV=production in your .env`);
    console.log(`   2. Use a strong JWT_SECRET`);
    console.log(`   3. Configure your MySQL connection`);
    console.log(`   4. Set up a process manager (PM2, systemd, etc.)`);
    console.log(`   5. Configure reverse proxy (nginx, Apache)`);
    console.log(`\n`);

    // Generate deployment script if requested
    if (options.script) {
        generateDeploymentScript(outputDir);
    }
}

async function checkPackageJson() {
    const exists = fs.existsSync(path.join(process.cwd(), 'package.json'));
    return {
        passed: exists,
        message: exists ? 'package.json found' : 'package.json not found'
    };
}

async function checkEnvExample() {
    const hasEnvExample = fs.existsSync(path.join(process.cwd(), '.env.example'));
    const hasEnv = fs.existsSync(path.join(process.cwd(), '.env'));

    if (!hasEnvExample && !hasEnv) {
        return {
            passed: false,
            message: 'No .env or .env.example found - configuration may be missing'
        };
    }

    return {
        passed: true,
        message: hasEnvExample ? '.env.example found' : '.env found (remember not to commit this!)'
    };
}

async function checkEntryFile() {
    const candidates = ['index.js', 'app.js', 'server.js'];
    const found = candidates.find(f => fs.existsSync(path.join(process.cwd(), f)));

    return {
        passed: !!found,
        message: found ? `Entry file found: ${found}` : 'No entry file found (index.js, app.js, or server.js)'
    };
}

async function checkDependencies() {
    try {
        const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
        const deps = pkg.dependencies || {};

        const required = ['dotenv'];
        const missing = required.filter(d => !deps[d] && !deps['callie']);

        if (missing.length > 0) {
            return {
                passed: false,
                message: `Missing dependencies: ${missing.join(', ')}`
            };
        }

        return {
            passed: true,
            message: 'Dependencies look good'
        };
    } catch {
        return {
            passed: false,
            message: 'Could not read package.json'
        };
    }
}

function generateDeploymentScript(outputDir) {
    const script = `#!/bin/bash
# Deployment script for callie.js application

echo "🚀 Deploying callie application..."

# Install dependencies
npm ci --production

# Run database migrations (if any)
# mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/schema.sql

# Start with PM2
pm2 start index.js --name "callie-app" -i max

echo "✅ Deployment complete!"
`;

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'deploy.sh'), script);
    console.log(`\n📄 Generated deployment script: ${outputDir}/deploy.sh`);
}
