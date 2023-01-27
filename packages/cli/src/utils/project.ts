import path from 'path'
import { appendFile, emptyDir, ensureDir, ensureFile } from 'fs-extra'
import { COMPILED_DIR, COMPILED_MODULES_DIR, CONFIG_DIR, MODULES_DIR } from './consts'

export const getProjectRootPath = () => {
    // Currently we assume that CLI is invoked at the root of project
    return process.cwd()
}

export function getPathToConfigDir() {
    return path.join(
        getProjectRootPath(),
        CONFIG_DIR
    )
} 

export const getModulesDirPath = () => {
    const projectRoot = getProjectRootPath()

    return path.join(projectRoot, MODULES_DIR)
}

export const getPathToJahadDir = () => {
    return path.join(
        getProjectRootPath(),
        COMPILED_DIR
    )
}

export const getPathToCompiledModulesDir = () => {
    return path.join(
        getProjectRootPath(),
        COMPILED_MODULES_DIR
    )
}

export function getPathToCompiledModule(moduleName: string) {
    return path.join(
        getPathToCompiledModulesDir(),
        moduleName
    )
}

export function getPathToCompiledIndex(moduleName: string) {
    return path.join(
        getPathToCompiledModule(moduleName),
        'index.ts'
    )
}

export async function ensureJahadDir() {
    await ensureDir(
        getPathToJahadDir()
    )
}

export async function emptyJahadDir() {
    await emptyDir(
        getPathToJahadDir()
    )
}

export function createImportStatement(
    importName: string,
    moduleName: string,
    fileName: string
) {
    return `import ${ importName } from "../../../modules/${ moduleName }/${ fileName }"\n`
}

export function createModuleAccumulatorAssignment(objectToAssign: string) {
    return `Object.assign(accumulator, ${ objectToAssign })\n`
}

export async function createCompiledModuleDir(modulePath: string) {
    await ensureDir(
        path.join(
            getPathToCompiledModulesDir(),
            path.basename(modulePath)
        )
    )
}

export async function createModuleIndexFile(modulePath: string) {
    await ensureFile(
        getPathToCompiledIndex(path.basename(modulePath))
    )
}

export function getPathToMainIndex() {
    return path.join(
        getPathToJahadDir(),
        'index.ts'
    )
}

export async function createMainIndexFile() {
    await ensureFile(
        getPathToMainIndex()
    )

    await appendFile(
        getPathToMainIndex(),
        'const modules = []\n'
    )
}

export async function appendModuleAccumulator(modulePath: string) {
    await appendFile(
        getPathToCompiledIndex(path.basename(modulePath)),
        'const accumulator = {}\n'
    )
}

export async function exportModuleAccumulator(modulePath: string) {
    await appendFile(
        getPathToCompiledIndex(path.basename(modulePath)),
        'export default accumulator'
    )
}

export function stripFileExtension(fileName: string) {
    return fileName.split('.')[0]
}

export async function appendMainIndex(modulePath: string) {
    const moduleName = path.basename(modulePath)
    const importStatement = `import ${ moduleName.replace('-', '_') } from "./modules/${ moduleName }"\n`
    const modulesPush = `modules.push(${ moduleName.replace('-', '_') })\n`

    await appendFile(
        getPathToMainIndex(),
        importStatement + modulesPush
    )
}

export async function initCoreInMainIndex() {
    const importStatement = 'import Reagent from "@jahadjs/core"\n'
    const coreInit = `
    Reagent({ modules })\n
    `

    await appendFile(
        getPathToMainIndex(),
        importStatement + coreInit
    )
}
