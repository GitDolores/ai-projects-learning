import type { App } from 'vue'
const { VITE_BASE_URL } = import.meta.env
import { ElMessageBox } from 'element-plus'
import { AxiosError } from 'axios'

// http状态映射关系
const HttpStatus = {
    400: '错误请求',
    401: '未授权 对于需要登录的网页，服务器可能返回此响应。',
    403: '禁止',
    404: '请求的地址不存在，无法进行访问',
    405: '方法禁用',
    406: '不接受',
    407: '需要代理授权',
    408: '请求超时',
    409: '冲突 服务器必须在响应中包含有关冲突的信息。',
    410: '已删除',
    411: '需要有效长度',
    412: '未满足前提条件',
    413: '请求实体过大',
    414: '请求的 URI 过长',
    415: '不支持的媒体类型',
    416: '请求范围不符合要求',
    417: '未满足期望值',
    '5xx': '服务器错误 这些错误可能是服务器本身的错误，而不是请求出错。',
    500: '服务器内部错误',
    501: '尚未实施 例如，服务器无法识别请求方法时可能会返回此代码。',
    502: '错误网关',
    503: '服务不可用 通常，这只是暂时状态。',
    504: '网关超时',
    505: 'HTTP 版本不受支持',
    GetText: function (code) {
        const text = this[code.toString()]
        if (text == null) {
            return code.toString()
        } else {
            return text
        }
    },
}

function getErrorFromAxiosError(msg?: string | AxiosError): string {
    if (msg == null) {
        return ''
    } else if (typeof msg === 'string') {
        return msg as string
    } else if (msg instanceof AxiosError) {
        if (msg.response && msg.response.data && msg.response.data !== '') {
            const data = msg.response.data as any
            if (data.Message) {
                if (data.Message === '出现错误。') {
                    return data.ExceptionMessage
                } else {
                    return data.Message + ':' + data.ExceptionMessage
                }
            } else {
                return HttpStatus.GetText(msg.response.status)
            }
        } else {
            return HttpStatus[msg.status]
        }
    } else {
        return msg
    }
}
export const Mpa = {
    baseURL: VITE_BASE_URL,
    install(app: App): void {
        app.config.globalProperties.$mpa = this
        app.config.globalProperties.$jwt = function () {
            const jwttoken = sessionStorage.getItem('Admin-Token')
            const raw = jwttoken.split('.')[1]
            const jwt = JSON.parse(decodeURIComponent(escape(window.atob(raw.replace(/-/g, '+').replace(/_/g, '/')))))
            return jwt
        }
        app.config.globalProperties.$download = function (urlPath, queryParams, baseUrl) {
            let a = ''
            if (baseUrl != null) {
                if (baseUrl[baseUrl.length - 1] === '/') {
                    a = baseUrl.slice(0, baseUrl.length - 1)
                } else {
                    a = baseUrl
                }
                if (urlPath[0] === '/') {
                    a = a + urlPath
                } else {
                    a = a + '/' + urlPath
                }
            } else {
                a = urlPath
            }
            const jwt = app.config.globalProperties.$jwt()
            a = a + '?jwt-guid=' + jwt.gid
            if (queryParams == null) {
                queryParams = {}
            }
            for (const p in queryParams) {
                a = a + '&' + p + '=' + queryParams[p]
            }

            window.open(a, '_blank')
        }
        app.config.globalProperties.$downloadapi = function (urlPath, queryParams) {
            const baseUrl = VITE_BASE_URL
            app.config.globalProperties.$download(urlPath, queryParams, baseUrl)
        }
        app.config.globalProperties.$hello = function () {
            alert('hello, it is from the Vue.prototype')
        }

        // 为vue实例提供 $alertx 函数，其与 $alert 的区别是，增加了对axios的返回response的错误解析
        app.config.globalProperties.alertx = function (msg, title) {
            const msgs = getErrorFromAxiosError(msg)
            app.config.globalProperties.$alert(msgs, title)
        }
        // 为vue实例提供 $alertx 函数，其与 $alert 的区别是，增加了对axios的返回response的错误解析
        window.alertx = function (title: string, msg?: string | AxiosError) {
            console.log(msg)
            const content = getErrorFromAxiosError(msg)
            ElMessageBox.alert(content, title)
        }
    },
}
