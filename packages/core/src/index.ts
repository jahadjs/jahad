import Fastify from 'fastify'
import LoadOrderBuilder from "./load-order-builder";
import {
    createModuleMap
} from './utils'
import Logger from "./logger";
import ModuleLoader from './module-loader';
import ReagentContext from './reagent-context';
import { ModuleList } from './types';

export const buildLoadOrder = (modules: ModuleList) => {
    // using helper to build load order
    const loadOrderBuilder = new LoadOrderBuilder(modules)

    // get ready load order
    return loadOrderBuilder.buildLoadOrder()
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
        const module = moduleMap[identifier]
        const moduleLoader = new ModuleLoader(
            context,
            module
        )

        const start = process.hrtime()

        await moduleLoader.loadModule()

        const [, nanoseconds] = process.hrtime(start)

        const loadingTime = nanoseconds / 1000000

        Logger.info(`Loaded ${module.identifier} in ${ loadingTime }ms`)
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
