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

export interface HookMap {
    appHooks: {
        onReady?: (context: ReagentContext) => Promisable<void>
    }
}

export interface OnModuleLoadHook {
    during: 'pre-build' | 'build',
    handler: (module: IModule, context: ReagentContext) => Promisable<void>
}

export interface OnModulesLoadedHook {
    after: 'pre-build' | 'build',
    handler: (context: ReagentContext) => Promisable<void>
}

export interface IModule {
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
        loaders?: {
            onModuleLoad?: OnModuleLoadHook[],
            onModulesLoaded?: OnModulesLoadedHook[]
        }
        hooks?: {
            onReady?: (context: ReagentContext, server: ReturnType<typeof Fastify>) => Promisable<void>
        }

    }
}

export type ExtendedModule<T> = IModule & T

export type ModuleList = IModule[]

export interface Config {
    db:
        | {
              type: "mysql" | "postgres" | "mariadb"
              host: string
              port: number
              username: string
              password: string
              database: string
          }
        | {
              type: "sqlite"
              database: string
          }
}
