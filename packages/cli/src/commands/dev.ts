import logger from "src/logger";
import { addConfigsToMainIndex } from "src/utils/config";
import { compileModules } from "src/utils/modules";
import { ensureJahadDir, emptyJahadDir, createMainIndexFile, initCoreInMainIndex, validateProject } from "src/utils/project";

export async function dev() {
    try {
        await validateProject()

        await ensureJahadDir()
        await emptyJahadDir()

        await createMainIndexFile()

        await compileModules()

        await addConfigsToMainIndex()
        await initCoreInMainIndex()
    } catch (e) {
        logger.error(e)
    }   
}