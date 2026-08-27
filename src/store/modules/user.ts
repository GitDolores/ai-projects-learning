import { defineStore } from 'pinia'
import { type userType, store, router, resetRouter, routerArrays } from '../utils'
import { type UserResult, getLogin, refreshTokenApi, getUserInfo, getMsgList } from '@/api/user'
import { initRouter } from '@/router/utils'
import { useMultiTagsStoreHook } from './multiTags'
import { setToken, removeToken } from '@/utils/auth'
import { http } from '@/utils/http'
let timer = null
export const useUserStore = defineStore('pure-user', {
    state: (): userType => ({
        // 页面级别权限
        Roles: [],
        // 按钮级别权限
        Permissions: [],
        // 判断登录页面显示哪个组件（0：登录（默认）、1：手机登录、2：二维码登录、3：注册、4：忘记密码）
        CurrentPage: 0,
        // 是否勾选了登录页的免登录
        IsRemembered: false,
        // 登录页的免登录存储几天，默认7天
        LoginDay: 7,
        Avatar: http.geturl('api/mpa/config/selfinfo/avator-any?usercode='),
        // 用户信息
        User: null,
        // 公司信息
        CompanyInfo: null,
        // 权限信息
        Funcs: new Set(),
        // 机构信息
        Units: [],
        // 服务端菜单树
        Menus: [],
        MsgList: [],
    }),
    actions: {
        SET_AVATAR() {
            console.log('更新头像成功2')
            if (this.User != null) {
                const nurl = http.geturl('api/mpa/config/selfinfo/avator-any?usercode=' + this.User.UserCode + '&t=' + new Date().getTime())
                console.log('更新头像成功3', nurl)
                this.Avatar = nurl
            }
        },
        /** 存储角色 */
        SET_ROLES(roles: Array<string>) {
            this.Roles = roles
        },
        /** 存储按钮级别权限 */
        SET_PERMS(permissions: Array<string>) {
            this.Permissions = permissions
        },
        /** 存储登录页面显示哪个组件 */
        SET_CURRENTPAGE(value: number) {
            this.CurrentPage = value
        },
        /** 存储是否勾选了登录页的免登录 */
        SET_ISREMEMBERED(bool: boolean) {
            this.IsRemembered = bool
        },
        /** 设置登录页的免登录存储几天 */
        SET_LOGINDAY(value: number) {
            this.LoginDay = Number(value)
        },
        /** 登入 */
        async loginByUsername(data) {
            return new Promise<UserResult>((resolve, reject) => {
                getLogin(data)
                    .then((data) => {
                        if (data?.Status === 'Y') setToken({ Jwt: data.Data, Expires: data.Exp })
                        resolve(data)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        async makeUserInfo() {
            try {
                const r = await getUserInfo()
                this.User = r.User
                this.CompanyInfo = r.Company
                console.log('get funcs in userinfo ', r.Funcs)
                this.Funcs = new Set(r.Funcs)

                this.Units = r.Units
                this.Menus = r.Menus || []
                this.SET_AVATAR()
                resetRouter()
                const routerx = await initRouter()
                console.log('在userStore中获取用户信息重置路由后，立即生成动态路由')
                return routerx
            } catch (error) {
                console.log(error)
                this.logOut()
                throw error
            }
        },
        /** 前端登出（不调用接口） */
        logOut() {
            this.Roles = []
            this.Permissions = []
            this.User = null
            this.CompanyInfo = null
            this.Funcs = new Set()
            this.Units = []
            useMultiTagsStoreHook().handleTags('equal', [...routerArrays])
            resetRouter()
            removeToken()
            console.debug('resetRouter')
            router.push('/login')
        },
        /** 刷新`token` */
        async handRefreshToken() {
            return new Promise<UserResult>((resolve, reject) => {
                refreshTokenApi()
                    .then((data) => {
                        if (data) {
                            setToken({ Jwt: data.Data, Expires: data.Exp })
                            resolve(data)
                        }
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        refreshMsgList() {
            if (timer != null) {
                clearInterval(timer)
            }
            const meLogout = this.logOut
            timer = setInterval(async () => {
                try {
                    if (this.User != null) {
                        const r = await getMsgList()
                        this.MsgList = r
                    }
                } catch (ex: any) {
                    if (ex.status === 401) {
                        console.log('useRouter().currentRoute.value.hash', router.currentRoute.value)
                        if (router.currentRoute.value.path !== '/login') {
                            meLogout()
                        }
                    }
                }
            }, 5000)
        },
    },
})

export function useUserStoreHook() {
    return useUserStore(store)
}
