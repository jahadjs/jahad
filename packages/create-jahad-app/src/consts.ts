import path from 'path'
import { fileURLToPath } from 'url'

// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url)
const distPath = path.dirname(__filename)
export const PKG_ROOT = path.join(distPath, '../')
export const PKG_SRC = path.join(PKG_ROOT, 'src')
export const STARTERS_ROOT = path.join(PKG_SRC, 'starter')

export const DEPENDENCY_VERSION_MAP = {
    '@jahadjs/core': '0.0.9',
    '@jahadjs/cli': '0.0.7'
} as const
