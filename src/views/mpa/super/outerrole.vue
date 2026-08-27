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

defineOptions({ name: 'Xsuperouterrole' })

// ============ 类型定义 ============
type OuterRoleType = {
    Id: string
    OuterProjectId: string
    ProjectCode: string
    ProjectName: string
    InnerRoleCode: string
    InnerRoleName: string
    OuterRoleCode: string
    OuterRoleName: string
}

type ProjectSimple = {
    Id: string
    ProjectCode: string
    ProjectName: string
}

type RoleSimple = {
    RoleCode: string
    RoleName: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ OuterRoleCodeLike: '', InnerRoleCode: '', OuterProjectId: '' })
const loading = ref(false)
const projectList = ref<ProjectSimple[]>([])
const roleList = ref<RoleSimple[]>([])

const onSearch = () => {
    pagination.currentPage = 1
    getList()
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    onSearch()
}

const getProjectList = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/project/outerproject/list')
        projectList.value = (resp as ProjectSimple[]) || []
    } catch (ex: any) {
        alertx('获取项目列表失败', ex)
    }
}

const getRoleList = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/systrole/all')
        roleList.value = (resp as RoleSimple[]) || []
    } catch (ex: any) {
        alertx('获取角色列表失败', ex)
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
const selectionData = ref<OuterRoleType[]>([])

const handleSelectionChange = (rows: OuterRoleType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<OuterRoleType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '外部项目', prop: 'ProjectName', minWidth: 120 },
    { label: '内部角色', prop: 'InnerRoleCode', minWidth: 120 },
    { label: '外部角色代码', prop: 'OuterRoleCode', minWidth: 120 },
    { label: '外部角色名称', prop: 'OuterRoleName', minWidth: 150 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 200 },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {
            pageSize: pagination.pageSize,
            pageIndex: pagination.currentPage,
        }
        if (searchForm.OuterRoleCodeLike) params.outer_rolecode_like = searchForm.OuterRoleCodeLike
        if (searchForm.InnerRoleCode) params.inner_rolecode_like = searchForm.InnerRoleCode
        if (searchForm.OuterProjectId) params.outer_projectid = searchForm.OuterProjectId

        const resp: { List: OuterRoleType[]; Total: number } = await http.request('get', 'api/mpa/project/outerrole/page', { params })
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
    InnerRoleCode: '',
    OuterRoleCode: '',
    OuterRoleName: '',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    OuterProjectId: [{ required: true, message: '请选择外部项目', trigger: 'change' }],
    InnerRoleCode: [{ required: true, message: '请选择内部角色', trigger: 'change' }],
    OuterRoleCode: [{ required: true, message: '请输入外部角色代码', trigger: 'blur' }],
    OuterRoleName: [{ required: true, message: '请输入外部角色名称', trigger: 'blur' }],
}

const openDialog = (title = '新增', row?: OuterRoleType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            Id: row.Id,
            OuterProjectId: row.OuterProjectId,
            InnerRoleCode: row.InnerRoleCode,
            OuterRoleCode: row.OuterRoleCode,
            OuterRoleName: row.OuterRoleName,
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
            await http.request('post', 'api/mpa/project/outerrole', { data: { ...formData } })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', `api/mpa/project/outerrole`, { data: { ...formData } })
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
const handleDelete = async (row: OuterRoleType) => {
    try {
        await http.request('delete', 'api/mpa/project/outerrole?id=' + row.Id)
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
        for (const item of selectionData.value) {
            await http.request('delete', 'api/mpa/project/outerrole?id=' + item.Id)
        }
        ElMessage.success('批量删除成功')
        selectionData.value = []
        getList()
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('批量删除失败', ex)
    }
}

onMounted(() => {
    getProjectList()
    getRoleList()
    getList()
})
</script>

<template>
    <div class="main">
        <!-- 搜索区域 -->
        <el-form ref="formRef" :inline="true" :model="searchForm" class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto">
            <el-form-item label="外部角色：" prop="OuterRoleCodeLike">
                <el-input v-model="searchForm.OuterRoleCodeLike" placeholder="请输入外部角色代码" clearable class="w-[180px]!" />
            </el-form-item>
            <el-form-item label="内部角色：" prop="InnerRoleCode">
                <el-select v-model="searchForm.InnerRoleCode" placeholder="请选择内部角色" clearable class="w-[180px]!">
                    <el-option v-for="r in roleList" :key="r.RoleCode" :label="r.RoleName" :value="r.RoleCode" />
                </el-select>
            </el-form-item>
            <el-form-item label="外部项目：" prop="OuterProjectId">
                <el-select v-model="searchForm.OuterProjectId" placeholder="请选择外部项目" clearable class="w-[180px]!">
                    <el-option v-for="p in projectList" :key="p.Id" :label="p.ProjectName" :value="p.Id" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="外部角色管理" :columns="columns" @refresh="onSearch">
            <template #buttons>
                <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">新增</el-button>
                <el-button type="danger" :icon="useRenderIcon(Delete)" :disabled="selectionData.length === 0" @click="handleBatchDelete">批量删除</el-button>
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
                        <el-form-item label="内部角色" prop="InnerRoleCode">
                            <el-select v-model="formData.InnerRoleCode" placeholder="请选择内部角色" clearable class="w-full!">
                                <el-option v-for="r in roleList" :key="r.RoleCode" :label="r.RoleName" :value="r.RoleCode" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="外部角色代码" prop="OuterRoleCode">
                            <el-input v-model="formData.OuterRoleCode" placeholder="请输入外部角色代码" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="外部角色名称" prop="OuterRoleName">
                            <el-input v-model="formData.OuterRoleName" placeholder="请输入外部角色名称" clearable />
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
