import type Fastify from "fastify";
import { EntitySchema } from "typeorm/entity-schema/EntitySchema";

// Using map only to ensure
// than entity from one module
// can override entity from another
export type DbEntities = {
    [p: string]: Function | string | EntitySchema
}

export interface IModule {
    identifier: string
    dependsOn?: string[]
    server?: (fastify: ReturnType<typeof Fastify>) => void | Promise<void>
    injectables?: { new(): any }[]
    db?: {
        entities?: DbEntities
    }
}

export type ModuleList = IModule[]

export interface Config {
    db: {
        type: 'mysql' | 'postgres' | 'mariadb'
        host: string
        port: number
        username: string
        password: string
        database: string
    } | {
        type: 'sqlite'
        database: string
    }
}