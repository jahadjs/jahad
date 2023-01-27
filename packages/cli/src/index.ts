#!/usr/bin/env node

import { Command } from "commander";
import { add, dev } from './commands'

const program = new Command('jahad')

program
    .description('CLI to manage Project Jahad applications')
    .version('0.0.1')

program
    .command('dev')
    .description('Start app in dev mode')
    .action(dev)

program
    .command('add')
    .argument('<packages...>', 'Packages to add')
    .description('Add packages to the project')
    .action(add)

program.parse()
