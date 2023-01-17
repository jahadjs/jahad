import chalk from "chalk"
class Logger {
    private readonly log = console.log
    info(...text: unknown[]) {
        this.log(chalk.green(text))
    }

    error(...text: unknown[]) {
        this.log(chalk.red(text))
    }

    warn(...text: unknown[]) {
        this.log(chalk.yellow(...text))
    }
}

export default new Logger()
