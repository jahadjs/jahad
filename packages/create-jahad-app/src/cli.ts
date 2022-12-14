import { Command } from 'commander'
import inquirer from 'inquirer'

type CliFlags = {
    noInstall: boolean
    noGit: boolean
    default: boolean
}

const setDescription = (program: Command) => {
    program.description('CLI for creating Jahad Project applications')

    return program
}

const setArguments = (program: Command) => {
    program.argument(
        '[dir]',
        'Both name of app and name of directory project will be created in'
    )

    return program
}

const promptAppDir = async () => {
    const { appDir } = await inquirer.prompt<{ appDir: string }>({
        name: 'appDir',
        type: 'input',
        message: 'Please, specify your project name',
        default: 'my-jahad',
        transformer: (input: string) => {
            return input.trim()
        }
    })

    return appDir
}

const promptDepsInstall = async () => {
    const { isInstall } = await inquirer.prompt<{ isInstall: boolean }>({
        name: 'isInstall',
        type: 'confirm',
        message: 'Do you want us to install dependencies',
        default: true
    })

    return isInstall
}

const promptGitInit = async () => {
    const { isGit } = await inquirer.prompt<{ isGit: boolean }>({
        name: 'isGit',
        type: 'confirm',
        message: 'Do you want us to initialize git repository',
        default: true
    })

    return isGit
}

const setOptions = (program: Command) => {
    program
        .option('--no-install', 'Disable dependencies installation', false)
        .option('--no-git', 'Disable git initialization', false)
        .option('-y --default', 'Use default options', false)
}

const runCli = async () => {
    const cliResults: {
        appDir: string
        isInstall: boolean,
        isGit: boolean,
        isDefault: boolean
    } = {
        appDir: '',
        isInstall: true,
        isGit: true,
        isDefault: false
    }
    const program = new Command('create-jahad-app')

    setDescription(program)
    setArguments(program)
    setOptions(program)

    program.parse(process.argv)

    const {
        noGit,
        noInstall,
        default: isDefault
    } = program.opts<CliFlags>()

    const appDir = program.args[0]

    if (!appDir && !isDefault) {
        throw new Error('Please, specify your project name')
    }

    if (!isDefault) {
        cliResults.appDir = appDir || (await promptAppDir())
        cliResults.isInstall = noInstall ? false : (await promptDepsInstall())
        cliResults.isGit = noGit ? false : (await promptGitInit())
    }

    if (isDefault) {
        cliResults.appDir = appDir || 'my-jahad'
    }

    cliResults.isDefault = isDefault

    return cliResults
}

export default runCli
