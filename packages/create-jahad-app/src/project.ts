import path from "path";
import fs from "fs-extra";
import logger from "src/logger.js";
import { PackageManager } from "src/get-user-package-manager.js";
import { execaCommand } from "execa";
import ora from "ora";

const createProject = async ({
  projectName,
  packageManager
}: {
  projectName: string;
  packageManager: PackageManager;
  isInstall?: boolean;
}) => {
  const projectPath = path.resolve(process.cwd(), projectName);

  // check if folder exists
  if (fs.existsSync(projectPath)) {
    logger.error(`Directory already exists: ${projectName}`);

    throw new Error();
  }

  // create project directory
  await fs.promises.mkdir(projectPath);

  // create package.json
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true
  };

  fs.writeJSONSync(path.join(projectPath, "package.json"), packageJson, {
    spaces: 2
  });

  // install dependencies
  const dependencies = ["@mr0bread/viole-core", "jahad"];

  const isYarn = packageManager === "yarn";

  const spinner = ora("Installing dependencies").start();

  await execaCommand(
    `${packageManager} ${isYarn ? "add" : "install"} ${dependencies.join(" ")}`,
    {
      cwd: projectPath
    }
  );

  spinner.succeed();
};

export default createProject;
