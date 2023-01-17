import path from 'path'

export const getProjectRootPath = () => {
    // Currently we assume that CLI is invoked at the root of project
    return process.cwd()
}

export const getModulesDirPath = () => {
    const projectRoot = getProjectRootPath()

    return path.join(projectRoot, 'modules')
}
