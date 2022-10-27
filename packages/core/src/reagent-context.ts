import type Fastify from "fastify";
import { DbEntities } from "./types";

export class DataSourceManager {
    private dataSourceOptions: {
        entities: DbEntities
    } = {
        entities: {}
    }

    addEntities(entities: DbEntities) {
        this.dataSourceOptions.entities = {
            ...this.dataSourceOptions.entities,
            ...entities
        }
    }

    getOptions() {
        return this.dataSourceOptions
    }
}

export default class ReagentContext {
    dataSourceManager = new DataSourceManager()
    constructor(private readonly fastify: ReturnType<typeof Fastify>) {
    }

    getServerInstance() {
        return this.fastify
    }
}