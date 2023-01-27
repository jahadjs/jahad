import path from 'path'
import { fileURLToPath } from 'url'

// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url)
const distPath = path.dirname(__filename)
export const PKG_ROOT = path.join(distPath, '../')
export const PKG_SRC = path.join(PKG_ROOT, 'src')
export const STARTERS_ROOT = path.join(PKG_SRC, 'starter')

export const DEPENDENCY_VERSION_MAP = {
    '@jahadjs/core': '^0.0.11',
    '@jahadjs/cli': '^0.0.8'
} as const
export const DEV_DEPENDENCY_VERSION_MAP = {
    "@types/node": "^18.11.18",
    'ts-node': '^10.9.1',
    "typescript": "^4.9.4"
}
export const SCRIPTS_MAP = {
    'dev': 'jahad dev'
}
