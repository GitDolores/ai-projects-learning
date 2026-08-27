<template>
    <el-card shadow="never" :body-style="{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }">
        <div class="flex flex-col h-full">
            <!-- 标题和刷新信息 -->
            <div class="flex-shrink-0 mb-4">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-bold">Api服务资源监控</h2>
                    <div class="text-sm text-gray-500">最后更新时间: {{ lastloadstr }}</div>
                </div>
                <el-divider style="margin-top: 8px" />
            </div>

            <!-- 监控数据展示 -->
            <div class="flex-grow overflow-auto mb-4">
                <el-descriptions direction="horizontal" :column="4" border class="monitor-descriptions">
                    <el-descriptions-item v-for="(item, key) in sortedEsvalue" :key="key" :content-class-name="changedValue[key] ? 'changed-value' : ''" :label-style="{ backgroundColor: '#f5f7fa' }">
                        <template #label>
                            <div class="flex items-center">
                                <el-icon><Monitor /></el-icon>
                                <span class="ml-1 font-medium">{{ key }}</span>
                            </div>
                        </template>
                        <span :class="changedValue[key] ? 'font-bold text-blue-600' : ''">
                            {{ formatValue(item) }}
                        </span>
                    </el-descriptions-item>
                </el-descriptions>
            </div>

            <!-- 日志区域 -->
            <div class="flex-shrink-0">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">变更日志</h3>
                    <el-button size="small" @click="clearLog"> 清空日志 </el-button>
                </div>
                <div class="log-container p-3 bg-gray-50 border border-gray-200 rounded" style="height: 100px; overflow-y: auto">
                    <div v-if="logMessages.length === 0" class="text-gray-400 text-center py-8">暂无变更记录</div>
                    <div v-else class="log-content">
                        <div v-for="(log, index) in logMessages" :key="index" class="log-item mb-1 p-2 bg-white rounded border-l-4 border-blue-500">
                            <span class="text-gray-500 text-sm mr-2">
                                {{ formatTime(log.timestamp) }}
                            </span>
                            <span v-html="log.message" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 控制按钮 -->
            <div class="flex-shrink-0 mt-4 pt-4 border-t">
                <el-button type="primary" :icon="isMonitoring ? Refresh : VideoPlay" @click="toggleMonitoring">
                    {{ isMonitoring ? '停止监控' : '开始监控' }}
                </el-button>
                <el-button class="ml-2" @click="refreshData"> 手动刷新 </el-button>
            </div>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor, Refresh, VideoPlay } from '@element-plus/icons-vue'
import { http } from '@/utils/http'
import dayjs from 'dayjs'

defineOptions({
    name: 'Xsuperdashboard',
})

// 状态管理
interface LogMessage {
    timestamp: Date
    message: string
}

const lastloadstr = ref('')
const esvalue = ref<Record<string, any>>({})
const changedValue = ref<Record<string, boolean>>({})
const logMessages = ref<LogMessage[]>([])
const isMonitoring = ref(true)
const timer = ref<NodeJS.Timeout | null>(null)

// 计算属性：按字母排序的数据
const sortedEsvalue = computed(() => {
    const sortedKeys = Object.keys(esvalue.value).sort()
    const sortedObj: Record<string, any> = {}
    sortedKeys.forEach((key) => {
        sortedObj[key] = esvalue.value[key]
    })
    return sortedObj
})

// 格式化显示值
const formatValue = (value: any) => {
    if (typeof value === 'number') {
        return value.toLocaleString('zh-CN')
    }
    return value
}

// 格式化时间
const formatTime = (date: Date) => {
    return dayjs(date).format('HH:mm:ss')
}

// 加载监控数据
const loadTrace = async () => {
    try {
        const resp = await http.request<any>('post', 'api/MPA/super/monitor/trace')
        const newData = resp || {}
        const changes: Record<string, boolean> = {}
        const changeLogs: string[] = []

        // 更新时间
        lastloadstr.value = dayjs().format('HH:mm:ss')

        // 检查变化
        Object.keys(newData).forEach((key) => {
            if (esvalue.value[key] !== undefined && esvalue.value[key] !== newData[key]) {
                changes[key] = true
                changeLogs.push(`${key} 从 ${formatValue(esvalue.value[key])} 变为 ${formatValue(newData[key])}`)
            }
        })

        // 更新数据（按字母排序）
        const sortedKeys = Object.keys(newData).sort()
        const sortedData: Record<string, any> = {}
        sortedKeys.forEach((key) => {
            sortedData[key] = newData[key]
        })

        esvalue.value = sortedData
        changedValue.value = changes

        // 添加日志
        if (changeLogs.length > 0) {
            changeLogs.forEach((log) => {
                logMessages.value.unshift({
                    timestamp: new Date(),
                    message: log,
                })
            })

            // 限制日志数量
            if (logMessages.value.length > 100) {
                logMessages.value = logMessages.value.slice(0, 100)
            }
        }
    } catch (error) {
        console.error('加载监控数据失败:', error)
        ElMessage.error('加载监控数据失败')
    }
}

// 清空日志
const clearLog = () => {
    logMessages.value = []
    ElMessage.success('日志已清空')
}

// 切换监控状态
const toggleMonitoring = () => {
    if (isMonitoring.value) {
        stopMonitoring()
    } else {
        startMonitoring()
    }
}

// 开始监控
const startMonitoring = () => {
    if (timer.value) {
        clearInterval(timer.value)
    }
    timer.value = setInterval(loadTrace, 3000)
    isMonitoring.value = true
    ElMessage.success('监控已启动')
}

// 停止监控
const stopMonitoring = () => {
    if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
    }
    isMonitoring.value = false
    ElMessage.info('监控已停止')
}

// 手动刷新
const refreshData = () => {
    loadTrace()
    ElMessage.info('数据已刷新')
}

// 组件生命周期
onMounted(() => {
    // 立即加载一次数据
    loadTrace()
    // 启动监控
    startMonitoring()
})

onUnmounted(() => {
    stopMonitoring()
})
</script>

<style scoped>
.monitor-descriptions :deep(.el-descriptions__label) {
    width: 180px;
}

.changed-value {
    background-color: #f0f9ff !important;
    animation: highlight 2s ease;
}

@keyframes highlight {
    0% {
        background-color: #ffeb3b;
    }
    100% {
        background-color: #f0f9ff;
    }
}

.log-container {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
}

.log-item:hover {
    background-color: #f8f9fa;
}
</style>
