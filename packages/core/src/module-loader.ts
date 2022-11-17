import ReagentContext from "./reagent-context"
import DependencyContainer from "./dependency-container"
import { HookMap, IModule } from "./types"

export default class ModuleLoader {
    private module: IModule
    private hookMap: HookMap = {
        appHooks: {
            onReady: undefined
        }
    }

    constructor(
        private readonly loadOrder: string[],
        private context: ReagentContext,
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

    private async applyContextExtensions() {
        const {
            app
        } = this.module

        if (!app) {
            return
        }

        const {
            context
        } = app

        if (!context) {
            return
        }

        this.context = await context(this.context)
    }

    private setNextModule(identifier: string) {
        this.module = this.moduleMap[identifier]
    }

    private async prebuild() {
        for (const identifier of this.loadOrder) {
            this.setNextModule(identifier)

            await this.registerInjectables()
            await this.applyContextExtensions()
            await this.registerEntities()
        }
    }

    private async build() {
        for (const identifier of this.loadOrder) {
            this.setNextModule(identifier)

            await this.applyServerExtension()
        }
    }

    private async registerLoaders() {
        for (const identifier of this.loadOrder) {
            const {
                app
            } = this.moduleMap[identifier]

            if (!app) {
                return
            }

            const { loaders } = app

            if (!loaders || !Object.keys(loaders).length) {
                return;
            }

            const {
                onModuleLoad,
                onModulesLoaded
            } = loaders;

            if (onModuleLoad && onModuleLoad.length) {
                // register loaders that are called after each module load
            }

            if (onModulesLoaded && onModulesLoaded.length) {
                // register loaders that are called once load step is finished
            }
        }
    }

    private async registerHooks() {
        for (const identifier of this.loadOrder) {
            const {
                app
            } = this.moduleMap[identifier]

            if (!app || !Object.keys(app).length) {
                return
            }

            const {
                hooks
            } = app

            if (!hooks || !Object.keys(hooks)) {
                return
            }

            const {
                onReady
            } = hooks

            if (onReady) {
                this.hookMap.appHooks.onReady = onReady
            }
        }
    }

    async loadModules() {
        await this.registerLoaders()
        await this.registerHooks()
        // perform all steps needed to load and init modules
        await this.prebuild()
        await this.build()

        await this.ready()
    }

    private async ready() {
        const {
            appHooks: {
                onReady
            }
        } = this.hookMap

        if (onReady) {
            await onReady(this.context, this.context.getServerInstance())
        }
    }
}
