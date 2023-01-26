import path from 'path'
import { emptyDir } from 'fs-extra'
import { COMPILED_DIR, COMPILED_MODULES_DIR } from './consts'

export const getProjectRootPath = () => {
    // Currently we assume that CLI is invoked at the root of project
    return process.cwd()
}

export const getModulesDirPath = () => {
    const projectRoot = getProjectRootPath()

    return path.join(projectRoot, 'modules')
}

export const getPathToCompiledDir = () => {
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

export async function emptyCompiledDir() {
    await emptyDir(
        getPathToCompiledDir()
    )
}
