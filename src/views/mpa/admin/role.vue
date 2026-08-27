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

defineOptions({ name: 'MpaAdminRole' })

// ============ 类型定义 ============
type RoleType = {
    RoleCode: string
    companyCode: string
    RoleName: string
    Enable: string
    IS_PRE_ROLE: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ roleNameLike: '' })
const loading = ref(false)

const onSearch = () => {
    pagination.currentPage = 1
    getList()
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
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
const selectionData = ref<RoleType[]>([])

const handleSelectionChange = (rows: RoleType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<RoleType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '角色名称', prop: 'RoleName', minWidth: 150 },
    { label: '预置角色', prop: 'IS_PRE_ROLE', slot: 'IS_PRE_ROLE', width: 120 },
    { label: '状态', prop: 'Enable', slot: 'Enable', width: 100 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 240 },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {}
        if (searchForm.roleNameLike) params.ROLENAME_LIKE = searchForm.roleNameLike

        const resp = await http.request('get', 'api/mpa/systrole/search', { params })
        dataList.value = (resp as RoleType[]) || []
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
    RoleCode: '',
    companyCode: '',
    RoleName: '',
    Enable: 'Y',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    RoleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    Enable: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const openDialog = (title = '新增', row?: RoleType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            RoleCode: row.RoleCode,
            companyCode: row.companyCode,
            RoleName: row.RoleName,
            Enable: row.Enable,
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
            await http.request('post', 'api/mpa/systrole', { data: { ...formData } })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', 'api/mpa/systrole', { data: { ...formData } })
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
const handleDelete = async (row: RoleType) => {
    try {
        await http.request('delete', `api/mpa/systrole/${row.RoleCode}`)
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
            await http.request('delete', `api/mpa/systrole/${row.RoleCode}`)
        }
        ElMessage.success('批量删除成功')
        selectionData.value = []
        getList()
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('批量删除失败', ex)
    }
}

// ============ 权限配置弹窗 ============
const authDialogVisible = ref(false)
const tmpRole = ref({ RoleCode: '', companyCode: '', RoleName: '', Enable: 'Y' })
const selectedFuncs = ref<string[]>([])
const funcsList = ref<any[]>([])

const handleFunc = async (row: RoleType) => {
    tmpRole.value = row
    selectedFuncs.value = []
    await getAllFuncs()
    await getRoleFuncs(row.RoleCode)
    authDialogVisible.value = true
}

const getAllFuncs = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/rbac/func/own/func')
        funcsList.value = (resp as any[]) || []
    } catch (ex: any) {
        alertx('获取权限列表失败', ex)
    }
}

const getRoleFuncs = async (rolecode: string) => {
    try {
        const resp = await http.request('get', 'api/mpa/rbac/func/role/func_code', {
            params: { rolecode },
        })
        selectedFuncs.value = (resp as string[]) || []
    } catch (ex: any) {
        alertx('获取角色权限失败', ex)
    }
}

const onSubmitFunc = async () => {
    try {
        await http.request('post', 'api/mpa/rbac/func/role/func_codes', {
            params: { role_code: tmpRole.value.RoleCode },
            data: selectedFuncs.value,
        })
        ElMessage.success('角色授权成功')
        authDialogVisible.value = false
    } catch (ex: any) {
        alertx('角色授权失败', ex)
    }
}

onMounted(() => {
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
            <el-form-item label="角色名称：" prop="roleNameLike">
                <el-input v-model="searchForm.roleNameLike" placeholder="请输入角色名称" clearable class="w-[180px]!" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="角色管理" :columns="columns" @refresh="onSearch">
            <template #buttons>
                <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">新增</el-button>
                <el-button type="danger" :icon="useRenderIcon(Delete)" :disabled="selectionData.length === 0" @click="handleBatchDelete">批量删除</el-button>
            </template>
            <template v-slot="{ size, dynamicColumns }">
                <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="dataList" :columns="dynamicColumns" :pagination="{ ...pagination, size }" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange" @page-current-change="handleCurrentChange">
                    <template #IS_PRE_ROLE="{ row }">
                        <el-tag :type="row.IS_PRE_ROLE === 'Y' ? 'info' : 'success'" disable-transitions>{{ row.IS_PRE_ROLE === 'Y' ? '预置' : '自建' }}</el-tag>
                    </template>
                    <template #Enable="{ row }">
                        <el-tag :type="row.Enable === 'Y' ? 'success' : 'danger'" disable-transitions>{{ row.Enable === 'Y' ? '可用' : '禁用' }}</el-tag>
                    </template>
                    <template #operation="{ row }">
                        <el-button v-if="row.IS_PRE_ROLE !== 'Y'" class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="handleFunc(row)">权限</el-button>
                        <el-button v-if="row.IS_PRE_ROLE !== 'Y'" class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="openDialog('修改', row)">编辑</el-button>
                        <el-popconfirm v-if="row.IS_PRE_ROLE !== 'Y'" title="是否确认删除?" @confirm="handleDelete(row)">
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
                        <el-form-item label="角色名称" prop="RoleName"><el-input v-model="formData.RoleName" placeholder="请输入角色名称" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="角色状态" prop="Enable">
                            <el-radio-group v-model="formData.Enable">
                                <el-radio value="Y" border>可用</el-radio>
                                <el-radio value="N" border>禁用</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>

        <!-- 权限配置弹窗 -->
        <el-dialog v-model="authDialogVisible" title="权限配置" class="edit-dialog" destroy-on-close :close-on-click-modal="false">
            <el-form label-width="120px" class="lay-form">
                <el-form-item label="角色名称"><span>{{ tmpRole.RoleName }}</span></el-form-item>
                <el-form-item label="角色编码"><span>{{ tmpRole.RoleCode }}</span></el-form-item>
                <el-form-item>
                    <el-transfer v-model="selectedFuncs" :props="{ key: 'FuncCode', label: 'FuncName' }" :titles="['未选择的权限功能', '已选中的权限功能']" :data="funcsList" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="authDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="onSubmitFunc">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) { margin: 0; }
:deep(.el-transfer-panel) { min-width: 300px; }
</style>