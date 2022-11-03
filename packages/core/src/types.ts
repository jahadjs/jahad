import type Fastify from "fastify"
import { EntitySchema } from "typeorm/entity-schema/EntitySchema"
import ReagentContext from "./reagent-context";
import {Promisable} from "type-fest";

// Using map only to ensure
// than entity from one module
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

export interface IModule {
    identifier: string
    dependsOn?: string[]
    server?: (fastify: ReturnType<typeof Fastify>) => void | Promise<void>
    injectables?: { new (): any }[]
    db?: {
        entities?: DbEntities
    }
    plugins?: Plugin[]
    app?: {
        context?: (context: ReagentContext) => Promisable<ReagentContext & Record<string, unknown>>
    }
}

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
