import {
    appendModuleAccumulator,
    createModuleAccumulatorAssignment,
    createCompiledModuleDir,
    createImportStatement,
    createModuleIndexFile,
    emptyJahadDir,
    ensureJahadDir,
    exportModuleAccumulator,
    getModulesDirPath, getPathToCompiledIndex, stripFileExtension, appendMainIndex, createMainIndexFile, initCoreInMainIndex, createModuleRegistrationCode
} from './project'
import { readdir, statSync, existsSync, appendFile } from 'fs-extra'
import path from 'path'
import { RESERVED_FILES } from './consts'

const files = [
    RESERVED_FILES.MODULE
] as const

const fileResolvers = {
    [RESERVED_FILES.MODULE]: {
        fileName: RESERVED_FILES.MODULE,
        modulePath: '',
        moduleName: '',
        async resolve() {
            await appendFile(
                getPathToCompiledIndex(this.moduleName),
                createImportStatement(
                    'moduleDeclaration',
                    this.moduleName,
                    stripFileExtension(this.fileName)
                ),
                {
                    encoding: 'utf-8'
                }
            )

            await appendFile(
                getPathToCompiledIndex(this.moduleName),
                createModuleAccumulatorAssignment('moduleDeclaration'),
                {
                    encoding: 'utf-8'
                }
            )
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
        modulePath,
        moduleName: path.basename(modulePath)
    }

    return resolver.resolve()
}

export async function compileModule(modulePath: string) {
    await createCompiledModuleDir(modulePath)
    await createModuleIndexFile(modulePath)
    await appendModuleAccumulator(modulePath)

    await Promise.all(
        files.map((file) => createFileResolver(modulePath, file))
    )

    await exportModuleAccumulator(modulePath)
    await appendMainIndex(
        createModuleRegistrationCode(modulePath)
    )
}

