import { type RouterHistory, type RouteRecordRaw, type RouteComponent, createWebHistory, createWebHashHistory } from 'vue-router'
import { router } from './index'
import { isProxy, toRaw } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { isString, cloneDeep, isAllEmpty, intersection, storageLocal, isIncludeAllChildren } from '@pureadmin/utils'
import { getConfig } from '@/config'
import { buildHierarchyTree } from '@/utils/tree'
import { type menuType, routerArrays } from '@/layout/types'
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'
import { usePermissionStoreHook } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
const IFrame = () => import('@/layout/frame.vue')
const IFramePage = () => import('@/views/mpa/common/iframepage.vue')
const NotFound = () => import('@/views/error/NotFound.vue')
// https://cn.vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob('/src/views/**/*.{vue,tsx}')

// 动态路由
import mparoutesImported from '@/router/mparoutes'
import business from '@/router/business'
let mparoutes = mparoutesImported
if (import.meta.env.VITE_MPA_NO_MPA_MENU === 'true') {
    mparoutes = []
}
// 获取异步生成的路由
async function getAsyncRoutes() {
    const storeMenus = useUserStore().Menus
    if (storeMenus && storeMenus.length > 0) {
        console.log('使用服务端菜单生成路由，共 ' + storeMenus.length + ' 个顶级菜单' + ',mpa menu is ', mparoutes)
        return { success: true, data: [...mparoutes, ...storeMenus] }
    }
    console.log('服务端菜单为空，使用 business 路由作为 fallback')
    const mergedRoutes = [...mparoutes, ...business]
    return { success: true, data: mergedRoutes }
}

function handRank(routeInfo: any) {
    const { name, path, parentId, meta } = routeInfo
    return isAllEmpty(parentId) ? (isAllEmpty(meta?.rank) || (meta?.rank === 0 && name !== 'Home' && path !== '/' && path !== '/welcom') ? true : false) : false
}

/** 按照路由中meta下的rank等级升序来排序路由 */
function ascending(arr: any[]) {
    arr.forEach((v, index) => {
        // 当rank不存在时，根据顺序自动创建，首页路由永远在第一位
        if (handRank(v)) v.meta.rank = index + 2
    })
    return arr.sort((a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
        return a?.meta.rank - b?.meta.rank
    })
}

/** 过滤meta中showLink为N/false或hidden为Y/true的菜单 */
function filterTree(data: RouteComponent[]) {
    const newTree = cloneDeep(data).filter((v: { meta: { showLink: string | boolean; hidden: string | boolean } }) => {
        const show = v.meta?.showLink
        const hide = v.meta?.hidden
        return show !== 'N' && show !== false && hide !== 'Y' && hide !== true
    })
    newTree.forEach((v: { children }) => v.children && (v.children = filterTree(v.children)))
    return newTree
}

/** 过滤children长度为0的的目录，当目录下没有菜单时，会过滤此目录，目录没有赋予roles权限，当目录下只要有一个菜单有显示权限，那么此目录就会显示 */
function filterChildrenTree(data: RouteComponent[]) {
    const newTree = cloneDeep(data).filter((v: any) => v?.children?.length !== 0)
    newTree.forEach((v: { children }) => v.children && (v.children = filterTree(v.children)))
    return newTree
}

/** 判断两个数组彼此是否存在相同值 */
function isOneOfArray(a: Array<string>, b: Array<string>) {
    return Array.isArray(a) && Array.isArray(b) ? (intersection(a, b).length > 0 ? true : false) : true
}

/** 从localStorage里取出当前登录用户的角色roles，过滤无权限的菜单 */
function filterNoPermissionTree(data: RouteComponent[]) {
    // const currentRoles = storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? []
    console.log('filterNoPermissionTree data is ', data, useUserStore().Funcs)
    const newTree = cloneDeep(data).filter((v: any) => v.func_code == null || v.func_code.length === 0 || v.func_code.some((x) => useUserStore().Funcs.has(x)))
    newTree.forEach((v: any) => v.children && (v.children = filterNoPermissionTree(v.children)))
    const distRouteList = filterChildrenTree(newTree)
    console.log('filterNoPermissionTree result is ', distRouteList)
    return distRouteList
}

/** 通过指定 `key` 获取父级路径集合，默认 `key` 为 `path` */
function getParentPaths(value: string, routes: RouteRecordRaw[], key = 'path') {
    // 深度遍历查找
    function dfs(routes: RouteRecordRaw[], value: string, parents: string[]) {
        for (let i = 0; i < routes.length; i++) {
            const item = routes[i]
            // 返回父级path
            if (item[key] === value) return parents
            // children不存在或为空则不递归
            if (!item.children || !item.children.length) continue
            // 往下查找时将当前path入栈
            parents.push(item.path)

            if (dfs(item.children, value, parents).length) return parents
            // 深度遍历查找未找到时当前path 出栈
            parents.pop()
        }
        // 未找到时返回空数组
        return []
    }

    return dfs(routes, value, [])
}

/** 查找对应 `path` 的路由信息 */
function findRouteByPath(path: string, routes: RouteRecordRaw[]) {
    let res = routes.find((item: { path: string }) => item.path == path)
    if (res) {
        return isProxy(res) ? toRaw(res) : res
    } else {
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].children instanceof Array && routes[i].children.length > 0) {
                res = findRouteByPath(path, routes[i].children)
                if (res) {
                    return isProxy(res) ? toRaw(res) : res
                }
            }
        }
        return null
    }
}

function addPathMatch() {
    if (!router.hasRoute('pathMatch')) {
        router.addRoute({
            path: '/:pathMatch(.*)',
            name: 'pathMatch',
            redirect: '/error/404',
        })
    }
}
/** 处理动态路由（后端返回的路由） */
function handleAsyncRoutes(routeList) {
    // routeList = routeList.filter((v) => checkPermission(v))
    console.log('filter routeList ', routeList)
    if (routeList.length === 0) {
        usePermissionStoreHook().handleWholeMenus(routeList)
    } else {
        formatFlatteningRoutes(addAsyncRoutes(routeList)).map((v: RouteRecordRaw) => {
            // 防止重复添加路由
            if (router.options.routes[0].children.findIndex((value) => value.path === v.path) !== -1) {
                return
            } else {
                // 切记将路由push到routes后还需要使用addRoute，这样路由才能正常跳转
                router.options.routes[0].children.push(v)
                // 最终路由进行升序
                ascending(router.options.routes[0].children)
                if (!router.hasRoute(v?.name)) router.addRoute(v)
                const flattenRouters: any = router.getRoutes().find((n) => n.path === '/')
                // 保持router.options.routes[0].children与path为"/"的children一致，防止数据不一致导致异常
                flattenRouters.children = router.options.routes[0].children
                router.addRoute(flattenRouters)
            }
        })
        usePermissionStoreHook().handleWholeMenus(routeList)
    }
    if (!useMultiTagsStoreHook().getMultiTagsCache) {
        useMultiTagsStoreHook().handleTags('equal', [...routerArrays, ...usePermissionStoreHook().flatteningRoutes.filter((v) => v?.meta?.fixedTag)])
    }
    addPathMatch()
}
let times = 0
/** 初始化路由（`new Promise` 写法防止在异步请求中造成无限循环）*/
function initRouter() {
    console.log('初始化路由次数：' + ++times)
    if (getConfig()?.CachingAsyncRoutes) {
        // 开启动态路由缓存本地localStorage
        const key = 'async-routes'
        const asyncRouteList = storageLocal().getItem(key) as any
        if (asyncRouteList && asyncRouteList?.length > 0) {
            return new Promise((resolve) => {
                console.log('用缓存的菜单和路由')
                handleAsyncRoutes(asyncRouteList)
                resolve(router)
            })
        } else {
            return new Promise((resolve) => {
                console.log('缓存为空，所以先动态生成菜单和路由')
                getAsyncRoutes().then(({ data }) => {
                    console.log(data)
                    handleAsyncRoutes(cloneDeep(data))
                    storageLocal().setItem(key, data)
                    resolve(router)
                })
            })
        }
    } else {
        return new Promise((resolve) => {
            console.log('动态生成菜单和路由')
            getAsyncRoutes().then(({ data }) => {
                handleAsyncRoutes(cloneDeep(data))
                resolve(router)
            })
        })
    }
}

/**
 * 将多级嵌套路由处理成一维数组
 * @param routesList 传入路由
 * @returns 返回处理后的一维路由
 */
function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
    if (routesList == null) {
        return []
    }
    if (routesList.length === 0) return routesList
    let hierarchyList = buildHierarchyTree(routesList)
    for (let i = 0; i < hierarchyList.length; i++) {
        if (hierarchyList[i].children) {
            hierarchyList = hierarchyList.slice(0, i + 1).concat(hierarchyList[i].children, hierarchyList.slice(i + 1))
        }
    }
    return hierarchyList
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存）
 * https://github.com/pure-admin/vue-pure-admin/issues/67
 * @param routesList 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成规定路由的格式
 */
function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
    if (routesList.length === 0) return routesList
    const newRoutesList: RouteRecordRaw[] = []
    routesList.forEach((v: RouteRecordRaw) => {
        if (v.path === '/') {
            newRoutesList.push({
                component: v.component,
                name: v.name,
                path: v.path,
                redirect: v.redirect,
                meta: v.meta,
                children: [],
            })
        } else {
            newRoutesList[0]?.children.push({ ...v })
        }
    })
    return newRoutesList
}

/** 处理缓存路由（添加、删除、刷新） */
function handleAliveRoute({ name }: ToRouteType, mode?: string) {
    switch (mode) {
        case 'add':
            usePermissionStoreHook().cacheOperate({
                mode: 'add',
                name,
            })
            break
        case 'delete':
            usePermissionStoreHook().cacheOperate({
                mode: 'delete',
                name,
            })
            break
        case 'refresh':
            usePermissionStoreHook().cacheOperate({
                mode: 'refresh',
                name,
            })
            break
        default:
            usePermissionStoreHook().cacheOperate({
                mode: 'delete',
                name,
            })
            useTimeoutFn(() => {
                usePermissionStoreHook().cacheOperate({
                    mode: 'add',
                    name,
                })
            }, 100)
    }
}
// 扩展接口，添加新属性
type RouteRecordRawX = RouteRecordRaw & {
    func_code: string[]
    menu_type?: string
    url?: string
    children: RouteRecordRawX[]
}
/** 过滤后端传来的动态路由 重新生成规范路由 */
function addAsyncRoutes(arrRoutes: Array<RouteRecordRawX>) {
    if (!arrRoutes || !arrRoutes.length) return
    const modulesRoutesKeys = Object.keys(modulesRoutes)
    arrRoutes.forEach((v: RouteRecordRawX) => {
        // 后端 C# 序列化会给叶子菜单带 children: []，本地路由约定叶子节点无 children 属性；
        // children 为空数组的节点会被 filterChildrenTree 当成空目录过滤掉，这里先归一化
        if (Array.isArray(v.children) && v.children.length === 0) {
            delete v.children
        }
        // 将backstage属性加入meta，标识此路由为后端返回路由
        v.meta.backstage = true
        // 所有菜单默认显示父菜单（父级只有一个子菜单时也不折叠）
        v.meta.showParent = true

        // 菜单类型与链接地址（来自后端 MpaTSysMenu：PAGE / URL / TAB）
        const menuType = ((v.menu_type || v.meta?.menuType || 'PAGE') as string).toUpperCase()
        const menuUrl = (v.url || v.meta?.url || '') as string
        v.meta.menuType = menuType
        v.meta.url = menuUrl

        // 父级的redirect属性取值：如果子级存在且父级的redirect属性不存在，默认取第一个子级的path；如果子级存在且父级的redirect属性存在，取存在的redirect属性，会覆盖默认值
        if (v?.children && v.children.length && !v.redirect) v.redirect = v.children[0].path
        // 父级的name属性取值：如果子级存在且父级的name属性不存在，默认取第一个子级的name；如果子级存在且父级的name属性存在，取存在的name属性，会覆盖默认值（注意：测试中发现父级的name不能和子级name重复，如果重复会造成重定向无效（跳转404），所以这里给父级的name起名的时候后面会自动加上`Parent`，避免重复）
        if (v?.children && v.children.length && !v.name) v.name = (v.children[0].name as string) + 'Parent'

        if (menuType === 'URL') {
            // URL 类型：点击后在浏览器新标签页打开，复用 pure-admin 外链机制（name 为 url）
            v.name = menuUrl || v.name
            v.component = NotFound
        } else if (menuType === 'TAB') {
            // TAB 类型：iframe 页面，允许多开
            v.component = IFramePage
            v.meta.dynamicLevel = 10
        } else if (v.meta?.frameSrc) {
            v.component = IFrame
        } else if (v?.children && v.children.length) {
            // 父级容器路由：有指定组件则尝试解析，解析不到则不设置（靠 redirect 跳转）
            if (v.component) {
                const index = modulesRoutesKeys.findIndex((ev) => ev.includes(v.component as any))
                v.component = index !== -1 ? modulesRoutes[modulesRoutesKeys[index]] : undefined
            }
        } else {
            // 对后端传component组件路径和不传做兼容（如果后端传component组件路径，那么path可以随便写，如果不传，component组件路径会跟path保持一致）
            const index = v?.component ? modulesRoutesKeys.findIndex((ev) => ev.includes(v.component as any)) : modulesRoutesKeys.findIndex((ev) => ev.includes(v.path))
            v.component = index !== -1 ? modulesRoutes[modulesRoutesKeys[index]] : NotFound
        }
        if (v?.children && v.children.length) {
            addAsyncRoutes(v.children)
        }
    })
    return arrRoutes
}

/** 获取路由历史模式 https://next.router.vuejs.org/zh/guide/essentials/history-mode.html */
function getHistoryMode(routerHistory): RouterHistory {
    // len为1 代表只有历史模式 为2 代表历史模式中存在base参数 https://next.router.vuejs.org/zh/api/#%E5%8F%82%E6%95%B0-1
    const historyMode = routerHistory.split(',')
    const leftMode = historyMode[0]
    const rightMode = historyMode[1]
    // no param
    if (historyMode.length === 1) {
        if (leftMode === 'hash') {
            return createWebHashHistory('')
        } else if (leftMode === 'h5') {
            return createWebHistory('')
        }
    } //has param
    else if (historyMode.length === 2) {
        if (leftMode === 'hash') {
            return createWebHashHistory(rightMode)
        } else if (leftMode === 'h5') {
            return createWebHistory(rightMode)
        }
    }
}

/** 获取当前页面按钮级别的权限 */
function getAuths(): Array<string> {
    return router.currentRoute.value.meta.auths as Array<string>
}

/** 是否有按钮级别的权限（根据路由`meta`中的`auths`字段进行判断）*/
function hasAuth(value: string | Array<string>): boolean {
    if (!value) return false
    /** 从当前路由的`meta`字段里获取按钮级别的所有自定义`code`值 */
    const metaAuths = getAuths()
    if (!metaAuths) return false
    const isAuths = isString(value) ? metaAuths.includes(value) : isIncludeAllChildren(value, metaAuths)
    return isAuths ? true : false
}

function handleTopMenu(route) {
    if (route?.children && route.children.length > 1) {
        if (route.redirect) {
            return route.children.filter((cur) => cur.path === route.redirect)[0]
        } else {
            return route.children[0]
        }
    } else {
        return route
    }
}

/** 获取所有菜单中的第一个菜单（顶级菜单）*/
function getTopMenu(tag = false): menuType {
    const topMenu = handleTopMenu(usePermissionStoreHook().wholeMenus[0]?.children[0])
    console.log('got top menu is ', topMenu, usePermissionStoreHook().wholeMenus)
    tag && useMultiTagsStoreHook().handleTags('push', topMenu)
    return topMenu
}

export { hasAuth, getAuths, ascending, filterTree, initRouter, getTopMenu, addPathMatch, isOneOfArray, getHistoryMode, addAsyncRoutes, getParentPaths, findRouteByPath, handleAliveRoute, formatTwoStageRoutes, formatFlatteningRoutes, filterNoPermissionTree }
