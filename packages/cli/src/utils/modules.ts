import {
    getModulesDirPath
} from './project'
import { readdir, statSync, existsSync } from 'fs-extra'
import path from 'path'
import { RESERVED_FILES } from './consts'
import { getPathToCompiledModulesDir } from "src/utils/project";

const files = [
    RESERVED_FILES.MODULE
] as const

const fileResolvers = {
    [RESERVED_FILES.MODULE]: {
        fileName: RESERVED_FILES.MODULE,
        modulePath: '',
        async resolve() {
            
        }
    }
}

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

export async function getListOfModulesPathsToLoad() {
    const validModules = (await getListOfModulesDirs())
        .filter(
            modulePath => isModuleValid(modulePath)
        )

    return validModules
}

export async function compileModules() {
    const modulesToCompile = await getListOfModulesPathsToLoad()

    await Promise.all(
        modulesToCompile
            .map(compileModule)
    )
}

export function createFileResolver(modulePath: string, fileName: string) {
    const resolver = {
        ...fileResolvers[RESERVED_FILES.MODULE],
        modulePath
    }

    return resolver.resolve()
}

export async function compileModule(modulePath: string) {
    await Promise.all(
        files.map((file) => createFileResolver(modulePath, file))
    )
}

