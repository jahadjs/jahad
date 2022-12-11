#!/usr/bin/env node
import { Command } from "commander";
import { execaCommand } from "execa";
import logger from "src/logger.js";
import path from 'path'
import fs from 'fs-extra';
import getUserPackageManager from '../../create-jahad-app/src/get-user-package-manager.js'

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

program
    .command('add')
    .argument('<packages...>', 'Packages to add')
    .description('Add packages to the project')
    .action(async (packages: string[]) => {
        const packageManager = getUserPackageManager()
        const isYarn = packageManager === 'yarn'

        if (isYarn) {
            await execaCommand(
                `yarn add ${packages.join(' ')}`,
            )
        } else {
            await execaCommand(
                `${ packageManager } install ${packages.join(' ')}`,
            )
        }

        const modulesObjectRegex = /defineModulesConfig\((\{[^}]+\})\)/;
        const modulesConfigPath = path.join(process.cwd(), 'config', 'modules.ts');
        const modulesConfig = fs.readFileSync(
            modulesConfigPath,
            {
                encoding: 'utf-8'
            }
        )
        const match = modulesConfig.match(modulesObjectRegex)

        if (!match || !match.length || !match[1]) {
            logger.error('Could not find modules config')

            return;
        }

        const modulesObject = JSON.parse(match[1]);
        const newModulesObject = Object.assign(
            {},
            modulesObject,
            packages.reduce((acc, curr) => {
                return {
                    ...acc,
                    [curr]: true
                }}, {})
        )
        const newModulesConfig = modulesConfig.replace(
            modulesObjectRegex,
            `defineModulesConfig(${JSON.stringify(newModulesObject, null, 4)})`
        )

        fs.writeFileSync(
            modulesConfigPath,
            newModulesConfig,
            {
                encoding: 'utf-8'
            }
        )
    })

program.help()

program.parse()