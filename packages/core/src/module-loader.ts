import ReagentContext from "./reagent-context"
import DependencyContainer from "./dependency-container"
import { HookMap, ModuleHookNames, ModuleLoadHookStep, IModule } from "./types"

export default class ModuleLoader {
    private module: IModule
    private hookMap: HookMap = {
        appHooks: {
            onReady: [],
            onModuleLoad: {
                build: [],
                prebuild: []
            },
            onModulesLoaded: {
                prebuild: [],
                build: []
            }
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

    private async callModuleHooks(
            hookName: ModuleHookNames,
            hookType: ModuleLoadHookStep
        ) {
        const {
            appHooks: {
                [hookName]: {
                    [hookType]: hooks
                }
            }
        } = this.hookMap

        if (hooks.length) {
            for (const hook of hooks) {
                await hook.handler(this.module, this.context)
            }
        }
    }

    private async prebuild() {
        for (const identifier of this.loadOrder) {
            this.setNextModule(identifier)

            await this.registerInjectables()
            await this.applyContextExtensions()
            await this.registerEntities()

            await this.callModuleHooks(
                'onModuleLoad',
                'prebuild'
            )
        }

        await this.callModuleHooks(
            'onModulesLoaded',
            'prebuild'
        )
    }

    private async build() {
        for (const identifier of this.loadOrder) {
            this.setNextModule(identifier)

            await this.applyServerExtension()

            await this.callModuleHooks(
                'onModuleLoad',
                'build'
            )
        }

        await this.callModuleHooks(
            'onModulesLoaded',
            'build'
        )
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
                onReady,
                onModuleLoad,
                onModulesLoaded
            } = hooks

            if (onReady && onReady.length) {
                this.hookMap.appHooks.onReady = this.hookMap.appHooks.onReady.concat(onReady)
            }

            if (onModuleLoad && onModuleLoad.length) {
                // filter out hooks that are meant to be run during prebuild step
                const buildHooks = onModuleLoad.filter(hook => hook.during === 'build')
                // filter out hooks that are meant to be run during build step
                const preBuildHooks = onModuleLoad.filter(hook => hook.during === 'prebuild')

                if (buildHooks.length) {
                    this.hookMap.appHooks.onModuleLoad.build = this.hookMap.appHooks.onModuleLoad.build.concat(buildHooks)
                }

                if (preBuildHooks.length) {
                    this.hookMap.appHooks.onModuleLoad.prebuild = this.hookMap.appHooks.onModuleLoad.prebuild.concat(preBuildHooks)
                }
            }

            if (onModulesLoaded && onModulesLoaded.length) {
                // filter out hooks that are meant to be run during prebuild step
                const buildHooks = onModulesLoaded.filter(hook => hook.after === 'build')
                // filter out hooks that are meant to be run during build step
                const preBuildHooks = onModulesLoaded.filter(hook => hook.after === 'prebuild')

                if (buildHooks.length) {
                    this.hookMap.appHooks.onModulesLoaded.build = this.hookMap.appHooks.onModulesLoaded.build.concat(buildHooks)
                }

                if (preBuildHooks.length) {
                    this.hookMap.appHooks.onModulesLoaded.prebuild = this.hookMap.appHooks.onModulesLoaded.prebuild.concat(preBuildHooks)
                }
            }
        }
    }

    async loadModules() {
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

        if (onReady.length) {
            for (const hook of onReady) {
                await hook(this.context, this.context.getServerInstance())
            }
        }
    }
}
