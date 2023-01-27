import { AppConfig, DbConfig, IModule, ModuleList, ModulesConfig } from "./types"

export const createModuleMap = (modules: ModuleList) =>
    modules.reduce((acc, curr) => {
        return {
            ...acc,
            [curr.identifier]: curr
        }
    }, {}) as Record<string, IModule>

export const env = (key: string, fallback: string = '') => process.env[key] || fallback

export const defineAppConfig = (config: AppConfig) => config

export const defineModulesConfig = (config: ModulesConfig) => config

export const defineDbConfig = (config: DbConfig) => config