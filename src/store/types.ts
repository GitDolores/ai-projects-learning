import type { DtoCompany, DtoUnit, DtoUser, DtoMsgItem, DtoMenuNode } from '@/api/user'
import type { RouteRecordName } from 'vue-router'

export type cacheType = {
    mode: string
    name?: RouteRecordName
}

export type positionType = {
    startIndex?: number
    length?: number
}

export type appType = {
    sidebar: {
        opened: boolean
        withoutAnimation: boolean
        // 判断是否手动点击Collapse
        isClickCollapse: boolean
    }
    layout: string
    device: string
    viewportSize: { width: number; height: number }
    sortSwap: boolean
}

export type multiType = {
    path: string
    name: string
    meta: any
    query?: object
    params?: object
}

export type setType = {
    title: string
    fixedHeader: boolean
    hiddenSideBar: boolean
}

export type userType = {
    Avatar: string
    Roles?: Array<string>
    Permissions?: Array<string>
    CurrentPage?: number
    IsRemembered?: boolean
    LoginDay?: number
    User: DtoUser
    CompanyInfo: DtoCompany
    Funcs: Set<string>
    Units: Array<DtoUnit>
    Menus: Array<DtoMenuNode>
    MsgList: Array<DtoMsgItem>
}
