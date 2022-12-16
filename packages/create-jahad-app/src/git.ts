import { execaCommand, execaCommandSync } from 'execa'
import fs from 'fs-extra'
import path from 'path'
import logger from 'src/logger.js'
import ora from 'ora'
import inquirer from 'inquirer'
import chalk from 'chalk'

const isGitInstalled = (dir: string) => {
    try {
        execaCommandSync('git --version', {
            cwd: dir
        })

        return true
    } catch (e) {
        return false
    }
}

const isRootGitRepo = (dir: string) => {
    return fs.existsSync(path.join(dir, '.git'))
}

const isInsideGitRepo = async (dir: string) => {
    try {
        await execaCommand('git rev-parse --is-inside-work-tree', {
            cwd: dir,
            stdout: 'ignore'
        })

        return true
    } catch (e) {
        return false
    }
}

const getGitVersion = () => {
    const stdout = execaCommandSync('git --version').stdout.toString().trim()

    const versionTag = stdout.split(' ')[2]

    const majorVersion = Number(versionTag?.split('.')[0])
    const minorVersion = Number(versionTag?.split('.')[1])

    return {
        majorVersion,
        minorVersion
    }
}

const getDefaultBranch = () => {
    const stdout = execaCommandSync(
        'git config --get init.defaultBranch || echo main'
    )
        .stdout.toString()
        .trim()

    return stdout
}

const initGitRepo = async (projectPath: string) => {
    const branchName = getDefaultBranch()

    const { majorVersion, minorVersion } = getGitVersion()

    if (majorVersion < 2 || minorVersion < 28) {
        await execaCommand('git init', {
            cwd: projectPath
        })

        await execaCommand(`git branch -m ${branchName}`, {
            cwd: projectPath
        })
    } else {
        await execaCommand(`git init --initial-branch=${branchName}`, {
            cwd: projectPath
        })
    }
}

export const initGit = async (projectPath: string, force: boolean) => {
    if (!isGitInstalled(projectPath)) {
        logger.warn('Git is not installed. Skipping git initialization')
    }

    const spinner = ora('Initializing git repository').start()

    const isRoot = isRootGitRepo(projectPath)
    const isInside = await isInsideGitRepo(projectPath)
    const projectName = path.basename(projectPath)

    if (isInside && isRoot && !force) {
        // Dir is already a git repo
        spinner.stop()

        const { overwriteGit } = await inquirer.prompt<{
            overwriteGit: boolean
        }>({
            name: 'overwriteGit',
            type: 'confirm',
            default: false,
            message: `${chalk.redBright.bold(
                'Warning:'
            )} Git repository already exists in ${projectName} and initializing new one will overwrite the history. Do you want to overwrite it?`
        })

        if (!overwriteGit) {
            spinner.info('Skipping git initialization')

            return
        }

        await fs.remove(path.join(projectPath, '.git'))
    }

    if (isInside && !isRoot && !force) {
        spinner.stop()

        const { initChildRepo } = await inquirer.prompt<{
            initChildRepo: boolean
        }>({
            name: 'initChildRepo',
            default: false,
            type: 'confirm',
            message: `${chalk.redBright.bold(
                'Warning:'
            )} ${projectName} is already in a git working tree. Do you want to initialize a new git repository?`
        })

        if (!initChildRepo) {
            spinner.info('Skipping git initialization')

            return
        }
    }

    try {
        await initGitRepo(projectPath)

        spinner.succeed(chalk.green('Successfully initialized git repository'))
    } catch (e) {
        spinner.fail(chalk.bold.red('Failed to initialize git repository'))
    }
}
