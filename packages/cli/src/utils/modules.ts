import {
    getModulesDirPath
} from './project'
import { readdir, statSync, existsSync } from 'fs-extra'
import path from 'path'
import { RESERVED_FILES } from './consts'

export const getListOfModulesDirs = async () => {
    const modulesDirPath = getModulesDirPath()
    
    return (await readdir(modulesDirPath))
        .filter(
            file => {
                const filePath = path.join(modulesDirPath, file);
                return statSync(filePath).isDirectory();
            }
        )
        .map(
            file => {
                return path.join(modulesDirPath, file)
            }
        )
}

export const getModuleIdentifier = (modulePath: string) => {
    return path.basename(modulePath)
}

export async function declarationExists(modulePath: string) {
    const declarationFilePath = path.join(modulePath, RESERVED_FILES.MODULE)

    if (!existsSync(declarationFilePath)) {
        return false
    }

    return false
}

export async function isModuleValid(modulePath: string) {
    const isValid = await Promise.all([
        declarationExists(modulePath)
    ])

    return isValid
}

export async function getListOfModulesToLoad() {
    const validModules = (await getListOfModulesDirs())
        .filter(
            modulePath => isModuleValid(modulePath)
        )

    return validModules
}

