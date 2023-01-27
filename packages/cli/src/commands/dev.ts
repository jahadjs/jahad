import { compileModules } from "src/utils/modules";
import { ensureJahadDir, emptyJahadDir, createMainIndexFile, initCoreInMainIndex } from "src/utils/project";

export async function dev() {
    await ensureJahadDir()
    await emptyJahadDir()
    await createMainIndexFile()
    await compileModules()
    await initCoreInMainIndex()
}