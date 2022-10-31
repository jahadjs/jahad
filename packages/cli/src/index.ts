#!/usr/bin/env node
import { Command } from "commander";
import logger from "src/logger.js";

const program = new Command('jahad')

program
    .description('CLI to manage Project Jahad applications')
    .version('0.0.1')

program
    .command('dev')
    .description('Start app in dev mode')
    .action(() => {
        logger.error('Not implemented')
    })

program.parse()