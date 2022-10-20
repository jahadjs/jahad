export const createModuleMap = (modules: ModuleList) => modules
.reduce((acc, curr) => {
    return {
        ...acc,
        [curr.identifier]: curr
    }
}, {}) as Record<string, IModule>