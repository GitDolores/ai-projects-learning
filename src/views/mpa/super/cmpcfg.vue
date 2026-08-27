<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Delete from '~icons/ep/delete'
import EditPen from '~icons/ep/edit-pen'
import Refresh from '~icons/ep/refresh'
import AddFill from '~icons/ri/add-circle-line'
import { http } from '@/utils/http'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'Xsupercmpcfg' })

// ============ 类型定义 ============
type CmpCfgType = {
    ConfigId: string
    ConfigCode: string
    CONFIG_CODE_TXT: string
    ConfigData: string
    ConfigValue: string
    CUS_COMPANYNAME: string
    CusCompanyCode: string
    IsEnable: string
    Creator: string
    CreateTime: string
    Editor: string
    EditTime: string
}

type ConfigOption = {
    code: string
    value: string
}

type CompanyOption = {
    code: string
    value: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ configCode: '', cusCompanyNameLike: '' })
const loading = ref(false)
const configs = ref<ConfigOption[]>([])
const companies = ref<CompanyOption[]>([])

const onSearch = () => {
    pagination.currentPage = 1
    getList()
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    onSearch()
}

const getConfigTypes = async () => {
    try {
        const resp = await http.request('get', 'api/MPA/systcmpcfgdef')
        configs.value = ((resp as any[]) || []).map((item) => ({
            code: item.ConfigCode || '',
            value: item.ConfigDesc || '',
        }))
    } catch (ex: any) {
        alertx('获取配置项列表失败', ex)
    }
}

const getCompanies = async () => {
    try {
        const resp = await http.request('get', 'api/MPA/systcompany')
        companies.value = ((resp as any[]) || []).map((item) => ({
            code: item.CompanyCode || '',
            value: item.CompanyName || '',
        }))
    } catch (ex: any) {
        alertx('获取企业列表失败', ex)
    }
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
const selectionData = ref<CmpCfgType[]>([])

const handleSelectionChange = (rows: CmpCfgType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<CmpCfgType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '企业名', prop: 'CUS_COMPANYNAME', minWidth: 120 },
    { label: '配置项', prop: 'ConfigCode', minWidth: 100 },
    { label: '配置项名称', prop: 'CONFIG_CODE_TXT', minWidth: 120 },
    { label: '配置值', prop: 'ConfigValue', minWidth: 120 },
    { label: '是否可用', prop: 'IsEnable', slot: 'IsEnable', width: 100 },
    { label: '创建人', prop: 'Creator', width: 100 },
    { label: '创建时间', prop: 'CreateTime', width: 180 },
    { label: '修改人', prop: 'Editor', width: 100 },
    { label: '修改时间', prop: 'EditTime', width: 180 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 200 },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {}
        if (searchForm.configCode) params.CONFIG_CODE = searchForm.configCode
        if (searchForm.cusCompanyNameLike) params.CUS_COMPANYNAME_LIKE = searchForm.cusCompanyNameLike

        const resp = await http.request('get', 'api/MPA/systcmpconfig/list', { params })
        dataList.value = (resp as CmpCfgType[]) || []
        pagination.total = dataList.value.length
    } catch (ex: any) {
        alertx('获取列表失败', ex)
    } finally {
        loading.value = false
    }
}

// ============ 弹窗 ============
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)

const defaultFormData = () => ({
    configId: '',
    configCode: '',
    configData: '',
    configValue: '',
    cusCompanyCode: '',
    isEnable: 'Y',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    configCode: [{ required: true, message: '请选择配置项代码', trigger: 'change' }],
    cusCompanyCode: [{ required: true, message: '请选择企业', trigger: 'change' }],
    configValue: [{ required: true, message: '请输入配置值', trigger: 'blur' }],
}

const openDialog = (title = '新增', row?: CmpCfgType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            configId: row.ConfigId,
            configCode: row.ConfigCode,
            configData: row.ConfigData,
            cusCompanyCode: row.CusCompanyCode,
            configValue: row.ConfigValue,
            isEnable: row.IsEnable,
        })
    } else {
        dialogType.value = 'add'
        Object.assign(formData, defaultFormData())
    }
    formRef.value?.clearValidate()
    dialogVisible.value = true
}

const submitForm = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true
    try {
        if (dialogType.value === 'add') {
            await http.request('post', 'api/MPA/systcmpconfig', { data: { ...formData } })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', 'api/MPA/systcmpconfig', { data: { ...formData } })
            ElMessage.success('编辑成功')
        }
        dialogVisible.value = false
        getList()
    } catch (ex: any) {
        alertx('操作失败', ex)
    } finally {
        submitLoading.value = false
    }
}

// ============ 删除 ============
const handleDelete = async (row: CmpCfgType) => {
    try {
        await http.request('delete', 'api/MPA/systcmpconfig', {
            params: { CONFIG_ID: row.ConfigId },
        })
        ElMessage.success('删除成功')
        selectionData.value = []
        getList()
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('删除失败', ex)
    }
}

// ============ 批量删除 ============
const handleBatchDelete = async () => {
    if (selectionData.value.length === 0) return
    try {
        for (const row of selectionData.value) {
            await http.request('delete', 'api/MPA/systcmpconfig', {
                params: { CONFIG_ID: row.ConfigId },
            })
        }
        ElMessage.success('批量删除成功')
        selectionData.value = []
        getList()
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('批量删除失败', ex)
    }
}

onMounted(() => {
    getConfigTypes()
    getCompanies()
    getList()
})
</script>

<template>
    <div class="main">
        <!-- 搜索区域 -->
        <el-form
            ref="formRef"
            :inline="true"
            :model="searchForm"
            class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
        >
            <el-form-item label="配置项：" prop="configCode">
                <el-select v-model="searchForm.configCode" placeholder="请选择配置项" clearable class="w-[180px]!">
                    <el-option v-for="c in configs" :key="c.code" :label="c.value" :value="c.code" />
                </el-select>
            </el-form-item>
            <el-form-item label="企业名称：" prop="cusCompanyNameLike">
                <el-input v-model="searchForm.cusCompanyNameLike" placeholder="请输入企业名称" clearable class="w-[180px]!" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="企业配置管理" :columns="columns" @refresh="onSearch">
            <template #buttons>
                <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">新增</el-button>
                <el-button type="danger" :icon="useRenderIcon(Delete)" :disabled="selectionData.length === 0" @click="handleBatchDelete">批量删除</el-button>
            </template>
            <template v-slot="{ size, dynamicColumns }">
                <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="dataList" :columns="dynamicColumns" :pagination="{ ...pagination, size }" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange" @page-current-change="handleCurrentChange">
                    <template #IsEnable="{ row }">
                        <el-tag :type="row.IsEnable === 'Y' ? 'success' : 'danger'" disable-transitions>{{ row.IsEnable === 'Y' ? '可用' : '禁用' }}</el-tag>
                    </template>
                    <template #operation="{ row }">
                        <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="openDialog('修改', row)">修改</el-button>
                        <el-popconfirm title="是否确认删除?" @confirm="handleDelete(row)">
                            <template #reference>
                                <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(Delete)">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </pure-table>
            </template>
        </PureTableBar>

        <!-- 弹窗表单 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" class="edit-dialog" destroy-on-close :close-on-click-modal="false">
            <el-form ref="formRef" :model="formData" :rules="formRules" class="lay-form" label-width="120px">
                <el-row :gutter="30">
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="配置项" prop="configCode">
                            <el-select v-model="formData.configCode" placeholder="请选择配置项" clearable class="w-full!">
                                <el-option v-for="item in configs" :key="item.code" :label="item.value" :value="item.code" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="企业" prop="cusCompanyCode">
                            <el-select v-model="formData.cusCompanyCode" placeholder="请选择企业" clearable class="w-full!">
                                <el-option v-for="item in companies" :key="item.code" :label="item.value" :value="item.code" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="配置值" prop="configValue"><el-input v-model="formData.configValue" placeholder="请输入配置值" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="是否可用" prop="isEnable">
                            <el-switch v-model="formData.isEnable" active-value="Y" inactive-value="N" active-text="可用" inactive-text="禁用" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) { margin: 0; }
</style>