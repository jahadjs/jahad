import chalk from "chalk"
class Logger {
    private readonly log = console.log
    info(...text: unknown[]) {
        this.log(
            chalk.green(text)
        )
    }
}

export default new Logger()