import { http } from '@/utils/http'

export interface SuperJobConfigItem {
    ConfigId: string

    JobCode: string

    JobName: string

    CronExpression: string

    JobParams: string

    IsEnable: string

    Remark: string

    CreateAt: string

    CreateBy: string

    UpdateAt: string

    UpdateBy: string
}

export interface SuperJobStatusItem {
    ConfigId: string

    JobCode: string

    JobName: string

    CronExpression: string

    IsEnable: string

    LastExecutionTime: string | null

    LastDurationMs: number

    LastResult: string | null

    LastStatus: string | null

    NextExecutionTime: string | null

    ProgressPercent: number
}

export interface SuperJobLogItem {
    LogId: string

    ExecutionId: string

    ConfigId: string

    JobCode: string

    JobName: string

    ScheduledAt: string

    StartTime: string

    EndTime: string

    DurationMs: number

    Status: string

    ResultMsg: string

    InstanceId: string

    CreateAt: string
}

export interface SuperJobDashboardData {
    ActiveTasksCount: number

    TodayTotalExecutions: number

    TodaySuccessExecutions: number

    TodayFailedExecutions: number

    PerMinuteExecutions: { Label: string; Value: number }[]

    TodayPerTaskExecutions: { Label: string; Value: number }[]

    YesterdayPerTaskSuccessCount: { Label: string; Value: number }[]

    HourlySuccessFail: { Hour: string; SuccessCount: number; FailCount: number }[]
}

export interface SuperJobResult<T = any> {
    success: boolean

    data?: T
}

export interface SuperJobPageResult<T = any> {
    total: number

    list: T[]
}

// ==================== 看板 ====================

export function getDashboard() {
    return http.request<SuperJobDashboardData>('get', '/api/mpa/superjob/dashboard')
}

// ==================== 任务状态 ====================

export function getStatusList() {
    return http.request<SuperJobStatusItem[]>('get', '/api/mpa/superjob/status/list', null, { noProgress: true })
}

export function stopJob(configId: string) {
    return http.request('post', `/api/mpa/superjob/status/stop/${configId}`)
}

export function continueJob(configId: string) {
    return http.request('post', `/api/mpa/superjob/status/continue/${configId}`)
}

// ==================== 任务日志 ====================

export function getLogPage(params: { page: number; limit: number; jobCode?: string; status?: string; startTime?: string; endTime?: string }) {
    return http.request<{ List: SuperJobLogItem[]; Total: number }>('get', '/api/mpa/superjob/log/page', { params })
}

// ==================== 任务配置 ====================

export function getConfigPage(params: any) {
    return http.request<{ List: SuperJobConfigItem[]; Total: number }>('get', '/api/mpa/superjob/config/page', { params })
}

export function getActiveConfigList() {
    return http.request<SuperJobConfigItem[]>('get', '/api/mpa/superjob/config/active-list')
}

export function createConfig(data: Partial<SuperJobConfigItem>) {
    return http.request<SuperJobConfigItem>('post', '/api/mpa/superjob/config', { data })
}

export function updateConfig(configId: string, data: Partial<SuperJobConfigItem>) {
    return http.request<SuperJobConfigItem>('put', `/api/mpa/superjob/config/${configId}`, { data })
}

export function deleteConfig(configId: string) {
    return http.request('delete', `/api/mpa/superjob/config/${configId}`)
}

export function triggerJob(configId: string) {
    return http.request('post', `/api/mpa/superjob/trigger/${configId}`)
}

export function validateCron(expression: string) {
    return http.request<{ IsValid: boolean; NextTimes: string[] }>('get', '/api/mpa/superjob/validate-cron', { params: { expression } })
}
