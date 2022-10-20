import DependencyContainer from "./dependency-container";

export function Inject({
    namespace
}: {
    namespace: string
}) {
    return DependencyContainer.instantiate(namespace)
}
