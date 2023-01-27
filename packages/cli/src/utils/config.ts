import { AppConfig, ModulesConfig } from '../../../core/src/types.js'
import path from 'path'
import fs from 'fs-extra'
import { getPathToConfigDir } from './project.js'
import { MANDATORY_CONFIG_FILES } from './consts.js'
 
export async function readConfigs() {
    const configDirectory = getPathToConfigDir() 
    
    const configFilesToTry = [
        ...MANDATORY_CONFIG_FILES
    ]

    const configs = await Promise.all(
        configFilesToTry
            .map(fileName => {
                const filePath = path.join(configDirectory, fileName)
                const exists = fs.existsSync(filePath)

                // If mandatory file is absent
                // throw exception
                if (MANDATORY_CONFIG_FILES.includes(fileName) && !exists) {
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
