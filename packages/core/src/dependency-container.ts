import Logger from "./logger";
import {Class} from "type-fest";

export class DependencyContainerClass {
    private depsMap: Record<string, Class<any>> = {}

    private depsCache: Record<string, Class<any>> = {}

    addInjectable(
        namespace: string,
        target: Class<any>
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

        // return existing instance if exists
        if (this.depsCache[namespace]) {
            return this.depsCache[namespace]
        }

        const instance = new target()

        // save instance for further usage
        this.depsCache[namespace] = instance

        return instance
    }
}

export default new DependencyContainerClass()