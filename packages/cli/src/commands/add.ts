import logger from "src/logger";
import path from 'path'
import fs from 'fs-extra';
import getUserPackageManager from 'src/utils/get-user-package-manager'
import execa from "execa";

const { command: execaCommand } = execa

export async function add(packages: string[]) {
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
}