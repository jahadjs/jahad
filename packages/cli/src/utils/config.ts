import { AppConfig, DbConfig, ModulesConfig } from '../../../core/src/types.js'
import { appendMainIndex, getPathToConfig, getPathToConfigDir, stripFileExtension } from './project.js'
import { MANDATORY_CONFIG_FILES, CORE_CONFIG_FILES } from './consts.js'
import { isDirectory, isFile } from './fs.js'
import fs from 'fs-extra'
import path from 'node:path'

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
        ModulesConfig,
        DbConfig
    ]

    return configs 
}

export async function validateConfig(config: string) {
    if (!(await isFile(getPathToConfig(config)))) {
        throw new Error(`Configuration file ${ config } can not be found`)
    }
}

export async function validateConfigDir() {
    if (!(await isDirectory(getPathToConfigDir()))) {
       throw new Error('config directory cannot be found')
    }
}

export async function validateConfigs() {
    await Promise.all(
        MANDATORY_CONFIG_FILES.map(validateConfig)
    )
}

export async function addConfigToMainIndex(config: string) {
    const importStatement = `import ${ stripFileExtension(config).replace('-', '_') } from "../config/${ stripFileExtension(config) }"\n`
    const configAssigment = `Object.assign(config, { ${ stripFileExtension(config).replace('-', '_') } })\n`

    await appendMainIndex(
        importStatement + configAssigment
    )
}

export async function addConfigsToMainIndex() {
    await appendMainIndex('const config = {}\n')

    await Promise.all(
        CORE_CONFIG_FILES.map(addConfigToMainIndex)
    )
}
