import Fastify from 'fastify'
import LoadOrderBuilder from "./load-order-builder";
import {
    createModuleMap
} from './utils'
import Logger from "./logger";
import DependencyContainer from "./dependency-container";

export interface IModule {
    identifier: string
    dependsOn?: string[]
    server?: (fastify: ReturnType<typeof createReagentContext>['fastify']) => void | Promise<void>
    injectables?: { new(): any }[]
}

export type ModuleList = IModule[]

export const buildLoadOrder = (modules: ModuleList) => {
    // using helper to build load order
    const loadOrderBuilder = new LoadOrderBuilder(modules)

    // get ready load order
    return loadOrderBuilder.buildLoadOrder()
}

class ReagentContext {
    constructor(private readonly fastify: ReturnType<typeof Fastify>) {
    }

    getServerInstance() {
        return this.fastify
    }
}

class ModuleLoader {
    constructor(
        private readonly context: ReagentContext,
        private readonly module: IModule
    ) {
    }

    async applyServerExtension() {
        const {
            server
        } = this.module

        if (server) {
            await server(this.context.getServerInstance())
        }
    }

    async registerInjectables() {
        const {
            injectables
        } = this.module

        if (!injectables || !injectables.length) {
            return
        }

        let len = injectables.length
        let index = 0

        while (index < len) {
            const target = injectables[index]
            const injectableOptions = Reflect.get(
                target,
                'injectableOptions'
            ) as { namespace: string }

            const {
                namespace
            } = injectableOptions

            DependencyContainer.addInjectable(
                namespace,
                target
            )

            index++
        }
    }

    async loadModule() {
        await this.registerInjectables()
        await this.applyServerExtension()
    }
}

// Creating context of Reagent App
// Currently, it should contain instance of fastify so that
// Modules are able to register new routes
export const createReagentContext = () => {
    const fastify = Fastify()
    const context = new ReagentContext(
        fastify
    )

    return context
}

export const Reagent = async ({
                                  modules,
                              }: {
    modules: ModuleList
}) => {
    // the same thing is being created inside of LoadOrderBuilder
    // so it has to be deduped
    const moduleMap = createModuleMap(modules)
    // initialize app context
    const context = createReagentContext()

    // build load order of modules
    const loadOrder = buildLoadOrder(modules)

    // go through load order and load modules
    // in given sequence
    for (const identifier of loadOrder) {
        const moduleLoader = new ModuleLoader(
            context,
            moduleMap[identifier]
        )

        await moduleLoader.loadModule()
    }

    // once all modules have been loaded
    // let's start application
    context.getServerInstance().listen({
        port: 3000
    }, () => {
        Logger.info('server started')
    })
}

export default Reagent
