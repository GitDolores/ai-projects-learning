import { http } from '@/utils/http'

export type UserResult = {
    Data: string
    Exp: string
    Msg: string
    Status: string
}

export type RefreshTokenResult = {
    success: boolean
    data: {
        /** `token` */
        accessToken: string
        /** 用于调用刷新`accessToken`的接口时所需的`token` */
        refreshToken: string
        /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
        expires: Date
    }
}

export type DtoSelfInfo = {
    /** 头像 */
    Avatar: string
    /** 用户名 */
    UserName: string
    /** 昵称 */
    NickName: string
    /** 邮箱 */
    EMail: string
    /** 联系电话 */
    PhoneNo: string
    Sex: string
    LoginName: string
}
export type DtoUser = {
    Avatar: string
    UserCode: string
    CompanyCode: string
    EMail: string
    Enable: string
    LoginName: string
    Password: string
    PwdSalt: string
    PhoneNo: string
    Sex: string
    Expire: Date
    UserName: string
    TwoFactorSecretCode: string
    TwoFactorSecretTime: Date
    UserType: string
    MsgTime: Date
}
export type DtoUnit = {
    UnitId: string
    UName: string
    UType: string
    ParentId: string
    CompanyCode: string
}
export type DtoCompany = {
    CompanyCode: string
    CompanyName: string
    ShortName: string
    Enable: string
    LoginTitle: string
    PhoneNo: string
    SuperAdmin: string
    Expire: Date
    CompanyType: string
    Unit: Array<DtoUnit>
    CreateTime: Date
    PayType: string
}
export type DtoMenuMeta = {
    title: string
    icon: string
    rank: number | null
    showLink: string
    noCache: string
    hidden: string
}

export type DtoMenuNode = {
    path: string
    name: string
    component: string
    redirect: string
    menu_type?: string
    url?: string
    func_code: string[]
    meta: DtoMenuMeta
    children: DtoMenuNode[]
}

export type DtoUserInfo = {
    Introduction: string
    Avatar: string
    UserName: string
    LoginName: string
    UserCode: string
    User: DtoUser
    Company: DtoCompany
    Funcs: Array<string>
    Doms: Array<string>
    Menus: Array<DtoMenuNode>
    Units: Array<DtoUnit>
}

/** 登录 */
export const getLogin = (data?: object) => {
    return http.request<UserResult>('post', 'api/mpa/systoken', { data })
}
/** 获取用户信息 **/
export const getUserInfo = () => {
    return http.request<DtoUserInfo>('get', 'api/mpa/sysuserinfo')
}
/** 刷新`token` */
export const refreshTokenApi = () => {
    return http.request<UserResult>('get', 'api/mpa/systoken')
}

/** 账户设置-个人信息 */
export const getMine = () => {
    return new Promise<DtoSelfInfo>((resolve, reject) => {
        http.request<DtoSelfInfo>('get', 'api/mpa/config/selfinfo')
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

/** 账户设置-个人安全日志 */
export const getMineLogs = (currentPage: number, pageSize: number) => {
    return http.request<DtoPageModel<DtoLoginLog>>('get', 'api/mpa/config/selfinfo/login-log/page', {
        params: { pageSize, currentPage },
    })
}

export const setMine = (data?: DtoSelfInfo) => {
    return http.request<DtoSelfInfo>('put', 'api/mpa/config/selfinfo', {
        data,
    })
}

/** 头像上传 */
export const AvatorUpload = (data) => {
    return http.request(
        'post',
        'api/mpa/config/selfinfo/avator',
        { data },
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    )
}
export type DtoLoginLog = {
    Token: string
    MsgTime: Date
    PreToken: string
    UserIP: string
    UserCode: string
    TokenRaw: string
    Location: string
}
export type DtoMsgItem = {
    MsgId: string
    SendToUserCode: string
    Title: string
    Content: string
    Link: string
    MsgType: string
    MsgTime: Date
    ReadTime: Date
    IsRead: string
    Deleted: string
    Level: 'primary' | 'success' | 'warning' | 'info' | 'danger'
}
export function getMsgList() {
    return http.request<Array<DtoMsgItem>>('get', 'api/mpa/msg/msg/unread')
}
export function readMsgItem(id: string) {
    return http.request('put', 'api/mpa/msg/msg/read?msgid=' + id)
}
export function changeOwnPwd(oldPwd: string, newPwd: string) {
    return http.request('post', 'api/mpa/syschangeownpassword', {
        data: {
            NewPassword: newPwd,
            OldPassword: oldPwd,
        },
    })
}
export function getGoogleBindTime() {
    return http.request<string>('get', 'api/mpa/systwofactor/bindtime')
}
export function getGoogleBindCode() {
    return http.request<string>('get', 'api/mpa/systwofactor/setupcode')
}
export function setGoogleBindCode(code: string) {
    return http.request('post', 'api/mpa/systwofactor/bind', {
        params: {
            code: code,
        },
    })
}
export function removeGoogleKey(key: string) {
    return http.request('delete', 'api/mpa/systwofactor', {
        params: { code: key },
    })
}
export function setUserConfig(item: { code: string; value: string }) {
    return http.request('put', 'api/mpa/config/selfinfo/config', {
        data: { ConfigCode: item.code, ConfigValue: item.value },
    })
}
export function getUserConfig(configCode: string) {
    return http.request('get', 'api/mpa/config/selfinfo/config', {
        params: { ConfigCode: configCode },
    })
}
export function getVCodeInfo() {
    return http.request<DtoCaptchaRes>('get', 'api/mpa/systoken/captcha')
}
export type DtoCaptchaRes = {
    Enable: string
    GifB64: string
    Secret: string
    Msg: string
}
