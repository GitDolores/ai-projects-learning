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

defineOptions({ name: 'Xsuperoutercompany' })

// ============ 类型定义 ============
type OuterCompanyType = {
    Id: string
    OuterProjectId: string
    OuterProjectCode: string
    OuterProjectName: string
    InnerCompanyCode: string
    InnerCompanyName: string
    OuterCompanyCode: string
    OuterCompanyName: string
}

type CompanySimple = {
    CompanyCode: string
    CompanyName: string
}

type ProjectSimple = {
    Id: string
    ProjectCode: string
    ProjectName: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({
    OuterCompanyNameLike: '',
    OuterCompanyCodeLike: '',
    InnerCompanyCode: '',
    ProjectId: '',
})
const loading = ref(false)
const companyList = ref<CompanySimple[]>([])
const projectList = ref<ProjectSimple[]>([])

const onSearch = () => {
    pagination.currentPage = 1
    getList()
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    onSearch()
}

const getCompanyList = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/company/companychain/allcompany')
        companyList.value = (resp as CompanySimple[]) || []
    } catch (ex: any) {
        alertx('获取企业列表失败', ex)
    }
}

const getProjectList = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/project/outerproject/list')
        projectList.value = (resp as ProjectSimple[]) || []
    } catch (ex: any) {
        alertx('获取项目列表失败', ex)
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
const selectionData = ref<OuterCompanyType[]>([])

const handleSelectionChange = (rows: OuterCompanyType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<OuterCompanyType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '外部项目', prop: 'OuterProjectName', minWidth: 120 },
    { label: '外部项目代码', prop: 'OuterProjectCode', minWidth: 120 },
    { label: '内部企业', prop: 'InnerCompanyName', minWidth: 120 },
    { label: '外部企业代码', prop: 'OuterCompanyCode', minWidth: 120 },
    { label: '外部企业名称', prop: 'OuterCompanyName', minWidth: 150 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 200 },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {
            pageSize: pagination.pageSize,
            pageIndex: pagination.currentPage,
        }
        if (searchForm.OuterCompanyNameLike) params.outer_companyname_like = searchForm.OuterCompanyNameLike
        if (searchForm.OuterCompanyCodeLike) params.outer_companycode = searchForm.OuterCompanyCodeLike
        if (searchForm.InnerCompanyCode) params.inner_companyname_like = searchForm.InnerCompanyCode
        if (searchForm.ProjectId) params.outer_projectid = searchForm.ProjectId

        const resp: { List: OuterCompanyType[]; Total: number } = await http.request('get', 'api/mpa/project/outercompany/page', { params })
        dataList.value = resp.List || []
        pagination.total = resp.Total || 0
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
    Id: '',
    OuterProjectId: '',
    InnerCompanyCode: '',
    OuterCompanyCode: '',
    OuterCompanyName: '',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    OuterProjectId: [{ required: true, message: '请选择外部项目', trigger: 'change' }],
    InnerCompanyCode: [{ required: true, message: '请选择内部企业', trigger: 'change' }],
    OuterCompanyCode: [{ required: true, message: '请输入外部企业代码', trigger: 'blur' }],
    OuterCompanyName: [{ required: true, message: '请输入外部企业名称', trigger: 'blur' }],
}

const openDialog = (title = '新增', row?: OuterCompanyType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            Id: row.Id,
            OuterProjectId: row.OuterProjectId,
            InnerCompanyCode: row.InnerCompanyCode,
            OuterCompanyCode: row.OuterCompanyCode,
            OuterCompanyName: row.OuterCompanyName,
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
            await http.request('post', 'api/mpa/project/outercompany', { data: { ...formData } })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', `api/mpa/project/outercompany`, { data: { ...formData } })
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
const handleDelete = async (row: OuterCompanyType) => {
    try {
        console.log(row)
        await http.request('delete', 'api/mpa/project/outercompany?id=' + row.Id)
        ElMessage.success('删除成功')
        selectionData.value = []
        getList()
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('删除失败', ex)
    }
}

onMounted(() => {
    getCompanyList()
    getProjectList()
    getList()
})
</script>

<template>
    <div class="main">
        <!-- 搜索区域 -->
        <el-form ref="formRef" :inline="true" :model="searchForm" class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto">
            <el-form-item label="外部企业：" prop="OuterCompanyNameLike">
                <el-input v-model="searchForm.OuterCompanyNameLike" placeholder="请输入外部企业名称" clearable class="w-[180px]!" />
            </el-form-item>
            <el-form-item label="内部企业：" prop="InnerCompanyCode">
                <el-select v-model="searchForm.InnerCompanyCode" placeholder="请选择内部企业" clearable class="w-[180px]!">
                    <el-option v-for="c in companyList" :key="c.CompanyCode" :label="c.CompanyName" :value="c.CompanyCode" />
                </el-select>
            </el-form-item>
            <el-form-item label="外部项目：" prop="ProjectId">
                <el-select v-model="searchForm.ProjectId" placeholder="请选择外部项目" clearable class="w-[180px]!">
                    <el-option v-for="p in projectList" :key="p.Id" :label="p.ProjectName" :value="p.Id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="外部企业管理" :columns="columns" @refresh="onSearch">
            <template #buttons>
                <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">新增</el-button>
            </template>
            <template v-slot="{ size, dynamicColumns }">
                <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="dataList" :columns="dynamicColumns" :pagination="{ ...pagination, size }" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange" @page-current-change="handleCurrentChange">
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
                        <el-form-item label="外部项目" prop="OuterProjectId">
                            <el-select v-model="formData.OuterProjectId" placeholder="请选择外部项目" clearable class="w-full!">
                                <el-option v-for="p in projectList" :key="p.Id" :label="p.ProjectName" :value="p.Id" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="内部企业" prop="InnerCompanyCode">
                            <el-select v-model="formData.InnerCompanyCode" placeholder="请选择内部企业" clearable class="w-full!">
                                <el-option v-for="c in companyList" :key="c.CompanyCode" :label="c.CompanyName" :value="c.CompanyCode" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="外部企业代码" prop="OuterCompanyCode">
                            <el-input v-model="formData.OuterCompanyCode" placeholder="请输入外部企业代码" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="外部企业名称" prop="OuterCompanyName">
                            <el-input v-model="formData.OuterCompanyName" placeholder="请输入外部企业名称" clearable />
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
