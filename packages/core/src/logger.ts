import chalk from "chalk"
class Logger {
    private readonly log = console.log
    info(message: string) {
        this.log(
            chalk.green(message)
        )
    }
}

export default new Logger()