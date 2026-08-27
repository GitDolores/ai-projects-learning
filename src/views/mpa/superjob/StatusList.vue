<template>
    <div class="main main-content">
        <el-card shadow="never">
            <!-- 搜索栏 -->
            <div class="mb-4">
                <el-form :inline="true" :model="searchForm">
                    <el-form-item label="任务代码">
                        <el-input v-model="searchForm.jobCode" placeholder="请输入" clearable style="width: 150px" />
                    </el-form-item>
                    <el-form-item label="任务名称">
                        <el-input v-model="searchForm.jobName" placeholder="请输入" clearable style="width: 150px" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="searchForm.isEnable" placeholder="全部" clearable style="width: 90px">
                            <el-option label="启用" value="Y" />
                            <el-option label="停止" value="N" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">查询</el-button>
                        <el-button @click="onReset">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <el-table v-loading="loading" :data="filteredData" border stripe height="calc(100vh - 260px)" row-key="ConfigId">
                <el-table-column prop="JobCode" label="任务代码" width="160" />
                <el-table-column prop="JobName" label="任务名称" width="180" />
                <el-table-column prop="CronExpression" label="Cron" width="130" />
                <el-table-column label="上次执行时间" width="160">
                    <template #default="{ row }">{{ row.LastExecutionTime ?? '暂无' }}</template>
                </el-table-column>
                <el-table-column label="耗时(ms)" width="90">
                    <template #default="{ row }">{{ row.LastDurationMs || '-' }}</template>
                </el-table-column>
                <el-table-column label="上次结果" width="100">
                    <template #default="{ row }">
                        <el-tag v-if="row.LastStatus === 'DONE'" type="success">成功</el-tag>
                        <el-tag v-else-if="row.LastStatus === 'FAILED'" type="danger">失败</el-tag>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column label="上次详情" min-width="100">
                    <template #default="{ row }">{{ row.LastResult || '-' }}</template>
                </el-table-column>
                <el-table-column label="下次执行" width="160">
                    <template #default="{ row }">{{ row.NextExecutionTime ?? '...' }}</template>
                </el-table-column>
                <el-table-column label="距离下次执行" width="160">
                    <template #default="{ row }">
                        <el-progress :percentage="calcProgress(row as SuperJobStatusItem)" :color="calcProgress(row as SuperJobStatusItem) > 90 ? '#e6a23c' : '#409eff'" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button v-if="row.IsEnable === 'Y'" link type="warning" @click="onStop(row as SuperJobStatusItem)">停止</el-button>
                        <el-button v-else link type="success" @click="onContinue(row as SuperJobStatusItem)">继续</el-button>
                        <el-button link type="primary" @click="onViewLog(row as SuperJobStatusItem)">日志</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getStatusList, stopJob, continueJob, SuperJobStatusItem } from '@/api/superjob'
import { ElMessage } from 'element-plus'

const router = useRouter()
const tableData = ref<SuperJobStatusItem[]>([])
const loading = ref(false)
const isRefreshing = ref(false)
const tick = ref(0)
const now = ref(Date.now())
let mainTimer: ReturnType<typeof setInterval> | null = null

const searchForm = reactive({ jobCode: '', jobName: '', isEnable: '' })

const filteredData = computed(() => {
    let data = tableData.value
    if (searchForm.jobCode) {
        const kw = searchForm.jobCode.toLowerCase()
        data = data.filter((x) => x.JobCode.toLowerCase().includes(kw))
    }
    if (searchForm.jobName) {
        const kw = searchForm.jobName.toLowerCase()
        data = data.filter((x) => x.JobName.toLowerCase().includes(kw))
    }
    if (searchForm.isEnable) {
        data = data.filter((x) => x.IsEnable === searchForm.isEnable)
    }
    return data
})

async function loadData() {
    loading.value = true
    try {
        tableData.value = (await getStatusList()) || []
    } finally {
        loading.value = false
    }
}

// ---- 进度条计算 ----

const calcProgress = (row: SuperJobStatusItem): number => {
    if (!row.NextExecutionTime) return 0
    const current = now.value
    const end = new Date(row.NextExecutionTime).getTime()
    const start = row.LastExecutionTime ? new Date(row.LastExecutionTime).getTime() : end - 60000
    const total = end - start
    if (total <= 0) return 100
    return Math.round(Math.min(100, Math.max(0, ((current - start) / total) * 100)))
}

// ---- 主循环：300ms 一次 ----

function mainLoop() {
    tick.value++
    now.value = Date.now()

    if (isRefreshing.value) return

    // 收集所有"下次执行时间已过 1 秒且未停止"的任务
    const threshold = Date.now() - 1000
    const overdueIds: string[] = []
    for (const row of tableData.value) {
        if (row.IsEnable !== 'Y') continue
        const nextTime = row.NextExecutionTime ? new Date(row.NextExecutionTime).getTime() : null
        if (nextTime != null && nextTime < threshold) {
            overdueIds.push(row.ConfigId)
        }
    }

    if (overdueIds.length > 0) {
        refreshOverdue(overdueIds)
    }
}

async function refreshOverdue(configIds: string[]) {
    isRefreshing.value = true
    try {
        const freshList = await getStatusList()
        if (!freshList) return

        for (const configId of configIds) {
            const freshItem = freshList.find((x) => x.ConfigId === configId)
            const idx = tableData.value.findIndex((x) => x.ConfigId === configId)

            if (!freshItem) {
                if (idx !== -1) tableData.value.splice(idx, 1)
                continue
            }

            if (idx !== -1) {
                tableData.value.splice(idx, 1, freshItem)
            }
        }
    } finally {
        isRefreshing.value = false
    }
}

// ---- 搜索 / 操作 ----

function onSearch() {
    loadData()
}

function onReset() {
    searchForm.jobCode = ''
    searchForm.jobName = ''
    searchForm.isEnable = ''
}

async function onStop(row: SuperJobStatusItem) {
    await stopJob(row.ConfigId)
    ElMessage.success(`任务 ${row.JobCode} 已停止`)
    await loadData()
}

async function onContinue(row: SuperJobStatusItem) {
    await continueJob(row.ConfigId)
    ElMessage.success(`任务 ${row.JobCode} 已继续`)
    await loadData()
}

function onViewLog(row: SuperJobStatusItem) {
    router.push({ name: 'SuperJobLog', query: { jobCode: row.JobCode, jobName: row.JobName } })
}

onMounted(() => {
    loadData()
    mainTimer = setInterval(mainLoop, 300)
})

onUnmounted(() => {
    if (mainTimer) {
        clearInterval(mainTimer)
        mainTimer = null
    }
})
</script>
