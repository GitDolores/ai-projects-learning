<template>
    <div class="main main-content">
        <el-card shadow="never">
            <div class="mb-4">
                <el-form :inline="true" :model="searchForm">
                    <el-form-item label="任务代码">
                        <el-input v-model="searchForm.jobCode" placeholder="请输入" clearable style="width: 150px" />
                    </el-form-item>
                    <el-form-item label="任务名称">
                        <el-input v-model="searchForm.jobName" placeholder="请输入" clearable style="width: 150px" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="searchForm.isEnable" placeholder="全部" clearable style="width: 100px">
                            <el-option label="启用" value="Y" />
                            <el-option label="禁用" value="N" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">搜索</el-button>
                        <el-button @click="onReset">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <div class="mb-4">
                <el-button type="primary" @click="onAdd">新增任务</el-button>
            </div>

            <el-table v-loading="loading" :data="tableData" border stripe height="calc(100vh - 340px)">
                <el-table-column prop="JobCode" label="任务代码" width="250" />
                <el-table-column prop="JobName" label="任务名称" width="180" />
                <el-table-column prop="CronExpression" label="Cron 表达式" width="140" />
                <el-table-column prop="JobParams" label="参数" min-width="150" show-overflow-tooltip />
                <el-table-column label="状态" width="80">
                    <template #default="{ row }">
                        <el-tag :type="row.IsEnable === 'Y' ? 'success' : 'info'">
                            {{ row.IsEnable === 'Y' ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="UpdateAt" label="修改时间" width="160" />
                <el-table-column label="操作" width="240" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="onEdit(row as SuperJobConfigItem)">编辑</el-button>
                        <el-button link type="success" @click="onTrigger(row as SuperJobConfigItem)">手动触发</el-button>
                        <el-button link type="danger" @click="onDelete(row as SuperJobConfigItem)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="mt-4 flex justify-end">
                <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.limit" :page-sizes="[10, 20, 30, 50]" size="small" background layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" @size-change="loadData" @current-change="loadData" />
            </div>
        </el-card>

        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
                <el-form-item label="任务代码" prop="JobCode">
                    <el-input v-model="formData.JobCode" :disabled="isEdit" placeholder="英文字母+数字+下划线" />
                </el-form-item>
                <el-form-item label="任务名称" prop="JobName">
                    <el-input v-model="formData.JobName" placeholder="请输入任务名称" />
                </el-form-item>
                <el-form-item label="Cron 表达式" prop="CronExpression">
                    <el-input v-model="formData.CronExpression" placeholder="如 */5 * * * *" @blur="onValidateCron" />
                    <div v-if="cronValidation" :class="cronValidation.IsValid ? 'text-green-500 text-xs mt-1' : 'text-red-500 text-xs mt-1'">
                        {{ cronValidation.IsValid ? '✓ 合法' : '✗ 非法' }}
                        <span v-if="cronValidation.IsValid && cronValidation.NextTimes?.length"> ，下次执行: {{ cronValidation.NextTimes[0] }} </span>
                    </div>
                </el-form-item>
                <el-form-item label="任务参数">
                    <el-input v-model="formData.JobParams" type="textarea" :rows="3" placeholder="JSON 格式" />
                </el-form-item>
                <el-form-item label="状态" prop="IsEnable">
                    <el-radio-group v-model="formData.IsEnable">
                        <el-radio value="Y">启用</el-radio>
                        <el-radio value="N">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="formData.Remark" type="textarea" :rows="2" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="onSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { getConfigPage, createConfig, updateConfig, deleteConfig, triggerJob, validateCron, SuperJobConfigItem } from '@/api/superjob'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'

const searchForm = reactive({ jobCode: '', jobName: '', isEnable: '' })
const tableData = ref<SuperJobConfigItem[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, limit: 20, total: 0 })

const dialogVisible = ref(false)
const dialogTitle = ref('新增任务')
const isEdit = ref(false)
const editId = ref('')
const formRef = ref<FormInstance>()
const cronValidation = ref<{ IsValid: boolean; NextTimes: string[] } | null>(null)

const formData = reactive<Partial<SuperJobConfigItem>>({
    JobCode: '',
    JobName: '',
    CronExpression: '',
    JobParams: '',
    IsEnable: 'Y',
    Remark: '',
})

const formRules: FormRules = {
    JobCode: [{ required: true, message: '请输入任务代码', trigger: 'blur' }],
    JobName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    CronExpression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }],
}

async function loadData() {
    loading.value = true
    try {
        const params: any = { page: pagination.page, limit: pagination.limit }
        if (searchForm.jobCode) params.jobCode = searchForm.jobCode
        if (searchForm.jobName) params.jobName = searchForm.jobName
        if (searchForm.isEnable) params.isEnable = searchForm.isEnable
        const res = await getConfigPage(params)
        tableData.value = res.List || []
        pagination.total = res.Total
    } finally {
        loading.value = false
    }
}

function onSearch() {
    pagination.page = 1
    loadData()
}
function onReset() {
    searchForm.jobCode = ''
    searchForm.jobName = ''
    searchForm.isEnable = ''
    onSearch()
}

function onAdd() {
    isEdit.value = false
    editId.value = ''
    dialogTitle.value = '新增任务'
    Object.assign(formData, { JobCode: '', JobName: '', CronExpression: '', JobParams: '', IsEnable: 'Y', Remark: '' })
    cronValidation.value = null
    dialogVisible.value = true
}

function onEdit(row: SuperJobConfigItem) {
    isEdit.value = true
    editId.value = row.ConfigId
    dialogTitle.value = '编辑任务'
    Object.assign(formData, { ...row })
    cronValidation.value = null
    dialogVisible.value = true
}

async function onDelete(row: SuperJobConfigItem) {
    await ElMessageBox.confirm(`确定删除任务「${row.JobCode}」吗？`, '提示', { type: 'warning' })
    await deleteConfig(row.ConfigId)
    ElMessage.success('删除成功')
    await loadData()
}

async function onTrigger(row: SuperJobConfigItem) {
    await triggerJob(row.ConfigId)
    ElMessage.success(`任务 ${row.JobCode} 已手动触发`)
}

async function onValidateCron() {
    if (!formData.CronExpression) {
        cronValidation.value = null
        return
    }
    const res = await validateCron(formData.CronExpression)
    cronValidation.value = { IsValid: res.IsValid, NextTimes: res.NextTimes }
}

async function onSubmit() {
    const valid = await formRef.value?.validate()
    if (!valid) return
    if (isEdit.value) {
        await updateConfig(editId.value, formData)
        ElMessage.success('更新成功')
    } else {
        await createConfig(formData)
        ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await loadData()
}

function resetForm() {
    formRef.value?.resetFields()
    cronValidation.value = null
}

onMounted(loadData)
</script>
