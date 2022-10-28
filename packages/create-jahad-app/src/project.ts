import path from "path";
import * as fs from "fs";
import logger from "src/logger.js";
import {PackageManager} from "src/get-user-package-manager.js";

const createProject = async ({
    projectName,
    packageManager
}: {
    projectName: string,
    packageManager: PackageManager
}) => {
    const projectPath = path.resolve(process.cwd(), projectName)

    // check if folder exists
    if (fs.existsSync(projectPath)) {
        logger.error(`Directory already exists: ${ projectName }`)

        throw new Error()
    }

    // create project directory
    await fs.promises.mkdir(projectPath)

    // download template into project directory

    // create package.json

    // install dependencies
}

export default createProject
