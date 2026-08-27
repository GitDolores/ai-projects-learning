<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Delete from '~icons/ep/delete'
import Refresh from '~icons/ep/refresh'
import AddFill from '~icons/ri/add-circle-line'
import { http } from '@/utils/http'
import type { FormInstance } from 'element-plus'

defineOptions({ name: 'Xsupercmpdef' })

// ============ 类型定义 ============
type ConfigItem = {
    ConfigCode: string
    ConfigDesc: string
    SuperCompEdit: string
    CreateTime: string | null
    Creator: string
    EditTime: string | null
    Editor: string
}

type SuperCmp = {
    code: string
    name: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const loading = ref(false)

const onSearch = () => {
    loadData()
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    loadData()
}

// ============ 分页 ============
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    loadData()
}

const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadData()
}

// ============ 选择 ============
const selectionData = ref<ConfigItem[]>([])

const handleSelectionChange = (rows: ConfigItem[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<ConfigItem[]>([])

const superCmps = ref<SuperCmp[]>([
    { code: 'SUPER', name: '超管' },
    { code: 'COMP', name: '普通企业' },
])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '配置代码', prop: 'ConfigCode', minWidth: 120, slot: 'ConfigCode' },
    { label: '说明注释', prop: 'ConfigDesc', minWidth: 150, slot: 'ConfigDesc' },
    { label: '属性归属', prop: 'SuperCompEdit', minWidth: 120, slot: 'SuperCompEdit' },
    { label: '创建时间', prop: 'CreateTime', width: 180 },
    { label: '创建人', prop: 'Creator', width: 120 },
    { label: '修改时间', prop: 'EditTime', width: 180 },
    { label: '修改人', prop: 'Editor', width: 120 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 120 },
]

const loadData = async () => {
    loading.value = true
    try {
        const resp = await http.request('get', 'api/MPA/systcmpcfgdef')
        dataList.value = (resp as ConfigItem[]) || []
        pagination.total = dataList.value.length
    } catch (ex: any) {
        alertx('获取数据失败', ex)
    } finally {
        loading.value = false
    }
}

// ============ 新增 ============
const onNewData = () => {
    dataList.value.unshift({
        ConfigCode: '',
        ConfigDesc: '',
        SuperCompEdit: 'SUPER',
        CreateTime: null,
        Creator: '',
        EditTime: null,
        Editor: '',
    })
}

// ============ 保存 ============
const checkDuplicateConfigCodes = (list: ConfigItem[]): string[] => {
    const configCodeCount: Record<string, number> = {}
    const duplicates: string[] = []
    list.forEach((item) => {
        if (item.ConfigCode) {
            configCodeCount[item.ConfigCode] = (configCodeCount[item.ConfigCode] || 0) + 1
            if (configCodeCount[item.ConfigCode] === 2) {
                duplicates.push(item.ConfigCode)
            }
        }
    })
    return duplicates
}

const onSaveAll = async () => {
    const validList = dataList.value.filter((x) => x.ConfigCode != null && x.ConfigCode.trim() !== '')
    if (validList.length === 0) {
        ElMessage.warning('没有有效的配置数据需要保存')
        return
    }
    const duplicateCodes = checkDuplicateConfigCodes(validList)
    if (duplicateCodes.length > 0) {
        ElMessage.error(`存在重复的配置代码：${duplicateCodes.join(', ')}，请修正后再保存`)
        return
    }
    try {
        await http.request('put', 'api/MPA/systcmpcfgdef', { data: validList })
        ElMessage.success('保存成功')
        loadData()
    } catch (ex: any) {
        alertx('保存失败', ex)
    }
}

// ============ 删除 ============
const handleDelete = async (row: ConfigItem) => {
    if (!row.ConfigCode || row.ConfigCode.trim() === '') {
        const index = dataList.value.findIndex((item) => item === row)
        if (index !== -1) {
            dataList.value.splice(index, 1)
            ElMessage.success('已移除空白行')
        }
        return
    }
    if (row.CreateTime === null) {
        const index = dataList.value.findIndex((item) => item === row)
        if (index !== -1) {
            dataList.value.splice(index, 1)
            ElMessage.success('已移除未保存的新增行')
        }
        return
    }
    try {
        await http.request('delete', 'api/MPA/systcmpcfgdef', {
            params: { CONFIG_CODE: row.ConfigCode },
        })
        ElMessage.success('删除成功')
        loadData()
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('删除失败', ex)
    }
}

// ============ 批量删除 ============
const handleBatchDelete = async () => {
    if (selectionData.value.length === 0) return
    try {
        for (const row of selectionData.value) {
            await handleDelete(row)
        }
        ElMessage.success('批量删除成功')
        selectionData.value = []
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('批量删除失败', ex)
    }
}

onMounted(() => {
    loadData()
})
</script>

<template>
    <div class="main">
        <!-- 搜索区域 -->
        <el-form
            ref="formRef"
            :inline="true"
            class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
        >
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="配置定义管理" :columns="columns" @refresh="onSearch">
            <template #buttons>
                <el-button type="warning" :icon="useRenderIcon(AddFill)" @click="onNewData()">新增</el-button>
                <el-button type="success" :icon="useRenderIcon(Refresh)" @click="onSaveAll">保存所有修改</el-button>
                <el-button type="danger" :icon="useRenderIcon(Delete)" :disabled="selectionData.length === 0" @click="handleBatchDelete">批量删除</el-button>
            </template>
            <template v-slot="{ size, dynamicColumns }">
                <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="dataList" :columns="dynamicColumns" :pagination="{ ...pagination, size }" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange" @page-current-change="handleCurrentChange">
                    <template #ConfigCode="{ row }">
                        <el-input v-model="row.ConfigCode" placeholder="请输入配置代码" />
                    </template>
                    <template #ConfigDesc="{ row }">
                        <el-input v-model="row.ConfigDesc" placeholder="请输入说明注释" />
                    </template>
                    <template #SuperCompEdit="{ row }">
                        <el-select v-model="row.SuperCompEdit" placeholder="请选择属性归属">
                            <el-option v-for="x in superCmps" :key="x.code" :value="x.code" :label="x.name" />
                        </el-select>
                    </template>
                    <template #operation="{ row }">
                        <el-popconfirm title="是否确认删除?" @confirm="handleDelete(row)">
                            <template #reference>
                                <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(Delete)">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </pure-table>
            </template>
        </PureTableBar>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) { margin: 0; }
</style>