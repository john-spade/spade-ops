#!/usr/bin/env node

/**
 * callie CLI - Command Line Interface for callie.js
 * 
 * Commands:
 *   callie init <project-name>  - Create a new callie project
 *   callie dev                  - Start development server with hot reload
 *   callie start                - Start production server
 *   callie build                - Build for production (optional bundling)
 */

import { CLI } from '../src/cli/cli.js';

const cli = new CLI();
cli.run();
