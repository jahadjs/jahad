import {Command} from "commander";
import inquirer from "inquirer";
import logger from "src/logger.js";

const setDescription = (program: Command) => {
    program
        .description(
            'CLI for creating Jahad Project applications'
        )

    return program
}

const setArguments = (program: Command) => {
    program
        .argument(
            '[dir]',
            'Both name of app and name of directory project will be created in'
        )

    return program
}

const promptAppDir = async () => {
    const {
        appDir
    } = await inquirer.prompt<string>({
        name: 'appDir',
        type: 'input',
        message: 'Please, specify your project name',
        default: 'my-jahad',
        transformer: (input: string) => {
            return input.trim();
        },
    })

    return appDir
}

const runCli = async () => {
    const cliResults: {
        appDir: string
    } = {}
    const program = new Command('create-jahad-app')

    setDescription(program)
    setArguments(program)

    program.parse(process.argv)

    const appDir = program.args[0]

    if (appDir) {
        cliResults.appDir = appDir
    } else {
        cliResults.appDir = await promptAppDir()
    }

    return cliResults
}

export default runCli