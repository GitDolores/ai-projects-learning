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

defineOptions({ name: 'Xsuperouterproject' })

// ============ 类型定义 ============
type OuterProjectType = {
    Id: string
    ProjectCode: string
    ProjectName: string
    Desc: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ ProjectNameLike: '', ProjectCodeLike: '' })
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
const selectionData = ref<OuterProjectType[]>([])

const handleSelectionChange = (rows: OuterProjectType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<OuterProjectType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '项目代码', prop: 'ProjectCode', minWidth: 120 },
    { label: '项目名称', prop: 'ProjectName', minWidth: 150 },
    { label: '备注', prop: 'Desc', minWidth: 200, showOverflowTooltip: true },
    { label: '操作', slot: 'operation', fixed: 'right', width: 200 },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {
            pageSize: pagination.pageSize,
            pageIndex: pagination.currentPage,
        }
        if (searchForm.ProjectNameLike) params.project_name_like = searchForm.ProjectNameLike
        if (searchForm.ProjectCodeLike) params.project_code_like = searchForm.ProjectCodeLike

        const resp: { List: OuterProjectType[]; Total: number } = await http.request('get', 'api/mpa/project/outerproject/page', { params })
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
    ProjectCode: '',
    ProjectName: '',
    Desc: '',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    ProjectCode: [{ required: true, message: '请输入项目代码', trigger: 'blur' }],
    ProjectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
}

const openDialog = (title = '新增', row?: OuterProjectType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            Id: row.Id,
            ProjectCode: row.ProjectCode,
            ProjectName: row.ProjectName,
            Desc: row.Desc,
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
            await http.request('post', 'api/mpa/project/outerproject', { data: { ...formData } })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', `api/mpa/project/outerproject`, { data: { ...formData } })
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
const handleDelete = async (row: OuterProjectType) => {
    try {
        await http.request('delete', 'api/mpa/project/outerproject?id=' + row.Id)
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
            await http.request('delete', 'api/mpa/project/outerproject?id=' + item.Id)
        }
        ElMessage.success('批量删除成功')
        selectionData.value = []
        getList()
    } catch (ex: any) {
        if (ex !== 'cancel') alertx('批量删除失败', ex)
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
            <el-form-item
                label="项目名称："
                prop="ProjectNameLike"
            >
                <el-input
                    v-model="searchForm.ProjectNameLike"
                    placeholder="请输入项目名称"
                    clearable
                    class="w-[180px]!"
                />
            </el-form-item>
            <el-form-item
                label="项目代码："
                prop="ProjectCodeLike"
            >
                <el-input
                    v-model="searchForm.ProjectCodeLike"
                    placeholder="请输入项目代码"
                    clearable
                    class="w-[180px]!"
                />
            </el-form-item>
            <el-form-item>
                <el-button
                    type="primary"
                    :icon="useRenderIcon('ri/search-line')"
                    :loading="loading"
                    @click="onSearch"
                >
                    搜索
                </el-button>
                <el-button
                    :icon="useRenderIcon(Refresh)"
                    @click="resetForm(formRef)"
                >
                    重置
                </el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar
            title="外部项目管理"
            :columns="columns"
            @refresh="onSearch"
        >
            <template #buttons>
                <el-button
                    type="primary"
                    :icon="useRenderIcon(AddFill)"
                    @click="openDialog()"
                >
                    新增
                </el-button>
                <el-button
                    type="danger"
                    :icon="useRenderIcon(Delete)"
                    :disabled="selectionData.length === 0"
                    @click="handleBatchDelete"
                >
                    批量删除
                </el-button>
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
                        <el-button
                            class="reset-margin"
                            link
                            type="primary"
                            :size="size"
                            :icon="useRenderIcon(EditPen)"
                            @click="openDialog('修改', row)"
                        >
                            修改
                        </el-button>
                        <el-popconfirm
                            title="是否确认删除?"
                            @confirm="handleDelete(row)"
                        >
                            <template #reference>
                                <el-button
                                    class="reset-margin"
                                    link
                                    type="primary"
                                    :size="size"
                                    :icon="useRenderIcon(Delete)"
                                >
                                    删除
                                </el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </pure-table>
            </template>
        </PureTableBar>

        <!-- 弹窗表单 -->
        <el-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            class="edit-dialog"
            destroy-on-close
            :close-on-click-modal="false"
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                class="lay-form"
                label-width="120px"
            >
                <el-row :gutter="30">
                    <el-col
                        :lg="12"
                        :md="12"
                        :sm="12"
                        :xs="24"
                    >
                        <el-form-item
                            label="项目代码"
                            prop="ProjectCode"
                        >
                            <el-input
                                v-model="formData.ProjectCode"
                                placeholder="请输入项目代码"
                                clearable
                            />
                        </el-form-item>
                    </el-col>
                    <el-col
                        :lg="12"
                        :md="12"
                        :sm="12"
                        :xs="24"
                    >
                        <el-form-item
                            label="项目名称"
                            prop="ProjectName"
                        >
                            <el-input
                                v-model="formData.ProjectName"
                                placeholder="请输入项目名称"
                                clearable
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :lg="24" :md="24" :sm="24" :xs="24">
                        <el-form-item
                            label="备注"
                            prop="Desc"
                        >
                            <el-input
                                v-model="formData.Desc"
                                type="textarea"
                                placeholder="请输入备注"
                                clearable
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button
                    type="primary"
                    :loading="submitLoading"
                    @click="submitForm"
                >
                    确定
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
    margin: 0;
}
</style>