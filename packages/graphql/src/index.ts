import {
    mergeTypeDefs,
    mergeResolvers
} from '@graphql-tools/merge'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServer, BaseContext } from "@apollo/server"
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from "@as-integrations/fastify"
import type ReagentContext from '../../core/src/reagent-context'
import type { IModule } from '../../core/src/types'
import Logger from '../../core/src/logger'

type FirstArgument<T extends (...args: any[]) => any> = Parameters<T>[0]

type ExtractArrayFromUnion<T> = T extends (infer U)[] ? U[] : never

type TypeDefs = ExtractArrayFromUnion<FirstArgument<typeof mergeTypeDefs>>
type Resolvers = ExtractArrayFromUnion<FirstArgument<typeof mergeResolvers>>

type ExtendedContext = ReagentContext & {
    graphql: {
        store: {
            typeDefs: TypeDefs
            resolvers: Resolvers
            schema: ReturnType<typeof createMergedSchema>
        },
        admin: {
            typeDefs: TypeDefs
            resolvers: Resolvers
            schema: ReturnType<typeof createMergedSchema>
        }
    }
}

type ExtendedModule = IModule & {
    graphql?: {
        store?: {
            typeDefs: TypeDefs
            resolvers: Resolvers
        },
        admin?:{
            typeDefs: TypeDefs
            resolvers: Resolvers
        }
    }
}

const mergeTypeDefsAndResolvers = (
    typeDefs: TypeDefs,
    resolvers: Resolvers
) => {
    const mergedTypeDefs = mergeTypeDefs(typeDefs)
    const mergedResolvers = mergeResolvers(resolvers)

    return [mergedTypeDefs, mergedResolvers] as const
}

const createMergedSchema = (typeDefs: TypeDefs, resolvers: Resolvers) => {
    const [mergedTypeDefs, mergedResolvers] = mergeTypeDefsAndResolvers(typeDefs, resolvers)

    return makeExecutableSchema({
        typeDefs: mergedTypeDefs,
        resolvers: mergedResolvers
    })
}

export const GraphQLModule: IModule = {
    identifier: 'graphql',
    app: {
        context: (original: ReagentContext) => Object.assign(original, {
            graphql: {
                store: {
                    typeDefs: [],
                    resolvers: []
                },
                admin:{
                    typeDefs: [],
                    resolvers: []
                }
            }
        } as Record<string, unknown>),
        hooks: {
            // This type of loader is called after each module is loaded
            // Which allows us to gather all passed typeDefs and resolvers
            onModuleLoad: [{
                during: 'prebuild',
                handler: (module, context) => {
                    const {
                        graphql
                    } = module as ExtendedModule
                    const extendedContext = context as ExtendedContext

                    if (!graphql || !Object.keys(graphql)) {
                        return
                    }

                    const {
                        store,
                        admin
                    } = graphql

                    if (store) {
                        const {
                            typeDefs,
                            resolvers
                        } = store

                        extendedContext.graphql.store.typeDefs = extendedContext.graphql.store.typeDefs.concat(typeDefs)
                        extendedContext.graphql.store.resolvers = extendedContext.graphql.store.resolvers.concat(resolvers)
                    }

                    if (admin) {
                        const {
                            typeDefs,
                            resolvers
                        } = admin

                        extendedContext.graphql.admin.typeDefs = extendedContext.graphql.admin.typeDefs.concat(typeDefs)
                        extendedContext.graphql.admin.resolvers = extendedContext.graphql.admin.resolvers.concat(resolvers)
                    }
                }
            }],
            // This type of loader is called after all modules are loaded
            // Which allows us to create a merged schema from all gathered typeDefs and resolvers
            onModulesLoaded: [{
                after: 'prebuild',
                handler: (_, context) => {
                    const extendedContext = context as ExtendedContext

                    // merge resolvers and typeDefs into one schema
                    const {
                        graphql: {
                            store: {
                                typeDefs: storeTypeDefs,
                                resolvers: storeResolvers
                            },
                            admin: {
                                typeDefs: adminTypeDefs,
                                resolvers: adminResolvers
                            }
                        }
                    } = extendedContext

                    extendedContext.graphql.store.schema = createMergedSchema(storeTypeDefs, storeResolvers)
                    extendedContext.graphql.admin.schema = createMergedSchema(adminTypeDefs, adminResolvers)
                }
            }],
            // This hook is called in the very end of the app initialization
            // Which allows us to create an ApolloServer instance and register it as a Fastify plugin
            onReady: [
                async (context, fastify) => {
                    const {
                        graphql: {
                            store: {
                                schema: storeSchema
                            },
                            admin: {
                                schema: adminSchema
                            }
                        }
                    } = context as ExtendedContext
            
                    // create apollo server instance with generated schema
                    // and integrate it with Fastify instance

                    try {
                        const storeApollo = new ApolloServer<BaseContext>({
                            schema: storeSchema,
                            plugins: [
                                fastifyApolloDrainPlugin(fastify)
                            ]
                        })

                        await storeApollo.start()

                        fastify.route({
                            url: '/api/store/graphql',
                            method: ['GET', 'POST', 'OPTIONS'],
                            handler: fastifyApolloHandler(storeApollo)
                        })
                    } catch (e) {
                       if (
                            e instanceof Error 
                                && e.message 
                                && e.message.includes('Query root type must be provided')
                        ) {
                            Logger.warn(
                                'Store GraphQL schema does not contain Query root type.'
                            )
                            Logger.warn(
                                'Store GraphQL server will not be started'
                            )
                        }
                    }

                    try {
                        const adminApollo = new ApolloServer<BaseContext>({
                            schema: adminSchema,
                            plugins: [
                                fastifyApolloDrainPlugin(fastify)
                            ]
                        })

                        await adminApollo.start()

                        fastify.route({
                            url: '/api/admin/graphql',
                            method: ['GET', 'POST', 'OPTIONS'],
                            handler: fastifyApolloHandler(adminApollo)
                        })
                    } catch (e) {
                        if (
                            e instanceof Error
                            && e.message
                            && e.message.includes('Query root type must be provided')
                        ) {
                            Logger.warn(
                                'Admin GraphQL schema does not contain Query root type.'
                            )
                            Logger.warn(
                                'Admin GraphQL server will not be started'
                            )
                        }
                    }
                }
            ]
        }
    }
}

export default GraphQLModule
