<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Delete from '~icons/ep/delete'
import EditPen from '~icons/ep/edit-pen'
import Refresh from '~icons/ep/refresh'
import AddFill from '~icons/ri/add-circle-line'
import View from '~icons/ep/view'
import { http } from '@/utils/http'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'MpaAdminDvc' })

// ============ 类型定义 ============
type DvcType = {
    Id: string
    Name: string
    Desc: string
    DvcTypeCode: string
    DvcTypeName: string
    CreateManName: string
    MsgTime: string
    ModifyManName: string
    ModifyTime: string
}

type DvcTypeOption = {
    Code: string
    Name: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ nameLike: '', dvcTypeCode: '', dvcIn: 'COMPANY' as 'COMPANY' | 'USER' })
const loading = ref(false)
const dvcTypeCodes = ref<DvcTypeOption[]>([])

const onSearch = () => {
    pagination.currentPage = 1
    getList()
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    onSearch()
}

const getDvcTypes = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/iot/dvctype/list')
        dvcTypeCodes.value = ((resp as any[]) || []).map((item) => ({
            Code: item.Code || '',
            Name: item.Name || '',
        }))
    } catch (ex: any) {
        alertx('获取设备类型列表失败', ex)
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
const selectionData = ref<DvcType[]>([])

const handleSelectionChange = (rows: DvcType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<DvcType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '设备名称', prop: 'Name', minWidth: 120 },
    { label: '设备描述', prop: 'Desc', minWidth: 150 },
    { label: '添加人', prop: 'CreateManName', width: 80 },
    { label: '添加时间', prop: 'MsgTime', width: 180 },
    { label: '修改人', prop: 'ModifyManName', width: 80 },
    { label: '修改时间', prop: 'ModifyTime', width: 180 },
    { label: '设备类型', prop: 'DvcTypeCode', minWidth: 100 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 240 },
]

const getList = async () => {
    loading.value = true
    try {
        const url = searchForm.dvcIn === 'COMPANY' ? 'api/mpa/iot/dvc/list' : 'api/mpa/iot/dvc/list/user'
        const params: Record<string, any> = {}
        if (searchForm.nameLike) params.name_like = searchForm.nameLike
        if (searchForm.dvcTypeCode) params.dvc_type_code = searchForm.dvcTypeCode

        const resp = (await http.request('get', url, { params })) as any
        dataList.value = (Array.isArray(resp) ? resp : resp.data || resp.List || []) as DvcType[]
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
    dPwd: '',
    dvcTypeCode: '',
    createManName: '',
    msgTime: '',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
    desc: [{ required: true, message: '请输入设备描述', trigger: 'blur' }],
    dvcTypeCode: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
    dPwd: [{ required: true, message: '请输入设备密钥', trigger: 'blur' }],
}

const openDialog = (title = '新增', row?: DvcType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            id: row.Id,
            name: row.Name,
            desc: row.Desc,
            dvcTypeCode: row.DvcTypeCode,
            createManName: row.CreateManName,
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
            DPwd: formData.dPwd,
            DvcTypeCode: formData.dvcTypeCode,
        }
        if (dialogType.value === 'add') {
            await http.request('post', 'api/mpa/iot/dvc', { data: requestData })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', 'api/mpa/iot/dvc', { data: requestData })
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
const handleDelete = async (row: DvcType) => {
    try {
        await http.request('delete', 'api/mpa/iot/dvc', {
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
            await http.request('delete', 'api/mpa/iot/dvc', {
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

// ============ 查看详情弹窗 ============
const viewDialogVisible = ref(false)
const viewData = ref<DvcType>({} as DvcType)
const currentDvcKey = ref('')
const newKeyForm = reactive({ key: '' })

const onView = async (row: DvcType) => {
    viewData.value = row
    currentDvcKey.value = ''
    newKeyForm.key = ''
    await getDvcKey(row.Id)
    viewDialogVisible.value = true
}

const getDvcKey = async (dvcId: string) => {
    try {
        const resp = await http.request('get', 'api/mpa/iot/dvc/key', {
            params: { dvc_id: dvcId },
        })
        currentDvcKey.value = (resp as string) || ''
    } catch (ex: any) {
        alertx('获取设备密钥失败', ex)
    }
}

// ============ 工具函数 ============
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

const onKeySubmit = async () => {
    if (!newKeyForm.key) {
        ElMessage.warning('请输入新密钥')
        return
    }
    try {
        await http.request('put', 'api/mpa/iot/dvc/key', {
            params: { dvc_id: viewData.value.Id, key: newKeyForm.key },
        })
        currentDvcKey.value = newKeyForm.key
        ElMessage.success('密钥更新成功')
        newKeyForm.key = ''
    } catch (ex: any) {
        alertx('更新设备密钥失败', ex)
    }
}

onMounted(() => {
    getDvcTypes()
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
            <el-form-item label="设备名称：" prop="nameLike">
                <el-input v-model="searchForm.nameLike" placeholder="请输入设备名称" clearable class="w-[180px]!" />
            </el-form-item>
            <el-form-item label="设备类型：" prop="dvcTypeCode">
                <el-select v-model="searchForm.dvcTypeCode" placeholder="请选择设备类型" clearable class="w-[180px]!">
                    <el-option v-for="c in dvcTypeCodes" :key="c.Code" :label="c.Name" :value="c.Code" />
                    <el-option label="全部" value="" />
                </el-select>
            </el-form-item>
            <el-form-item label="范围：" prop="dvcIn">
                <el-select v-model="searchForm.dvcIn" placeholder="请选择范围" clearable class="w-[180px]!">
                    <el-option label="企业设备" value="COMPANY" />
                    <el-option label="当前用户" value="USER" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="设备管理" :columns="columns" @refresh="onSearch">
            <template #buttons>
                <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">新增</el-button>
                <el-button type="danger" :icon="useRenderIcon(Delete)" :disabled="selectionData.length === 0" @click="handleBatchDelete">批量删除</el-button>
            </template>
            <template v-slot="{ size, dynamicColumns }">
                <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="dataList" :columns="dynamicColumns" :pagination="{ ...pagination, size }" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange" @page-current-change="handleCurrentChange">
                    <template #operation="{ row }">
                        <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(View)" @click="onView(row)">查看</el-button>
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
                        <el-form-item label="设备名称" prop="name"><el-input v-model="formData.name" placeholder="请输入设备名称" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="设备描述" prop="desc"><el-input v-model="formData.desc" placeholder="请输入设备描述" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="设备类型" prop="dvcTypeCode">
                            <el-select v-model="formData.dvcTypeCode" placeholder="请选择设备类型" clearable class="w-full!">
                                <el-option v-for="c in dvcTypeCodes" :key="c.Code" :label="c.Name" :value="c.Code" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col v-if="dialogType === 'add'" :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="设备密钥" prop="dPwd">
                            <el-input v-model="formData.dPwd" placeholder="请输入设备密钥" clearable>
                                <template #append><el-button @click="formData.dPwd = generateUUID()">自动生成</el-button></template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>

        <!-- 查看详情弹窗 -->
        <el-dialog v-model="viewDialogVisible" title="设备详情" class="edit-dialog" destroy-on-close :close-on-click-modal="false">
            <el-descriptions :column="2" border>
                <el-descriptions-item label="设备名称">{{ viewData.Name }}</el-descriptions-item>
                <el-descriptions-item label="设备描述">{{ viewData.Desc }}</el-descriptions-item>
                <el-descriptions-item label="设备类型">{{ viewData.DvcTypeCode }}</el-descriptions-item>
                <el-descriptions-item label="设备ID">{{ viewData.Id }}</el-descriptions-item>
                <el-descriptions-item label="创建人">{{ viewData.CreateManName }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ viewData.MsgTime }}</el-descriptions-item>
            </el-descriptions>
            <div class="mt-6">
                <h4 class="mb-2">设备密钥管理</h4>
                <el-alert type="info" :closable="false" class="mb-4">当前设备密钥：<strong>{{ currentDvcKey || '正在加载...' }}</strong></el-alert>
                <el-form :model="newKeyForm" label-width="100px">
                    <el-form-item label="新密钥">
                        <el-input v-model="newKeyForm.key" placeholder="请输入新密钥或点击右侧按钮生成">
                            <template #append><el-button @click="newKeyForm.key = generateUUID()">随机生成</el-button></template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="viewDialogVisible = false">返回列表</el-button>
                <el-button type="primary" @click="onKeySubmit">应用新密钥</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) { margin: 0; }
</style>