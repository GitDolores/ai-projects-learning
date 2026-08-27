import { http } from '@/utils/http'
export type MenuItem = {
    MenuId: string
    MenuPath: string
    ParentMenuId: string
    ParentMenuPath: string
    MenuName: string
    MenuTitle: string
    MenuIcon: string
    MenuRank: number | null
    Redirect: string
    Component: string
    Hidden: string
    ShowLink: string
    NoCache: string
    IsPage: string
    MenuType?: string
    MenuUrl?: string
}
export type MenuTreeNode = MenuItem & {
    FuncCodes: string[]
    Children: MenuTreeNode[]
    CreateBy: string
    CreateAt: string
    UpdateBy: string
    UpdateAt: string
}
export type MenuImportNode = {
    path: string
    func_code: string[]
    name: string
    meta: { title: string; icon: string; rank?: number; noCache?: boolean; showLink?: boolean }
    redirect?: string
    component?: string
    hidden?: string
    showLink?: string
    is_page?: string
    menu_type?: string
    menu_url?: string
    children?: MenuImportNode[]
}
export type MenuExportNode = {
    path: string
    func_code: string[]
    name: string
    meta: { title: string; icon: string; rank: number | null; noCache: boolean | null; showLink: boolean | null }
    redirect?: string
    component?: string
    hidden?: string
    showLink?: string
    menu_type?: string
    menu_url?: string
    children?: MenuExportNode[]
}
export type SysFuncItem = {
    FuncCode: string
    FuncName: string
    FuncDesc: string
    Enable: string
}
export type RelMenuFuncItem = {
    MenuId: string
    FuncCode: string
}
const BASE = 'api/mpa/SysTMenu'
/** 查询所有菜单（平铺列表） */
export const getMenuList = () => {
    return http.request<MenuItem[]>('get', BASE)
}
/** 查询菜单树结构 */
export const getMenuTree = () => {
    return http.request<MenuTreeNode[]>('get', BASE + '/tree')
}
/** 新增菜单 */
export const createMenu = (data: MenuItem) => {
    return http.request('post', BASE, { data })
}
/** 修改菜单 */
export const updateMenu = (data: MenuItem) => {
    return http.request('put', BASE, { data })
}
/** 删除菜单 */
export const deleteMenu = (menuId: string) => {
    return http.request('delete', BASE, { params: { MENUID: menuId } })
}
/** 查询菜单关联的权限 */
export const getMenuFuncs = (menuId: string) => {
    return http.request<RelMenuFuncItem[]>('get', BASE + '/funcs', { params: { MENUID: menuId } })
}
/** 为菜单设置权限 */
export const setMenuFuncs = (data: { MenuIds: string[]; FuncCode: string }) => {
    return http.request('post', BASE + '/funcs', { data })
}
/** 移除菜单的某个权限 */
export const deleteMenuFunc = (menuId: string, funcCode: string) => {
    return http.request('delete', BASE + '/funcs', { params: { MENUID: menuId, FUNCCODE: funcCode } })
}
/** 导入菜单 */
export const importMenus = (data: MenuImportNode[]) => {
    return http.request('post', BASE + '/import', { data })
}
/** 导出菜单 */
export const exportMenus = (menuPaths?: string) => {
    return http.request<MenuExportNode[]>('get', BASE + '/export', { params: { MENUPATHS: menuPaths || '' } })
}
/** 获取所有权限（下拉选择用） */
export const getAllFuncs = () => {
    return http.request<SysFuncItem[]>('get', 'api/mpa/SysTFunc/all')
}
