<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Search from '~icons/ep/search'
import Delete from '~icons/ep/delete'
import { http } from '@/utils/http'

defineOptions({ name: 'NetworkCheck' })

// ============ 类型定义 ============
type CheckResult = {
    Url: string
    IsReachable: boolean
    ErrorMessage: string
}

// ============ refs ============
const tableRef = ref()

// ============ 输入 ============
const urlsText = ref('')
const loading = ref(false)

// ============ 表格 ============
const dataList = ref<CheckResult[]>([])

const columns: TableColumnList = [
    { type: 'index', label: '序号', width: 60 },
    { label: '网络地址', prop: 'Url', minWidth: 200 },
    { label: '检测结果', prop: 'IsReachable', slot: 'IsReachable', width: 120 },
    { label: '错误信息', prop: 'ErrorMessage', minWidth: 200 },
]

// ============ 检测 ============
const handleCheck = async () => {
    const raw = urlsText.value.trim()
    if (!raw) {
        ElMessage.warning('请输入至少一个网络地址')
        return
    }

    // 按行分割，过滤空行
    const lines = raw
        .split(/[\r\n]+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

    if (lines.length === 0) {
        ElMessage.warning('请输入至少一个有效的网络地址')
        return
    }

    loading.value = true
    try {
        const resp: CheckResult[] = await http.request('post', 'api/mpa/super/control/check-urls', {
            data: lines,
        })
        dataList.value = resp || []
        ElMessage.success(`检测完成，共 ${dataList.value.length} 条结果`)
    } catch (ex: any) {
        alertx('网络检测失败', ex)
    } finally {
        loading.value = false
    }
}

// ============ 清空 ============
const handleClear = () => {
    urlsText.value = ''
    dataList.value = []
}
</script>

<template>
    <div class="main">
        <!-- 输入区域 -->
        <div class="bg-bg_color w-full pl-8 pt-[16px] pr-8 pb-[16px]">
            <el-form :inline="true">
                <el-form-item label="网络地址：" class="w-full!">
                    <el-input v-model="urlsText" type="textarea" :rows="6" placeholder="请输入需要检测的网络地址，每行一个&#10;支持 IP 地址和 HTTP/HTTPS 网址&#10;例如：&#10;192.168.1.1&#10;https://www.example.com&#10;10.0.0.1:8080" clearable class="w-full! max-w-[800px]" />
                </el-form-item>
            </el-form>
            <div class="flex gap-2 mt-2">
                <el-button type="primary" :icon="useRenderIcon(Search)" :loading="loading" @click="handleCheck"> 开始检测 </el-button>
                <el-button :icon="useRenderIcon(Delete)" :disabled="!urlsText && dataList.length === 0" @click="handleClear"> 清空 </el-button>
            </div>
        </div>

        <!-- 结果区域 -->
        <PureTableBar title="检测结果" :columns="columns" @refresh="handleCheck">
            <template #buttons>
                <span class="text-sm text-gray-500">
                    共 {{ dataList.length }} 条结果，
                    <span class="text-green-600 font-medium"> {{ dataList.filter((r) => r.IsReachable).length }} 个可达 </span>
                    ，
                    <span class="text-red-500 font-medium"> {{ dataList.filter((r) => !r.IsReachable).length }} 个不可达 </span>
                </span>
            </template>
            <template v-slot="{ size, dynamicColumns }">
                <pure-table
                    ref="tableRef"
                    align-whole="center"
                    showOverflowTooltip
                    table-layout="auto"
                    :loading="loading"
                    :size="size"
                    adaptive
                    :data="dataList"
                    :columns="dynamicColumns"
                    :header-cell-style="{
                        background: 'var(--el-fill-color-light)',
                        color: 'var(--el-text-color-primary)',
                    }"
                >
                    <template #IsReachable="{ row }">
                        <el-tag :type="row.IsReachable ? 'success' : 'danger'" :size="size" disable-transitions>
                            {{ row.IsReachable ? '可达' : '不可达' }}
                        </el-tag>
                    </template>
                    <template #ErrorMessage="{ row }">
                        <span v-if="row.ErrorMessage" class="text-red-500">
                            {{ row.ErrorMessage }}
                        </span>
                        <span v-else class="text-gray-400">-</span>
                    </template>
                </pure-table>
            </template>
        </PureTableBar>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
    margin: 0;
}
</style>
