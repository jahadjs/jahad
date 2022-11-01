export function Injectable(options: { namespace: string }) {
    return function (target: Function) {
        Reflect.set(target, "injectableOptions", options)
    }
}
