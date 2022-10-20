import {IModule, Reagent} from "./index";

const module: IModule = {
    identifier: 'main',
    server: (fastify) => {
        fastify.get('/', () => {
            return {hello: 'world'}
        })
    }
}

Reagent({
    modules: [
        module
    ]
})