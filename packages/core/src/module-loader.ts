import ReagentContext from "./reagent-context"
import DependencyContainer from "./dependency-container"
import { IModule, PluginMap } from "./types"
import Logger from "./logger"

export default class ModuleLoader {
    private module: IModule
    private pluginMap: PluginMap = {}

    constructor(
        private readonly loadOrder: string[],
        private readonly context: ReagentContext,
        private readonly moduleMap: Record<string, IModule>
    ) {
        this.module = moduleMap[loadOrder[0]]
    }

    private async applyServerExtension() {
        const { server } = this.module

        if (server) {
            await server(this.context.getServerInstance())
        }
    }

    private getPluginMap() {
        const { plugins } = this.module

        if (!plugins || !Object.keys(plugins).length) {
            return {}
        }

        return plugins.reduce((acc, plugin) => {
            const { namespace, method, type, handler } = plugin

            // register first plugin for class
            if (!acc[namespace]) {
                acc[namespace] = {
                    [method]: {
                        [type]: [
                            {
                                handler
                            }
                        ]
                    }
                }

                return acc
            }

            // register first plugin for method
            if (!acc[namespace][method]) {
                acc[namespace][method] = {
                    [type]: [
                        {
                            handler
                        }
                    ]
                }

                return acc
            }

            // register first plugin of provided type
            if (!acc[namespace][method][type]) {
                acc[namespace][method][type] = [
                    {
                        handler
                    }
                ]

                return acc
            }

            acc[namespace][method][type].push({
                handler
            })

            return acc
        }, {})
    }

    private async registerInjectables() {
        const { injectables } = this.module

        if (!injectables || !injectables.length) {
            return
        }

        let len = injectables.length
        let index = 0

        while (index < len) {
            const target = injectables[index]
            const injectableOptions = Reflect.get(
                target,
                "injectableOptions"
            ) as {
                namespace: string
            }

            const { namespace } = injectableOptions

            DependencyContainer.addInjectable(namespace, target)

            index++
        }
    }

    private async registerEntities() {
        const { db } = this.module

        if (!db) {
            return
        }

        const { entities } = db

        if (!entities || !Object.keys(entities).length) {
            return
        }

        this.context.dataSourceManager.addEntities(entities)
    }

    private async loadModule() {
        await this.registerInjectables()
        await this.registerEntities()
        await this.applyServerExtension()
    }

    async loadModules() {
        // go through load order and load modules
        // in given sequence
        for (const identifier of this.loadOrder) {
            this.module = this.moduleMap[identifier]
            this.pluginMap = this.getPluginMap()

            const start = process.hrtime()

            await this.loadModule()

            const [, nanoseconds] = process.hrtime(start)

            const loadingTime = nanoseconds / 1000000

            Logger.info(`Loaded ${this.module.identifier} in ${loadingTime}ms`)
        }
    }
}
