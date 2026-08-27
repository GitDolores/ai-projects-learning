<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Delete from '~icons/ep/delete'
import Refresh from '~icons/ep/refresh'
import AddFill from '~icons/ri/add-circle-line'
import { http } from '@/utils/http'
import { useUserStore } from '@/store/modules/user'
import { storeToRefs } from 'pinia'
import type { FormInstance } from 'element-plus'

defineOptions({ name: 'MpaCompanyChain' })

// ============ 类型定义 ============
type CompanyType = {
    CompanyCode: string
    CompanyName: string
    CompanyType: string
    PhoneNo: string
}

// ============ Store ============
const userStore = useUserStore()
const { CompanyInfo } = storeToRefs(userStore)

// ============ refs ============
const tableRef = ref()
const formRef = ref()
const activeTab = ref('master')
const view = ref<'list' | 'add'>('list')

// ============ 搜索 ============
const loading = ref(false)

// ============ 分页 ============
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const handleCurrentChange = (page: number) => {
    pagination.currentPage = page
    getMasterList()
}

const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    getMasterList()
}

// ============ 表格 ============
const masterList = ref<CompanyType[]>([])
const slaveList = ref<CompanyType[]>([])
const companyList = ref<CompanyType[]>([])

const masterColumns: TableColumnList = [
    { type: 'index', label: '序号', width: 60 },
    { label: '企业名称', prop: 'CompanyName', minWidth: 150 },
    { label: '企业代码', prop: 'CompanyCode', minWidth: 200 },
    { label: '企业类型', prop: 'CompanyType', minWidth: 120 },
    { label: '企业联系方式', prop: 'PhoneNo', width: 150 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 120 },
]

const slaveColumns: TableColumnList = [
    { type: 'index', label: '序号', width: 60 },
    { label: '企业名称', prop: 'CompanyName', minWidth: 150 },
    { label: '企业代码', prop: 'CompanyCode', minWidth: 200 },
    { label: '企业类型', prop: 'CompanyType', minWidth: 120 },
    { label: '企业联系方式', prop: 'PhoneNo', width: 150 },
]

const getCompanyList = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/company/companychain/allcompany')
        companyList.value = ((resp as CompanyType[]) || []).filter((x) => x.CompanyCode !== CompanyInfo.value.CompanyCode)
    } catch (ex: any) {
        alertx('获取所有企业失败', ex)
    }
}

const getMasterList = async () => {
    loading.value = true
    try {
        const resp = await http.request('get', 'api/mpa/company/companychain/master/list')
        masterList.value = (resp as CompanyType[]) || []
        pagination.total = masterList.value.length
    } catch (ex: any) {
        alertx('获取主管企业失败', ex)
    } finally {
        loading.value = false
    }
}

const getSlaveList = async () => {
    loading.value = true
    try {
        const resp = await http.request('get', 'api/mpa/company/companychain/slave/list')
        slaveList.value = (resp as CompanyType[]) || []
    } catch (ex: any) {
        alertx('获取从属企业失败', ex)
    } finally {
        loading.value = false
    }
}

// ============ 弹窗 ============
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formData = reactive({ companyCode: '' })

const onSearch = () => {
    getMasterList()
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    getMasterList()
}

const openDialog = () => {
    formData.companyCode = ''
    view.value = 'add'
    dialogVisible.value = true
}

const submitForm = async () => {
    if (!formData.companyCode) {
        ElMessage.warning('请选择主管企业')
        return
    }
    submitLoading.value = true
    try {
        await http.request('post', 'api/mpa/company/companychain/master', {
            params: { companycode: formData.companyCode },
        })
        ElMessage.success('保存成功')
        dialogVisible.value = false
        view.value = 'list'
        getMasterList()
    } catch (ex: any) {
        alertx('保存失败', ex)
    } finally {
        submitLoading.value = false
    }
}

const handleDelete = async (row: CompanyType) => {
    try {
        await http.request('delete', 'api/mpa/company/companychain/master', {
            params: { companycode: row.CompanyCode },
        })
        ElMessage.success('删除成功')
        getMasterList()
    } catch (ex: any) {
        alertx('删除失败', ex)
    }
}

watch(activeTab, (newTab) => {
    if (newTab === 'master') getMasterList()
    else if (newTab === 'slave') getSlaveList()
})

onMounted(async () => {
    await getCompanyList()
    await getMasterList()
})
</script>

<template>
    <div class="main">
        <!-- 搜索区域 -->
        <el-form ref="formRef" :inline="true" class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto">
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">刷新</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <el-tabs v-model="activeTab" class="mt-4">
            <el-tab-pane label="主管企业" name="master">
                <div v-show="view === 'list'">
                    <PureTableBar title="主管企业管理" :columns="masterColumns" @refresh="onSearch">
                        <template #buttons>
                            <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">新增</el-button>
                        </template>
                        <template v-slot="{ size, dynamicColumns }">
                            <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="masterList" :columns="dynamicColumns" :pagination="{ ...pagination, size }" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" @page-size-change="handleSizeChange" @page-current-change="handleCurrentChange">
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
            </el-tab-pane>
            <el-tab-pane label="从属企业" name="slave">
                <PureTableBar title="从属企业管理" :columns="slaveColumns">
                    <template v-slot="{ size, dynamicColumns }">
                        <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="slaveList" :columns="dynamicColumns" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" />
                    </template>
                </PureTableBar>
            </el-tab-pane>
        </el-tabs>

        <!-- 弹窗表单 -->
        <el-dialog v-model="dialogVisible" title="新增主管企业" class="edit-dialog" destroy-on-close :close-on-click-modal="false">
            <el-form ref="formRef" :model="formData" class="lay-form" label-width="120px">
                <el-row :gutter="30">
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="当前企业名称">
                            <span>{{ CompanyInfo?.CompanyName }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="当前企业代码">
                            <span>{{ CompanyInfo?.CompanyCode }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="24" :md="24" :sm="24" :xs="24">
                        <el-form-item label="主管企业" prop="companyCode">
                            <el-select v-model="formData.companyCode" placeholder="请选择主管企业" clearable class="w-full!">
                                <el-option v-for="c in companyList" :key="c.CompanyCode" :label="c.CompanyName" :value="c.CompanyCode" />
                            </el-select>
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
:deep(.el-dropdown-menu__item i) {
    margin: 0;
}
</style>
