/**
 * callie CLI - Main CLI Controller
 */

import { init } from './commands/init.js';
import { dev } from './commands/dev.js';
import { start } from './commands/start.js';
import { build } from './commands/build.js';

const VERSION = '1.0.0';

const HELP = `
  🌸 callie.js - The Lightweight JS Framework

  Usage:
    callie <command> [options]

  Commands:
    init <name>    Create a new callie project
    dev            Start development server with hot reload
    start          Start production server
    build          Build/prepare for production

  Options:
    -h, --help     Show this help message
    -v, --version  Show version number

  Examples:
    callie init my-api
    callie dev
    callie dev --port 4000
    callie start
`;

export class CLI {
    constructor() {
        this.args = process.argv.slice(2);
        this.command = this.args[0];
        this.options = this.parseOptions();
    }

    parseOptions() {
        const options = {};

        for (let i = 0; i < this.args.length; i++) {
            const arg = this.args[i];

            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                const nextArg = this.args[i + 1];

                if (nextArg && !nextArg.startsWith('-')) {
                    options[key] = nextArg;
                    i++;
                } else {
                    options[key] = true;
                }
            } else if (arg.startsWith('-')) {
                const key = arg.slice(1);
                options[key] = true;
            }
        }

        return options;
    }

    async run() {
        // Handle help and version flags
        if (this.options.h || this.options.help || !this.command) {
            this.showHelp();
            return;
        }

        if (this.options.v || this.options.version) {
            console.log(`callie.js v${VERSION}`);
            return;
        }

        // Execute command
        try {
            switch (this.command) {
                case 'init':
                    await init(this.args[1], this.options);
                    break;

                case 'dev':
                    await dev(this.options);
                    break;

                case 'start':
                    await start(this.options);
                    break;

                case 'build':
                    await build(this.options);
                    break;

                default:
                    console.error(`Unknown command: ${this.command}`);
                    this.showHelp();
                    process.exit(1);
            }
        } catch (err) {
            console.error(`\n❌ Error: ${err.message}`);
            if (this.options.debug) {
                console.error(err.stack);
            }
            process.exit(1);
        }
    }

    showHelp() {
        console.log(HELP);
    }
}
