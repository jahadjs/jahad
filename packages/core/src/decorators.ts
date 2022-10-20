import DependencyContainer from "./dependency-container";

export function Injectable({
    namespace
}: {
    namespace: string
}) {
    return function (target: Function) {
        DependencyContainer.addInjectable(
            namespace,
            target as { new(): unknown }
            )
    }
}
