import type Fastify from "fastify";

export default class ReagentContext {
    constructor(private readonly fastify: ReturnType<typeof Fastify>) {
    }

    getServerInstance() {
        return this.fastify
    }
}