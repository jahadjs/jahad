import { AppConfig, ModulesConfig } from '../../../core/src/types.js'
import path from 'path'
import fs from 'fs-extra'
 
export default async function readConfigs() {
    const currentPath = process.cwd()
    const configDirectory = path.join(currentPath, 'config')
    const mandatoryConfigFiles = [
        'app.ts',
        'modules.ts'
    ]
    const configFilesToTry = [
        ...mandatoryConfigFiles
    ]

    const configs = await Promise.all(
        configFilesToTry
            .map(fileName => {
                const filePath = path.join(configDirectory, fileName)
                const exists = fs.existsSync(filePath)

                // If mandatory file is absent
                // throw exception
                if (mandatoryConfigFiles.includes(fileName) && !exists) {
                    throw new Error(
                            `Was not able to locate mandatory configuration file ${fileName}. Checked path: ${filePath}`
                        )
                }

                // if option config is absent
                // return promise that will resolve to null
                if (!exists) {
                    return new Promise((resolve) => resolve(null))
                }

                return import(filePath)
            })
    ) as [
        AppConfig,
        ModulesConfig
    ]


    return configs 
}
