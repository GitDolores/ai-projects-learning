const modules: Record<string, any> = import.meta.glob(['./*.ts', '!./index.ts'], { eager: true })

const businessRoutes: any[] = []

Object.keys(modules).forEach((key) => {
    const mod = modules[key].default
    if (Array.isArray(mod)) {
        businessRoutes.push(...mod)
    }
})

export default businessRoutes
