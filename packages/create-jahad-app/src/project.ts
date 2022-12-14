import path from 'path'
import fs from 'fs-extra'
import logger from 'src/logger.js'
import getUserPackageManager from 'src/get-user-package-manager.js'
import { execaCommand } from 'execa'
import ora from 'ora'
import { DEPENDENCY_VERSION_MAP, STARTERS_ROOT } from './consts.js'
import { initGit } from './git.js'

const directoryStructure = {
    config: true,
    modules: true
}

const createDirectoryStructure = async (projectPath: string) => {
    const spinner = ora('Creating directory structure').start()

    Object.entries(directoryStructure).forEach(([directory, options]) => {
        if (typeof options === 'boolean') {
            fs.ensureDir(path.join(projectPath, directory))
        }
    })

    spinner.succeed()
}

const writeConfigFiles = async (projectPath: string) => {
    const configSrcPath = path.join(STARTERS_ROOT, 'config')
    const configDestPath = path.join(projectPath, 'config')

    const files = await fs.promises.readdir(configSrcPath)

    files.forEach(async (file) => {
        fs.copyFileSync(
            path.join(configSrcPath, file),
            path.join(configDestPath, file)
        )
    })
}

const createStarterFiles = async (projectPath: string) => {
    const spinner = ora('Creating starter files').start()

    await writeConfigFiles(projectPath)

    spinner.succeed()
}

const createProject = async ({
    projectName,
    isInstall = true,
    isGit = true
}: {
    projectName: string
    isInstall?: boolean
    isGit?: boolean
}) => {
    const projectPath = path.resolve(process.cwd(), projectName)

    // check if folder exists
    if (fs.existsSync(projectPath)) {
        logger.error(`Directory already exists: ${projectName}`)

        throw new Error()
    }

    // create project directory
    await fs.promises.mkdir(projectPath)

    // create directory structure
    await createDirectoryStructure(projectPath)

    // create starter files
    await createStarterFiles(projectPath)

    // create package.json
    const packageJson = {
        name: projectName,
        version: '0.1.0',
        private: true,
        dependencies: Object.entries(DEPENDENCY_VERSION_MAP).reduce(
            (acc, [key, value]) => {
                return {
                    ...acc,
                    [key]: value
                }
            },
            {}
        )
    }

    fs.writeJSONSync(path.join(projectPath, 'package.json'), packageJson, {
        spaces: 2
    })

    const packageManager = getUserPackageManager()
    const isYarn = packageManager === 'yarn'

    const spinner = ora('Installing dependencies').start()

    if (isInstall) {
        if (isYarn) {
            await execaCommand('yarn', {
                cwd: projectPath
            })
        } else {
            await execaCommand('npm install', {
                cwd: projectPath
            })
        }
    }

    if (isGit) {
        await initGit(projectPath)
    }

    spinner.succeed()
}

export default createProject
