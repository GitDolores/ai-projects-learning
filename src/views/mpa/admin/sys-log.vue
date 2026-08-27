<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Refresh from '~icons/ep/refresh'
import View from '~icons/ep/view'
import { http } from '@/utils/http'
import dayjs from 'dayjs'

defineOptions({ name: 'SysLog' })

// ============ 类型定义 ============
type SysLogType = {
    id: number
    loginName: string
    logMsg: string
    logTime: string
    companyCode: string
}

// ============ refs ============
const tableRef = ref()
const searchFormRef = ref()

// ============ 搜索 ============
const searchForm = reactive({
    loginName: '',
    logMsg_like: '',
    startTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
})

const loading = ref(false)

const onSearch = () => {
    pagination.currentPage = 1
    getList()
}

const resetForm = () => {
    searchForm.loginName = ''
    searchForm.logMsg_like = ''
    searchForm.startTime = dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
    searchForm.endTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    onSearch()
}

// ============ 分页 ============
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    getList()
}

const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    getList()
}

// ============ 选择 ============
const selectionData = ref<SysLogType[]>([])

const handleSelectionChange = (rows: SysLogType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<SysLogType[]>([])

const columns: TableColumnList = [
    { label: '记录时间', prop: 'LogTime', width: 180 },
    { label: '登录名', prop: 'LoginName', width: 80 },
    { label: '日志内容', prop: 'LogMsg', minWidth: 300, showOverflowTooltip: true },
    { label: '日志内容1', prop: 'MSG1' },
    { label: '日志内容2', prop: 'MSG2' },
    { label: '日志内容3', prop: 'MSG3' },
    { label: '日志内容4', prop: 'MSG4' },
    { label: '日志内容5', prop: 'MSG5' },
    { label: '日志内容6', prop: 'MSG6' },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {
            pageSize: pagination.pageSize,
            pageIndex: pagination.currentPage,
            startTime: searchForm.startTime,
            endTime: searchForm.endTime,
            loginName: searchForm.loginName,
            logMsg_like: searchForm.logMsg_like,
        }

        const resp: { List: SysLogType[]; Total: number } = await http.request('get', 'api/mpa/admin/log/page', { params })
        dataList.value = resp.List || []
        pagination.total = resp.Total || 0
    } catch (ex: any) {
        alertx('获取日志列表失败', ex)
    } finally {
        loading.value = false
    }
}

// ============ 详情弹窗 ============
const detailVisible = ref(false)
const currentLog = ref<SysLogType | null>(null)

const openDetail = (row: SysLogType) => {
    currentLog.value = row
    detailVisible.value = true
}

onMounted(() => {
    getList()
})
</script>

<template>
    <div class="main">
        <!-- 搜索区域 -->
        <el-form ref="searchFormRef" :inline="true" :model="searchForm" class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto">
            <el-form-item label="登录名：" prop="loginName">
                <el-input v-model="searchForm.loginName" placeholder="请输入登录名（自动转大写）" clearable class="w-[180px]!" @input="searchForm.loginName = searchForm.loginName.toUpperCase()" />
            </el-form-item>
            <el-form-item label="日志内容：" prop="logMsg_like">
                <el-input v-model="searchForm.logMsg_like" placeholder="请输入日志内容" clearable class="w-[200px]!" />
            </el-form-item>
            <el-form-item label="开始时间：" prop="startTime">
                <el-date-picker v-model="searchForm.startTime" type="datetime" placeholder="请选择开始时间" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" class="w-[200px]!" />
            </el-form-item>
            <el-form-item label="结束时间：" prop="endTime">
                <el-date-picker v-model="searchForm.endTime" type="datetime" placeholder="请选择结束时间" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" class="w-[200px]!" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch"> 搜索 </el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm"> 重置 </el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="系统日志" :columns="columns" @refresh="onSearch">
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
                    :pagination="{ ...pagination, size }"
                    :header-cell-style="{
                        background: 'var(--el-fill-color-light)',
                        color: 'var(--el-text-color-primary)',
                    }"
                    @selection-change="handleSelectionChange"
                    @page-size-change="handleSizeChange"
                    @page-current-change="handleCurrentChange"
                >
                    <template #operation="{ row }">
                        <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(View)" @click="openDetail(row)"> 详情 </el-button>
                    </template>
                </pure-table>
            </template>
        </PureTableBar>

        <!-- 详情弹窗 -->
        <el-dialog v-model="detailVisible" title="日志详情" class="edit-dialog" destroy-on-close :close-on-click-modal="false">
            <el-descriptions :column="1" border>
                <el-descriptions-item label="登录名">
                    {{ currentLog?.loginName }}
                </el-descriptions-item>
                <el-descriptions-item label="记录时间">
                    {{ currentLog?.logTime }}
                </el-descriptions-item>
                <el-descriptions-item label="日志内容">
                    <div class="log-msg-content">{{ currentLog?.logMsg }}</div>
                </el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <el-button @click="detailVisible = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
    margin: 0;
}

.log-msg-content {
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 400px;
    overflow-y: auto;
    line-height: 1.6;
}
</style>
