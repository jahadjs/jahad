export function Injectable(options: { namespace: string }) {
    return function (target: Function) {
        Reflect.set(target, "injectableOptions", options)
    }
}

export function Controller(prefix?: string) {
    return function (target: Function) {
        Reflect.set(
            target,
            'controllerOptions',
            {
                prefix
            }
        )
    }
}

export function Get(path?: string) {
    return function(target: Function) {
        Reflect.set(
            target,
            'routeOptions',
            {
                method: 'GET',
                path
            }
        )
    }
}
