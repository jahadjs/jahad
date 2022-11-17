import {
    mergeTypeDefs,
    mergeResolvers
} from '@graphql-tools/merge'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServer, BaseContext } from "@apollo/server"
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify"
import type ReagentContext from '@mr0bread/viole-core/src/reagent-context'
import type { IModule } from '@mr0bread/viole-core/src/types'

type FirstArgument<T extends (...args: any[]) => any> = Parameters<T>[0]

type ExtractArrayFromUnion<T> = T extends (infer U)[] ? U[] : never

type TypeDefs = ExtractArrayFromUnion<FirstArgument<typeof mergeTypeDefs>>
type Resolvers = ExtractArrayFromUnion<FirstArgument<typeof mergeResolvers>>

type ExtendedContext = ReagentContext & {
    graphql: {
        typeDefs: TypeDefs
        resolvers: Resolvers
        schema: ReturnType<typeof createMergedSchema>
    }
}

type ExtendedModule = IModule & {
    graphql?: {
        typeDefs: TypeDefs
        resolvers: Resolvers
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
                typeDefs: [],
                resolvers: []
            }
        } as Record<string, unknown>),
        loaders: {
            // This type of loader is called after each module is loaded
            // Which allows us to gather all passed typeDefs and resolvers
            onModuleLoad: [{
                during: 'pre-build',
                handler: (module, context) => {
                    const {
                        graphql
                    } = module as ExtendedModule
                    const extendedContext = context as ExtendedContext

                    if (!graphql || !Object.keys(graphql)) {
                        return
                    }

                    const {
                        typeDefs = [],
                        resolvers = []
                    } = graphql

                    extendedContext.graphql.typeDefs = extendedContext.graphql.typeDefs.concat(typeDefs)
                    extendedContext.graphql.resolvers = extendedContext.graphql.resolvers.concat(resolvers)
                }
            }],
            // This type of loader is called after all modules are loaded
            // Which allows us to create a merged schema from all gathered typeDefs and resolvers
            onModulesLoaded: [{
                after: 'pre-build',
                handler: (context) => {
                    const extendedContext = context as ExtendedContext
                    const {
                        graphql: {
                            typeDefs,
                            resolvers
                        }
                    } = extendedContext

                    // merge resolvers and typeDefs into one schema
                    extendedContext.graphql.schema = createMergedSchema(typeDefs, resolvers)
                }
            }]
        },
        hooks: {
            // This hook is called in the very end of the app initialization
            // Which allows us to create an ApolloServer instance and register it as a Fastify plugin
            onReady: async (context, fastify) => {
                const {
                    graphql: {
                        schema
                    }
                } = context as ExtendedContext
        
                // create apollo server instance with generated schema
                // and integrate it with Fastify instance
                const apollo = new ApolloServer<BaseContext>({
                    schema,
                    plugins: [
                        fastifyApolloDrainPlugin(fastify)
                    ]
                })
        
                await apollo.start()
        
                await fastify.register(fastifyApollo(apollo))
            }
        }
    }
}

export default GraphQLModule
