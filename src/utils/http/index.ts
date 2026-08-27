import Axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type CustomParamsSerializer } from 'axios'
import type { PureHttpError, RequestMethods, PureHttpResponse, PureHttpRequestConfig } from './types.d'
import { stringify } from 'qs'
import NProgress from '../progress'
import { getToken, formatToken } from '@/utils/auth'
const { VITE_BASE_URL } = import.meta.env
import { message } from '@/utils/message'

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
// const defaultConfig: AxiosRequestConfig = {
//     // 请求超时时间
//     timeout: 10000,
//     baseURL: VITE_BASE_URL,
//     // 携带`cookie`凭证等信息
//     withCredentials: false,
//     // `axios`默认请求头
//     headers: {
//         Accept: 'application/json, text/plain, */*',
//         'Content-Type': 'application/json',
//         'X-Requested-With': 'XMLHttpRequest',
//     },
//     // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
//     paramsSerializer: {
//         serialize: stringify as unknown as CustomParamsSerializer,
//     },
// }

export type MpaPageResult<T> = {
    List: T[]
    Total: number
}

class PureHttp {
    constructor(config: AxiosRequestConfig) {
        this.Config = config
        console.log(config)
        this.axiosInstance = Axios.create(this.Config)
        this.httpInterceptorsRequest()
        this.httpInterceptorsResponse()
    }
    private Config: AxiosRequestConfig = null

    /** `token`过期后，暂存待执行的请求 */
    private requests = []

    /** 防止重复刷新`token` */
    private isRefreshing = false

    /** 初始化配置对象 */
    private initConfig: PureHttpRequestConfig = {}

    /** 保存当前`Axios`实例对象 */
    private axiosInstance: AxiosInstance = null

    /** 重连原始请求 */
    private retryOriginalRequest(config: PureHttpRequestConfig) {
        return new Promise((resolve) => {
            this.requests.push((token: string) => {
                config.headers['Authorization'] = formatToken(token)
                resolve(config)
            })
        })
    }

    /** 请求拦截 */
    private httpInterceptorsRequest(): void {
        this.axiosInstance.interceptors.request.use(
            async (config: PureHttpRequestConfig): Promise<any> => {
                // 开启进度条动画
                if (config.noProgress !== true) {
                    NProgress.start()
                }
                // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
                if (typeof config.beforeRequestCallback === 'function') {
                    config.beforeRequestCallback(config)
                    return config
                }
                if (this.initConfig.beforeRequestCallback) {
                    this.initConfig.beforeRequestCallback(config)
                    return config
                }
                /** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
                const whiteList = ['/refresh-token', '/login']
                return whiteList.some((url) => config.url.endsWith(url))
                    ? config
                    : new Promise((resolve) => {
                          const jwt = getToken()
                          if (jwt) {
                              config.headers['Authorization'] = formatToken(jwt)
                              resolve(config)
                          } else {
                              resolve(config)
                          }
                      })
            },
            (error) => {
                return Promise.reject(error)
            },
        )
    }

    /** 响应拦截 */
    private httpInterceptorsResponse(): void {
        const instance = this.axiosInstance
        instance.interceptors.response.use(
            (response: PureHttpResponse) => {
                const $config = response.config
                // 关闭进度条动画
                if ($config.noProgress !== true) {
                    NProgress.done()
                }
                // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
                if (typeof $config.beforeResponseCallback === 'function') {
                    $config.beforeResponseCallback(response)
                    return response.data
                }
                if (this.initConfig.beforeResponseCallback) {
                    this.initConfig.beforeResponseCallback(response)
                    return response.data
                }
                return response.data
            },
            (error: PureHttpError) => {
                const $error = error
                $error.isCancelRequest = Axios.isCancel($error)
                // 关闭进度条动画（错误分支的 config 为 axios 原生类型，收窄后访问自定义的 noProgress）
                const $errorConfig = $error.config as PureHttpRequestConfig | undefined
                if ($errorConfig?.noProgress !== true) {
                    NProgress.done()
                }
                // 所有的响应异常 区分来源为取消请求/非取消请求
                if ($error instanceof AxiosError) {
                    if ($error.code === 'ERR_NETWORK') {
                        message('网络错误，请稍后重试')
                    } else {
                        return Promise.reject($error)
                    }
                } else {
                    return Promise.reject($error)
                }
            },
        )
    }

    /** 通用请求工具函数 */
    public request<T>(method: RequestMethods, url: string, param?: AxiosRequestConfig, axiosConfig?: PureHttpRequestConfig): Promise<T> {
        const config = {
            method,
            url,
            ...param,
            ...axiosConfig,
        } as PureHttpRequestConfig

        // 单独处理自定义请求/响应回调
        return new Promise((resolve, reject) => {
            this.axiosInstance
                .request(config)
                .then((response: undefined) => {
                    resolve(response)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    }

    /** 单独抽离的`post`工具函数 */
    public post<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: PureHttpRequestConfig): Promise<T> {
        return this.request<T>('post', url, params, config)
    }

    /** 单独抽离的`get`工具函数 */
    public get<T, P>(url: string, params?: AxiosRequestConfig<P>, config?: PureHttpRequestConfig): Promise<T> {
        return this.request<T>('get', url, params, config)
    }

    public geturl(url: string, params?: Record<string, any>): string {
        const queryString = params ? `?${stringify(params)}` : ''
        return `${this.Config.baseURL.endsWith('/') ? this.Config.baseURL : this.Config.baseURL + '/'}${url}${queryString}`
    }
}

export const http = new PureHttp({
    // 请求超时时间
    timeout: 10000,
    baseURL: VITE_BASE_URL,
    // 携带`cookie`凭证等信息
    withCredentials: false,
    // `axios`默认请求头
    headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
    paramsSerializer: {
        serialize: stringify as unknown as CustomParamsSerializer,
    },
})
