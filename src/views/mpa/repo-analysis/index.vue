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
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fetchEventSource, EventSourceMessage } from '@microsoft/fetch-event-source'
import { getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'
import { getAnalyzeEndpoint, getCachedReport, AnalysisSseEvent, RepoAnalysisReport } from '@/api/repo-analysis'

defineOptions({ name: 'RepoAnalysis' })

const repoUrl = ref('')
const isAnalyzing = ref(false)
const percent = ref(0)
const report = ref<RepoAnalysisReport | null>(null)

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
