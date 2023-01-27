export const RESERVED_FILES = {
    MODULE: 'module.ts'
} as const

export const COMPILED_DIR = '.jahad'
export const COMPILED_MODULES_DIR = '.jahad/modules'
export const CONFIG_DIR = 'config'
export const MODULES_DIR = 'modules'

export const MANDATORY_CONFIG_FILES = [
    'app.ts',
    'modules.ts',
    'db.ts'
] as const
export const CORE_CONFIG_FILES = [
    'db.ts'
] as const
