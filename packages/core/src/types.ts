import type Fastify from "fastify";

export interface IModule {
    identifier: string
dependsOn?: string[]
server?: (fastify: ReturnType<typeof Fastify>) => void | Promise<void>
injectables?: { new(): any }[]
}

export type ModuleList = IModule[]