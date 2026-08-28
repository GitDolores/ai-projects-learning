import { http } from '@/utils/http'

// ==================== 报告结构 ====================

/** 技术栈条目：用了什么技术、什么版本、干什么用的 */
export interface TechStackItem {
    Name: string

    Version: string

    Purpose: string
}

/** 技术栈分类（如：前端框架、构建工具、测试工具） */
export interface TechStackCategory {
    Category: string

    Items: TechStackItem[]
}

/** 核心模块：项目的关键组成部分，附大白话解释 */
export interface CoreModule {
    Name: string

    Path: string

    Responsibility: string

    PlainExplanation: string

    KeyFiles: string[]
}

/** 数据流步骤：数据从哪来、经过什么处理、最终到哪去 */
export interface DataFlowStep {
    Step: number

    Description: string
}

/** 设计模式：项目里用到的经典套路 */
export interface DesignPatternItem {
    Name: string

    Where: string

    PlainExplanation: string
}

/** 阅读建议：按什么顺序读最容易上手 */
export interface ReadingGuideItem {
    Order: number

    Suggestion: string
}

/** 仓库分析报告（通俗易懂版） */
export interface RepoAnalysisReport {
    RepoUrl: string

    RepoName: string

    DefaultBranch: string

    /** 一句话说明这个项目是做什么的 */
    Description: string

    /** 大白话概述，读完第一段就能明白项目价值 */
    PlainSummary: string

    TechStack: TechStackCategory[]

    /** 目录结构树（纯文本） */
    DirectoryTree: string

    CoreModules: CoreModule[]

    DataFlow: DataFlowStep[]

    DesignPatterns: DesignPatternItem[]

    ReadingGuide: ReadingGuideItem[]

    AnalyzedAt: string
}

/** 分析请求体（POST analyze） */
export interface AnalyzeRequest {
    RepoUrl: string

    /** true 时忽略缓存重新克隆分析 */
    ForceRefresh: boolean
}

/** SSE 流事件（analyze 接口每条 message 的 data 结构） */
export interface AnalysisSseEvent {
    Type: 'progress' | 'log' | 'report' | 'error' | 'done'

    /** progress：当前阶段 key，与页面 STAGES 对应（clone / scan / analyze / report） */
    Stage?: string

    StageName?: string

    /** progress：0-100 总进度 */
    Percent?: number

    Message?: string

    Report?: RepoAnalysisReport
}

// ==================== 缓存 ====================

/** 历史存档摘要（GET history 返回条目） */
export interface HistoryItem {
    RepoUrl: string

    RepoName: string

    DefaultBranch: string

    Description: string

    AnalyzedAt: string
}

/** 查询仓库的分析缓存；无缓存时返回 null */
export function getCachedReport(repoUrl: string) {
    return http.request<RepoAnalysisReport | null>('get', '/api/mpa/repoanalysis/cache', { params: { url: repoUrl } }, { noProgress: true })
}

/** 删除仓库的分析缓存 */
export function deleteCachedReport(repoUrl: string) {
    return http.request('delete', '/api/mpa/repoanalysis/cache', { params: { url: repoUrl } })
}

/** 历史存档列表（按分析时间倒序） */
export function getHistoryList() {
    return http.request<HistoryItem[]>('get', '/api/mpa/repoanalysis/history', {}, { noProgress: true })
}

// ==================== SSE 分析端点 ====================

/** SSE 流式分析走 fetchEventSource（axios 封装不支持流式读取），统一在此拼完整地址 */
export function getAnalyzeEndpoint() {
    const base: string = import.meta.env.VITE_BASE_URL
    return base + (base.endsWith('/') ? '' : '/') + 'api/mpa/repoanalysis/analyze'
}
