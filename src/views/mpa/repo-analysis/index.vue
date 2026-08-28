<template>
    <div class="main main-content">
        <el-card shadow="never" class="mb-4">
            <div class="flex items-center gap-2">
                <el-input
                    v-model="repoUrl"
                    placeholder="请输入 GitHub 仓库地址，如 https://github.com/vuejs/pinia"
                    clearable
                    size="large"
                    :disabled="isAnalyzing"
                    @keyup.enter="onAnalyze(false)"
                />
                <el-tooltip content="忽略缓存，重新克隆并分析" :disabled="isAnalyzing">
                    <el-button size="large" :loading="isAnalyzing" :disabled="!repoUrl.trim() || isAnalyzing" @click="onAnalyze(true)">
                        重新分析
                    </el-button>
                </el-tooltip>
                <el-button
                    type="primary"
                    size="large"
                    :loading="isAnalyzing"
                    :disabled="!repoUrl.trim() || isAnalyzing"
                    @click="onAnalyze(false)"
                >
                    {{ isAnalyzing ? '分析中…' : '开始分析' }}
                </el-button>
                <el-button v-if="isAnalyzing" size="large" type="danger" plain @click="onStop">停止</el-button>
            </div>
        </el-card>

        <!-- 历史存档 -->
        <el-card v-if="history.length > 0" shadow="never" class="mb-4">
            <template #header>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-bold">🕘 历史存档</span>
                    <el-button link size="small" :loading="historyLoading" @click="loadHistory">刷新</el-button>
                </div>
            </template>
            <div class="history-list">
                <div
                    v-for="item in history"
                    :key="item.RepoUrl"
                    class="history-item"
                    @click="onReopen(item.RepoUrl)"
                >
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold">{{ item.RepoName }}</span>
                            <el-tag size="small" type="info">{{ item.DefaultBranch }}</el-tag>
                        </div>
                        <div class="history-desc">{{ item.Description }}</div>
                        <div class="history-meta">分析于 {{ item.AnalyzedAt }} · {{ item.RepoUrl }}</div>
                    </div>
                    <div class="flex items-center gap-1" @click.stop>
                        <el-tooltip content="填入输入框，重新查看报告">
                            <el-button size="small" type="primary" link @click="onReopen(item.RepoUrl)">回看</el-button>
                        </el-tooltip>
                        <el-popconfirm title="删除该历史报告？" confirm-button-text="删除" cancel-button-text="取消" @confirm="onDeleteHistory(item.RepoUrl)">
                            <template #reference>
                                <el-button size="small" type="danger" link>删除</el-button>
                            </template>
                        </el-popconfirm>
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 分析进度 -->
        <el-card v-if="isAnalyzing || progressLogs.length > 0" shadow="never" class="mb-4">
            <template #header>
                <div class="flex items-center justify-between">
                    <span>分析进度</span>
                    <span class="text-sm text-gray-400">{{ currentStageName }} · {{ percent }}%</span>
                </div>
            </template>
            <el-progress :percentage="percent" :stroke-width="10" :status="percent >= 100 ? 'success' : undefined" />
            <el-timeline class="mt-4">
                <el-timeline-item
                    v-for="(log, index) in progressLogs"
                    :key="index"
                    :timestamp="log.time"
                    :type="log.type"
                    placement="top"
                >
                    {{ log.text }}
                </el-timeline-item>
            </el-timeline>
        </el-card>

        <!-- 分析报告 -->
        <template v-if="report">
            <el-card shadow="never" class="mb-4">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="text-lg font-bold">📋 项目概述</span>
                        <div class="flex items-center gap-2">
                            <el-tag type="info">{{ report.DefaultBranch }}</el-tag>
                            <el-tag type="success">分析于 {{ report.AnalyzedAt }}</el-tag>
                        </div>
                    </div>
                </template>
                <h3 class="mt-0 mb-2">{{ report.RepoName }}</h3>
                <p class="text-gray-500 mt-0">{{ report.Description }}</p>
                <el-divider />
                <p class="leading-7">{{ report.PlainSummary }}</p>
            </el-card>

            <el-card shadow="never" class="mb-4">
                <template #header><span class="text-lg font-bold">🧰 技术栈</span></template>
                <div v-for="category in report.TechStack" :key="category.Category" class="mb-4">
                    <div class="mb-2 font-semibold">{{ category.Category }}</div>
                    <el-table :data="category.Items" border stripe size="small">
                        <el-table-column prop="Name" label="技术" width="180" />
                        <el-table-column prop="Version" label="版本" width="100" />
                        <el-table-column prop="Purpose" label="干什么用的" min-width="300" />
                    </el-table>
                </div>
            </el-card>

            <el-card shadow="never" class="mb-4">
                <template #header><span class="text-lg font-bold">📁 目录结构</span></template>
                <pre class="directory-tree">{{ report.DirectoryTree }}</pre>
            </el-card>

            <el-card shadow="never" class="mb-4">
                <template #header><span class="text-lg font-bold">🧩 核心模块</span></template>
                <el-collapse>
                    <el-collapse-item v-for="module in report.CoreModules" :key="module.Name" :name="module.Name">
                        <template #title>
                            <span class="font-semibold">{{ module.Name }}</span>
                            <el-tag size="small" type="info" class="ml-2">{{ module.Path }}</el-tag>
                        </template>
                        <p class="mt-0 text-gray-600">{{ module.Responsibility }}</p>
                        <el-alert type="success" :closable="false" class="mb-3">
                            💡 通俗理解：{{ module.PlainExplanation }}
                        </el-alert>
                        <div v-if="module.KeyFiles?.length">
                            <div class="mb-1 text-sm text-gray-400">关键文件：</div>
                            <el-tag v-for="file in module.KeyFiles" :key="file" size="small" class="mr-2 mb-1">{{ file }}</el-tag>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </el-card>

            <el-card shadow="never" class="mb-4">
                <template #header><span class="text-lg font-bold">🔄 数据流</span></template>
                <el-steps direction="vertical" :active="report.DataFlow.length" finish-status="success">
                    <el-step v-for="step in report.DataFlow" :key="step.Step" :title="`第 ${step.Step} 步`" :description="step.Description" />
                </el-steps>
            </el-card>

            <el-card shadow="never" class="mb-4">
                <template #header><span class="text-lg font-bold">🎨 设计模式</span></template>
                <template v-if="report.DesignPatterns?.length">
                    <div v-for="pattern in report.DesignPatterns" :key="pattern.Name" class="pattern-item">
                        <div class="mb-1">
                            <span class="font-semibold">{{ pattern.Name }}</span>
                            <el-tag size="small" type="warning" class="ml-2">{{ pattern.Where }}</el-tag>
                        </div>
                        <p class="mt-0 mb-0 text-gray-600">{{ pattern.PlainExplanation }}</p>
                    </div>
                </template>
                <el-empty v-else description="未识别到显著的设计模式" :image-size="60" />
            </el-card>

            <el-card shadow="never">
                <template #header><span class="text-lg font-bold">📚 阅读建议</span></template>
                <el-timeline>
                    <el-timeline-item
                        v-for="guide in report.ReadingGuide"
                        :key="guide.Order"
                        :timestamp="`第 ${guide.Order} 步`"
                        placement="top"
                        type="primary"
                    >
                        {{ guide.Suggestion }}
                    </el-timeline-item>
                </el-timeline>
            </el-card>
        </template>

        <el-empty v-else-if="!isAnalyzing && progressLogs.length === 0" description="输入 GitHub 仓库地址，开始生成通俗分析报告" />

        <!-- 初音未来动态形象（页面吉祥物） -->
        <div class="miku-mascot" title="初音未来为你加油 ♪">
            <ReMiku :size="120" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchEventSource, EventSourceMessage } from '@microsoft/fetch-event-source'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import { getAnalyzeEndpoint, getCachedReport, getHistoryList, deleteCachedReport, AnalysisSseEvent, HistoryItem, RepoAnalysisReport } from '@/api/repo-analysis'
import ReMiku from '@/components/ReMiku/index.vue'

defineOptions({ name: 'RepoAnalysis' })

const repoUrl = ref('')
const isAnalyzing = ref(false)
const percent = ref(0)
const report = ref<RepoAnalysisReport | null>(null)

const history = ref<HistoryItem[]>([])
const historyLoading = ref(false)

async function loadHistory() {
    historyLoading.value = true
    try {
        history.value = (await getHistoryList()) ?? []
    } catch {
        // 历史加载失败不阻断页面，面板隐藏即可
        history.value = []
    } finally {
        historyLoading.value = false
    }
}

/** 回看历史：填入 URL 并直接走缓存查询展示 */
async function onReopen(url: string) {
    if (isAnalyzing.value) return
    repoUrl.value = url
    await onAnalyze(false)
}

async function onDeleteHistory(url: string) {
    try {
        await deleteCachedReport(url)
        history.value = history.value.filter(h => h.RepoUrl !== url)
        if (report.value?.RepoUrl === url) report.value = null
        ElMessage.success('已删除')
    } catch {
        ElMessage.error('删除失败')
    }
}

onMounted(loadHistory)

interface ProgressLog {
    time: string
    text: string
    type: 'primary' | 'success' | 'warning' | 'danger'
}
const progressLogs = ref<ProgressLog[]>([])
const currentStageName = ref('准备中')

/** 阶段中文名映射（与后端 Stage key 约定一致） */
const stageNames: Record<string, string> = {
    clone: '克隆仓库',
    scan: '扫描源码',
    analyze: '深度分析',
    report: '生成报告',
}

let abortController: AbortController | null = null

function now() {
    return new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

function addLog(text: string, type: ProgressLog['type'] = 'primary') {
    progressLogs.value.push({ time: now(), text, type })
}

function handleSseEvent(event: AnalysisSseEvent) {
    if (event.Type === 'progress') {
        if (event.Stage) currentStageName.value = event.StageName || stageNames[event.Stage] || event.Stage
        if (typeof event.Percent === 'number') percent.value = Math.min(100, Math.max(0, Math.round(event.Percent)))
        if (event.Message) addLog(event.Message)
    } else if (event.Type === 'log') {
        if (event.Message) addLog(event.Message, 'primary')
    } else if (event.Type === 'report' && event.Report) {
        report.value = event.Report
    } else if (event.Type === 'error') {
        addLog(event.Message || '分析失败', 'danger')
        ElMessage.error(event.Message || '分析失败')
    }
}

async function onAnalyze(forceRefresh: boolean) {
    const url = repoUrl.value.trim()
    if (!url) return

    // 先查缓存：命中且非强制刷新时直接展示，不发 SSE
    if (!forceRefresh) {
        try {
            const cached = await getCachedReport(url)
            if (cached) {
                report.value = cached
                progressLogs.value = []
                percent.value = 100
                currentStageName.value = '已完成（命中缓存）'
                ElMessage.success('该仓库已分析过，直接展示缓存报告')
                return
            }
        } catch {
            // 缓存查询失败不阻断，继续走完整分析
        }
    }

    isAnalyzing.value = true
    percent.value = 0
    progressLogs.value = []
    report.value = null
    currentStageName.value = '准备中'
    addLog(forceRefresh ? `开始重新分析：${url}` : `开始分析：${url}`)

    abortController = new AbortController()
    try {
        await new Promise<void>((resolve, reject) => {
            fetchEventSource(getAnalyzeEndpoint(), {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + getToken(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ RepoUrl: url, ForceRefresh: forceRefresh }),
                signal: abortController!.signal,
                async onopen(response) {
                    if (response.ok) {
                        addLog('已连接分析服务', 'success')
                    } else {
                        reject(new Error(`连接失败: ${response.status}`))
                        throw new Error(`连接失败: ${response.status}`)
                    }
                },
                onmessage(msg: EventSourceMessage) {
                    if (msg.data === '[DONE]') {
                        resolve()
                        return
                    }
                    try {
                        handleSseEvent(JSON.parse(msg.data) as AnalysisSseEvent)
                    } catch {
                        // 忽略无法解析的消息
                    }
                },
                onerror(err) {
                    reject(err)
                    throw err // 阻止 fetchEventSource 自动重连
                },
                onclose() {
                    resolve()
                },
            })
        })
        if (report.value) {
            percent.value = 100
            addLog('分析完成 ✅', 'success')
            ElMessage.success('分析完成')
            loadHistory()
        } else if (!abortController?.signal.aborted) {
            addLog('连接已关闭但未收到报告', 'warning')
            ElMessage.warning('连接已关闭，未收到完整报告')
        }
    } catch (e: unknown) {
        if (abortController?.signal.aborted) {
            addLog('已停止分析', 'warning')
        } else {
            const text = e instanceof Error ? e.message : '分析请求失败'
            addLog(text, 'danger')
            ElMessage.error(text)
        }
    } finally {
        isAnalyzing.value = false
        abortController = null
    }
}

function onStop() {
    abortController?.abort()
}
</script>

<style lang="scss" scoped>
/* 初音吉祥物：右下角悬浮，不拦截交互 */
.miku-mascot {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 10;
    pointer-events: none;
    opacity: 0.9;
    filter: drop-shadow(0 6px 14px rgb(57 197 187 / 35%));
}

.history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    margin-bottom: 8px;
    cursor: pointer;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
        background-color: var(--el-fill-color);
    }

    &:last-child {
        margin-bottom: 0;
    }
}

.history-desc {
    overflow: hidden;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.history-meta {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
}

.directory-tree {
    padding: 12px 16px;
    margin: 0;
    overflow-x: auto;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
}

.pattern-item {
    padding: 12px 16px;
    margin-bottom: 12px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;

    &:last-child {
        margin-bottom: 0;
    }
}
</style>
