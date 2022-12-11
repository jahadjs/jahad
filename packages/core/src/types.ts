import type Fastify from "fastify"
import { EntitySchema } from "typeorm/entity-schema/EntitySchema"
import ReagentContext from "./reagent-context";
import {Promisable} from "type-fest";

// Using map only to ensure
// that entity from one module
// can override entity from another
export type DbEntities = {
    [p: string]: Function | string | EntitySchema
}

export interface Plugin {
    namespace: string
    method: string
    type: "before" | "after"
    handler: (
        subject: Record<any, unknown>,
        args: unknown[]
    ) => Promise<unknown> | unknown
}

export interface PluginMap {
    [namespace: string]: {
        [method: string]: {
            [type: string]: {
                handler: Plugin["handler"]
            }[]
        }
    }
}

type OnReadyHook = (context: ReagentContext, server: ReturnType<typeof Fastify>) => Promisable<void>

export type ModuleLoadHookStep = 'prebuild' | 'build'

export type OnModuleLoadHook = {
    during: ModuleLoadHookStep,
    handler: (module: IModule, context: ReagentContext) => Promisable<void>
}

export type OnModulesLoadedHook = {
    after: ModuleLoadHookStep,
    handler: (module: IModule, context: ReagentContext) => Promisable<void>
}

export interface HookMap {
    appHooks: {
        onReady: OnReadyHook[],
        onModuleLoad: {
            [during in ModuleLoadHookStep]: OnModuleLoadHook[]
        },
        onModulesLoaded: {
            [after in ModuleLoadHookStep]: OnModulesLoadedHook[]
        }
    }
}

export type IModule = {
    identifier: string
    dependsOn?: string[]
    server?: (fastify: ReturnType<typeof Fastify>) => Promisable<void>
    injectables?: { new (): any }[]
    db?: {
        entities?: DbEntities
    }
    plugins?: Plugin[]
    app?: {
        context?: (context: ReagentContext) => Promisable<ReagentContext & Record<string, unknown>>
        hooks?: {
            onReady?: OnReadyHook[],
            onModuleLoad?: OnModuleLoadHook[],
            onModulesLoaded?: OnModulesLoadedHook[]
        }
    }
    [p: string]: unknown
}

export type HookNames = keyof HookMap['appHooks']

export type ModuleHookNames = Exclude<HookNames, 'onReady'>

export type ExtendedModule<T> = IModule & T

export type ModuleList = IModule[]

export type CommonDbConfig = {
    synchronize?: boolean
}

export interface Config {
    db:
        | {
              type: "mysql" | "postgres" | "mariadb"
              host: string
              port: number
              username: string
              password: string
              database: string
          } & CommonDbConfig
        | {
              type: "sqlite"
              database: string
          } & CommonDbConfig
}

export type AppConfig = {
    env: string,
    debug: boolean
}

export type ModulesConfig = {
    [key: string]: boolean
}
