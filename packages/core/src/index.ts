import "reflect-metadata"
import Fastify from "fastify"
import LoadOrderBuilder from "./load-order-builder"
import { createModuleMap } from "./utils"
import Logger from "./logger"
import ModuleLoader from "./module-loader"
import ReagentContext from "./reagent-context"
import { Config, ModuleList } from "./types"
import { DataSource } from "typeorm"
import DependencyContainer from "./dependency-container"
import { DbConnection } from "./db-connection"
import { Inject } from "./dependency-helpers"

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
    const context = new ReagentContext(fastify)

    return context
}

export const Reagent = async ({
    modules,
    config
}: {
    modules: ModuleList
    config: Config
}) => {
    const reagentStart = process.hrtime()
    // initialize app context
    const context = createReagentContext()
    
    // the same thing is being created inside of LoadOrderBuilder
    // so it has to be deduped
    const moduleMap = createModuleMap(modules)

    // build load order of modules
    const loadOrder = buildLoadOrder(modules)

    const moduleLoader = new ModuleLoader(loadOrder, context, moduleMap)

    await moduleLoader.loadModules()

    // once modules are loaded
    // it's time to create db connection
    const { db } = config
    const dataSourceOptions = context.dataSourceManager.getOptions()
    const dataSource = new DataSource({
        ...db,
        ...dataSourceOptions
    })

    try {
        await dataSource.initialize()

        // registering DbConnection as injectable
        DependencyContainer.addInjectable("connection", DbConnection)

        // Injecting connection and setting dataSource
        const connection = Inject({ namespace: "connection" }) as DbConnection

        connection.setConnection(dataSource)

        Logger.info("Successfully connected to DB")
    } catch (e) {
        Logger.error("Could not connect to db. Error is following", e)

        return
    }

    // let's start application
    context.getServerInstance().listen(
        {
            port: 3000
        },
        () => {
            const [_, nanoseconds] = process.hrtime(reagentStart)
            const startupTime = nanoseconds / 1000000

            Logger.info(
                `Viole started in ${startupTime}ms. Listening on port 3000`
            )
        }
    )
}

export { 
    Inject,
    DbConnection
 }

export default Reagent
