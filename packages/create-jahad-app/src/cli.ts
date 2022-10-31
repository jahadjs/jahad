import { Command } from "commander";
import inquirer from "inquirer";

const setDescription = (program: Command) => {
  program.description("CLI for creating Jahad Project applications");

  return program;
};

const setArguments = (program: Command) => {
  program.argument(
    "[dir]",
    "Both name of app and name of directory project will be created in"
  );

  return program;
};

const promptAppDir = async () => {
  const { appDir } = await inquirer.prompt<{ appDir: string }>({
    name: "appDir",
    type: "input",
    message: "Please, specify your project name",
    default: "my-jahad",
    transformer: (input: string) => {
      return input.trim();
    },
  });

  return appDir;
};

const promptDepsInstall = async () => {
  const { isInstall } = await inquirer.prompt<{ isInstall: boolean }>({
    name: "isInstall",
    type: "confirm",
    message: "Do you want us to install dependencies",
    default: true,
  });

  return isInstall;
};

const setOptions = (program: Command) => {
  program.option("--no-install", "Disable dependencies installation");
};

const runCli = async () => {
  const cliResults: {
    appDir: string;
    isInstall: boolean;
  } = {
    appDir: "",
    isInstall: true,
  };
  const program = new Command("create-jahad-app");

  setDescription(program);
  setArguments(program);
  setOptions(program);

  program.parse(process.argv);

  const appDir = program.args[0];

  if (appDir) {
    cliResults.appDir = appDir;
  } else {
    cliResults.appDir = await promptAppDir();
  }

  cliResults.isInstall = await promptDepsInstall();

  return cliResults;
};

export default runCli;
