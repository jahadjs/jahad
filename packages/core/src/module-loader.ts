import ReagentContext from "./reagent-context"
import DependencyContainer from "./dependency-container";
import {IModule} from "./types";

export default class ModuleLoader {
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
