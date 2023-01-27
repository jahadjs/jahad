import fs from 'fs-extra'

export async function isDirectory(path: string) {
    try {
        return (await fs.stat(path)).isDirectory()
    } catch (e) {
        return false
    }
}

export async function isFile(path: string) {
    try {
        return (await fs.stat(path)).isFile()
    } catch (e) {
        return false
    }
}