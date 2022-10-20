import Logger from "./logger";

export class DependencyContainerClass {
    depsMap: Record<string, { new(): unknown }> = {}

    addInjectable(
        namespace: string,
        target: { new(): unknown }
        ) {
        this.depsMap = {
            ...this.depsMap,
            [namespace]: target
        }
    }

    instantiate(namespace: string) {
        const target = this.depsMap[namespace];

        if (!target) {
            Logger.info(`Class not found by namespace: ${namespace}`)
        }

        return new target()
    }
}

export default new DependencyContainerClass()