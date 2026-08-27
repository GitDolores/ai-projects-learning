<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Delete from '~icons/ep/delete'
import EditPen from '~icons/ep/edit-pen'
import Refresh from '~icons/ep/refresh'
import AddFill from '~icons/ri/add-circle-line'
import Key from '~icons/ep/key'
import { http } from '@/utils/http'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'MpaAdminDvcGroup' })

// ============ 类型定义 ============
type DvcGroupType = {
    Id: string
    Name: string
    Desc: string
    RoleNames: string | null
    DvcNames: string | null
    MsgTime: string
    CompanyCode: string
    CreateMan: string
    CreateManName: string
    ModifyMan: string
    ModifyManName: string
    ModifyTime: string
}

type OptionType = {
    key: string
    value: string
    disabled: boolean
}

type RoleType = {
    RoleCode: string
    CompanyCode: string
    Enable: string
    RoleName: string
    IS_PRE_ROLE: string
}

type DvcSimpleType = {
    Id: string
    CompanyCode: string
    Enable: string
    Name: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ nameLike: '' })
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
const selectionData = ref<DvcGroupType[]>([])

const handleSelectionChange = (rows: DvcGroupType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<DvcGroupType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '设备组名称', prop: 'Name', minWidth: 120 },
    { label: '设备组描述', prop: 'Desc', minWidth: 150 },
    { label: '添加人', prop: 'CreateManName', width: 80 },
    { label: '添加时间', prop: 'MsgTime', width: 180 },
    { label: '修改人', prop: 'ModifyManName', width: 80 },
    { label: '修改时间', prop: 'ModifyTime', width: 180 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 240 },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {
            pageSize: pagination.pageSize,
            pageIndex: pagination.currentPage,
        }
        if (searchForm.nameLike) params.name_like = searchForm.nameLike

        const resp = await http.request('get', 'api/mpa/iot/dvcgroup/list', { params })
        dataList.value = (Array.isArray(resp) ? resp : (resp as any).data || (resp as any).List || []) as DvcGroupType[]
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
    id: '',
    name: '',
    desc: '',
    createManName: '',
    msgTime: '',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    name: [{ required: true, message: '请输入设备组名称', trigger: 'blur' }],
    desc: [{ required: true, message: '请输入设备组描述', trigger: 'blur' }],
}

const openDialog = (title = '新增', row?: DvcGroupType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            id: row.Id,
            name: row.Name,
            desc: row.Desc,
            createManName: row.CreateManName || row.CreateMan || '',
            msgTime: row.MsgTime,
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
        const requestData = {
            ID: formData.id || undefined,
            Name: formData.name,
            Desc: formData.desc,
        }
        if (dialogType.value === 'add') {
            await http.request('post', 'api/mpa/iot/dvcgroup', { data: requestData })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', 'api/mpa/iot/dvcgroup', { data: requestData })
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
const handleDelete = async (row: DvcGroupType) => {
    try {
        await http.request('delete', 'api/mpa/iot/dvcgroup', {
            params: { id: row.Id },
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
            await http.request('delete', 'api/mpa/iot/dvcgroup', {
                params: { id: row.Id },
            })
        }
        ElMessage.success('批量删除成功')
        selectionData.value = []
        getList()
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('批量删除失败', ex)
    }
}

// ============ 授权弹窗 ============
const authDialogVisible = ref(false)
const currentAuthDvcGroup = ref<DvcGroupType>({} as DvcGroupType)
const allRoles = ref<OptionType[]>([])
const allDvcs = ref<OptionType[]>([])
const authRoles = ref<string[]>([])
const authDvcs = ref<string[]>([])
const transferKey = ref(0)

watch(authDialogVisible, (newVal) => {
    if (!newVal) {
        authRoles.value = []
        authDvcs.value = []
        transferKey.value++
    }
})

const onAuth = async (row: DvcGroupType) => {
    currentAuthDvcGroup.value = row
    authRoles.value = []
    authDvcs.value = []
    await getAllRoles()
    await getAllDvcs()
    await getGroupRoles(row.Id)
    await getGroupDvcs(row.Id)
    authDialogVisible.value = true
}

const getAllRoles = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/systrole/all')
        allRoles.value = ((resp as RoleType[]) || []).map((x) => ({
            key: x.RoleCode,
            value: x.RoleName,
            disabled: x.Enable === 'N',
        }))
    } catch (ex: any) {
        alertx('获取角色列表失败', ex)
    }
}

const getAllDvcs = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/iot/dvc/list')
        allDvcs.value = ((resp as DvcSimpleType[]) || []).map((x) => ({
            key: x.Id,
            value: x.Name,
            disabled: false,
        }))
    } catch (ex: any) {
        alertx('获取设备列表失败', ex)
    }
}

const getGroupRoles = async (groupId: string) => {
    try {
        const resp = await http.request('get', 'api/mpa/iot/dvcgroup/list-role', {
            params: { group_id: groupId },
        })
        authRoles.value = ((resp as RoleType[]) || []).map((x) => x.RoleCode)
    } catch (ex: any) {
        alertx('获取设备组角色失败', ex)
    }
}

const getGroupDvcs = async (groupId: string) => {
    try {
        const resp = await http.request('get', 'api/mpa/iot/dvcgroup/list-dvc', {
            params: { group_id: groupId },
        })
        authDvcs.value = ((resp as DvcSimpleType[]) || []).map((x) => x.Id)
    } catch (ex: any) {
        alertx('获取设备组设备失败', ex)
    }
}

const onAuthSubmit = async () => {
    try {
        await http.request('put', 'api/mpa/iot/dvcgroup/set-roles-dvcs', {
            params: { group_id: currentAuthDvcGroup.value.Id },
            data: { roles: authRoles.value, dvcs: authDvcs.value },
        })
        ElMessage.success('设备组授权保存成功')
        authDialogVisible.value = false
        getList()
    } catch (ex: any) {
        alertx('保存设备组授权失败', ex)
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
            <el-form-item label="设备组名称：" prop="nameLike">
                <el-input v-model="searchForm.nameLike" placeholder="请输入设备组名称" clearable class="w-[180px]!" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="设备组管理" :columns="columns" @refresh="onSearch">
            <template #buttons>
                <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">新增</el-button>
                <el-button type="danger" :icon="useRenderIcon(Delete)" :disabled="selectionData.length === 0" @click="handleBatchDelete">批量删除</el-button>
            </template>
            <template v-slot="{ size, dynamicColumns }">
                <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="dataList" :columns="dynamicColumns" :pagination="{ ...pagination, size }" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange" @page-current-change="handleCurrentChange">
                    <template #operation="{ row }">
                        <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(Key)" @click="onAuth(row)">授权</el-button>
                        <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="openDialog('修改', row)">编辑</el-button>
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
                        <el-form-item label="设备组名称" prop="name"><el-input v-model="formData.name" placeholder="请输入设备组名称" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="设备组描述" prop="desc"><el-input v-model="formData.desc" type="textarea" placeholder="请输入设备组描述" clearable /></el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>

        <!-- 授权弹窗 -->
        <el-dialog v-model="authDialogVisible" title="设备组授权" class="edit-dialog" destroy-on-close :close-on-click-modal="false">
            <el-descriptions :column="2" border class="mb-4">
                <el-descriptions-item label="设备组名称">{{ currentAuthDvcGroup.Name }}</el-descriptions-item>
                <el-descriptions-item label="设备组描述">{{ currentAuthDvcGroup.Desc }}</el-descriptions-item>
            </el-descriptions>
            <h4 class="mb-2">角色授权</h4>
            <el-transfer :key="transferKey" v-model="authRoles" :data="allRoles" :titles="['可选角色', '已选角色']" filterable>
                <template #default="{ option }"><span>{{ option.value }}</span></template>
            </el-transfer>
            <h4 class="mt-4 mb-2">设备授权</h4>
            <el-transfer :key="transferKey" v-model="authDvcs" :data="allDvcs" :titles="['可选设备', '已选设备']" filterable>
                <template #default="{ option }"><span>{{ option.value }}</span></template>
            </el-transfer>
            <template #footer>
                <el-button @click="authDialogVisible = false">返回列表</el-button>
                <el-button type="primary" @click="onAuthSubmit">保存授权</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) { margin: 0; }
:deep(.el-transfer-panel) { min-width: 300px; }
</style>