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

defineOptions({ name: 'Xorgposition' })

// ============ 类型定义 ============
type PositionType = {
    PositionId: string
    PositionCode: string
    PositionName: string
    Level: string
    Remark: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ PositionNameLike: '' })
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
const selectionData = ref<PositionType[]>([])

const handleSelectionChange = (rows: PositionType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<PositionType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '职位代码', prop: 'PositionCode', minWidth: 120 },
    { label: '职位名称', prop: 'PositionName', minWidth: 120 },
    { label: '职位级别', prop: 'Level', width: 100 },
    { label: '备注', prop: 'Remark', minWidth: 150, showOverflowTooltip: true },
    { label: '操作', slot: 'operation', fixed: 'right', width: 200 },
]

const getList = async () => {
    loading.value = true
    try {
        const resp = await http.request('get', 'api/MPA/orgtunitposition')
        const filteredList = Array.isArray(resp) ? resp : []
        // 前端过滤
        const searchName = searchForm.PositionNameLike?.toLowerCase()
        const filtered = searchName
            ? filteredList.filter((item: PositionType) =>
                  item.PositionName?.toLowerCase().includes(searchName)
              )
            : filteredList
        dataList.value = filtered
        pagination.total = filtered.length
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
    positionId: '',
    positionCode: '',
    positionName: '',
    level: '',
    remark: '',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    positionCode: [{ required: true, message: '请输入职位代码', trigger: 'blur' }],
    positionName: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
    level: [{ required: true, message: '请输入职位级别', trigger: 'blur' }],
}

const openDialog = (title = '新增', row?: PositionType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            positionId: row.PositionId,
            positionCode: row.PositionCode,
            positionName: row.PositionName,
            level: row.Level,
            remark: row.Remark,
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
        const requestData = [
            {
                positionId: formData.positionId,
                positionCode: formData.positionCode,
                positionName: formData.positionName,
                level: formData.level,
                remark: formData.remark,
            },
        ]
        if (dialogType.value === 'add') {
            await http.request('post', 'api/MPA/orgtunitposition', { data: requestData })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', 'api/MPA/orgtunitposition', { data: requestData })
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
const handleDelete = async (row: PositionType) => {
    try {
        await http.request('delete', 'api/MPA/orgtunitposition', {
            params: { POSITIONID: row.PositionId },
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
            await http.request('delete', 'api/MPA/orgtunitposition', {
                params: { POSITIONID: row.PositionId },
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
                label="职位名称："
                prop="PositionNameLike"
            >
                <el-input
                    v-model="searchForm.PositionNameLike"
                    placeholder="请输入职位名称"
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
            title="职位管理"
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
                            label="职位代码"
                            prop="positionCode"
                        >
                            <el-input
                                v-model="formData.positionCode"
                                placeholder="请输入职位代码"
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
                            label="职位名称"
                            prop="positionName"
                        >
                            <el-input
                                v-model="formData.positionName"
                                placeholder="请输入职位名称"
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
                            label="职位级别"
                            prop="level"
                        >
                            <el-input
                                v-model="formData.level"
                                placeholder="请输入职位级别"
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
                            label="备注"
                            prop="remark"
                        >
                            <el-input
                                v-model="formData.remark"
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