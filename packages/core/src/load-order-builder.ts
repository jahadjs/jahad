import {IModule, ModuleList } from "."
import { createModuleMap } from "./utils"

export default class LoadOrderBuilder {
    loadOrder: string[] = []

    private readonly moduleMap: Record<string, IModule>

    constructor(private readonly modules: ModuleList) {
        this.moduleMap = createModuleMap(modules)
    }

    buildLoadOrder() {
        const independentModules = this.modules
        .filter(({dependsOn}) => !dependsOn || !dependsOn.length)
        let dependentModules = this.modules
        .filter(({dependsOn}) => dependsOn && dependsOn.length)

        this.loadOrder = independentModules.map(({identifier}) => identifier);

        const queue = dependentModules.length ?
        [dependentModules.shift()]
        : []

        outer: while (queue.length) {
            const current = queue.shift() as IModule

            const {
                dependsOn = [],
                identifier
            } = current

            for (const dependencyId of dependsOn) {
                if (!this.has(dependencyId)) {
                    // Returning back currently processed module
                    // To make sure it will processed once all dependencies resolved
                    queue.unshift(this.moduleMap[identifier])
                    // Adding next module to queue
                    queue.unshift(this.moduleMap[dependencyId])

                    continue outer
                }
            }

            // If all dependencies are already in load order
            // Adding currently processed module to load order
            // If it was not added earlier
            if (!this.has(identifier)) {
                this.loadOrder.push(identifier)
            }

            // if we have some more dependent modules
            // We need to ensure that they will be processed
            if (dependentModules.length) {
                queue.push(dependentModules.shift())
            }
        }

        return this.loadOrder
    }

    // checks if identifier is present in load order
    has(identifier: string) {
        return this.loadOrder.includes(identifier)
    }
}