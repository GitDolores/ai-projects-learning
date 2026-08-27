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

defineOptions({ name: 'MpaAdminUser' })

// ============ 类型定义 ============
type UserType = {
    UserCode: string
    CompanyCode: string
    UserName: string
    LoginName: string
    Password: string
    EMail: string
    PhoneNo: string
    TelNo: string
    Sex: string
    Expire: string
    UserType: string
    Enable: string
    RoleNames: string
    MsgTime: string
}

type RoleType = {
    RoleCode: string
    CompanyCode: string
    Enable: string
    RoleName: string
    IS_PRE_ROLE: string
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ userNameLike: '', loginNameLike: '' })
const loading = ref(false)
const roleList = ref<RoleType[]>([])

const onSearch = () => {
    pagination.currentPage = 1
    getList()
}

const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    onSearch()
}

const getRoleList = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/systrole/enable')
        roleList.value = (resp as RoleType[]) || []
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
const selectionData = ref<UserType[]>([])

const handleSelectionChange = (rows: UserType[]) => {
    selectionData.value = rows
}

// ============ 表格 ============
const dataList = ref<UserType[]>([])

const columns: TableColumnList = [
    { type: 'selection', width: 50 },
    { type: 'index', label: '序号', width: 60 },
    { label: '用户名', prop: 'UserName', minWidth: 100 },
    { label: '登录名', prop: 'LoginName', minWidth: 100 },
    { label: '状态', prop: 'Enable', slot: 'Enable', width: 80 },
    { label: '手机号', prop: 'PhoneNo', minWidth: 120 },
    { label: '角色', prop: 'RoleNames', minWidth: 140 },
    { label: '过期时间', prop: 'Expire', width: 160 },
    { label: '邮箱', prop: 'EMail', minWidth: 150 },
    { label: '性别', prop: 'Sex', width: 80 },
    { label: '类型', prop: 'UserType', width: 100 },
    { label: '创建时间', prop: 'MsgTime', width: 180 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 240 },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {
            pageSize: pagination.pageSize,
            pageIndex: pagination.currentPage,
        }
        if (searchForm.userNameLike) params.userNameLike = searchForm.userNameLike
        if (searchForm.loginNameLike) params.loginNameLike = searchForm.loginNameLike

        const resp: { List: UserType[]; Total: number } = await http.request('get', 'api/mpa/systuser/search', { params })
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
    userCode: '',
    companyCode: '',
    userName: '',
    loginName: '',
    password: '',
    eMail: '',
    phoneNo: '',
    telNo: '',
    sex: '男',
    expire: '2099-12-31',
    userType: '内部用户',
    enable: 'Y',
})
const formData = reactive(defaultFormData())

const formRules: FormRules = {
    userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    loginName: [{ required: true, message: '请输入登录名', trigger: 'blur' }],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    ],
    phoneNo: [
        { required: true, message: '请输入联系电话', trigger: 'blur' },
        { min: 11, message: '请输入正确的联系方式', trigger: 'blur' },
    ],
    sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
    expire: [{ required: true, message: '请选择有效期', trigger: 'change' }],
    userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }],
}

const openDialog = (title = '新增', row?: UserType) => {
    dialogTitle.value = title
    if (row) {
        dialogType.value = 'edit'
        Object.assign(formData, {
            userCode: row.UserCode,
            companyCode: row.CompanyCode,
            userName: row.UserName,
            loginName: row.LoginName,
            password: '',
            eMail: row.EMail,
            phoneNo: row.PhoneNo,
            telNo: row.TelNo,
            sex: row.Sex,
            expire: row.Expire,
            userType: row.UserType,
            enable: row.Enable,
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
            await http.request('post', 'api/mpa/systuser', { data: { ...formData } })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', 'api/mpa/systuser', { data: { ...formData } })
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
const handleDelete = async (row: UserType) => {
    try {
        await http.request('delete', 'api/mpa/systuser', {
            params: { usercode: row.UserCode },
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
            await http.request('delete', 'api/mpa/systuser', {
                params: { usercode: row.UserCode },
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
const currentAuthUser = ref({ UserName: '', UserCode: '' })
const authRoles = ref<string[]>([])
const authRolesList = ref<any[]>([])

const onAuth = async (row: UserType) => {
    currentAuthUser.value = { UserName: row.UserName, UserCode: row.UserCode }
    authRoles.value = []
    await getAllRoles()
    await getUserRoles(row.UserCode)
    authDialogVisible.value = true
}

const getAllRoles = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/systrole/enable')
        authRolesList.value = (resp as RoleType[]).map((x) => ({
            key: x.RoleCode,
            value: x.RoleName,
            disabled: x.Enable === 'N',
        }))
    } catch (ex: any) {
        alertx('获取角色列表失败', ex)
    }
}

const getUserRoles = async (userId: string) => {
    try {
        const resp = await http.request('get', 'api/mpa/systreluserrole/code', {
            params: { usercode: userId },
        })
        authRoles.value = ((resp as RoleType[]) || []).map((x) => x.RoleCode)
    } catch (ex: any) {
        alertx('获取用户角色失败', ex)
    }
}

const onAuthSubmit = async () => {
    try {
        await http.request('put', 'api/mpa/systreluserrole', {
            params: { USERCODE: currentAuthUser.value.UserCode },
            data: authRoles.value,
        })
        ElMessage.success('授权保存成功')
        authDialogVisible.value = false
    } catch (ex: any) {
        alertx('保存授权失败', ex)
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
            <el-form-item label="用户名：" prop="userNameLike">
                <el-input v-model="searchForm.userNameLike" placeholder="请输入用户名" clearable class="w-[180px]!" />
            </el-form-item>
            <el-form-item label="登录名：" prop="loginNameLike">
                <el-input v-model="searchForm.loginNameLike" placeholder="请输入登录名" clearable class="w-[180px]!" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :icon="useRenderIcon('ri/search-line')" :loading="loading" @click="onSearch">搜索</el-button>
                <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格区域 -->
        <PureTableBar title="用户管理" :columns="columns" @refresh="onSearch">
            <template #buttons>
                <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">新增</el-button>
                <el-button type="danger" :icon="useRenderIcon(Delete)" :disabled="selectionData.length === 0" @click="handleBatchDelete">批量删除</el-button>
            </template>
            <template v-slot="{ size, dynamicColumns }">
                <pure-table ref="tableRef" align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading" :size="size" adaptive :data="dataList" :columns="dynamicColumns" :pagination="{ ...pagination, size }" :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange" @page-current-change="handleCurrentChange">
                    <template #Enable="{ row }">
                        <el-tag :type="row.Enable === 'Y' ? 'success' : 'danger'" disable-transitions>{{ row.Enable === 'Y' ? '可用' : '禁用' }}</el-tag>
                    </template>
                    <template #operation="{ row }">
                        <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="openDialog('修改', row)">修改</el-button>
                        <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)" @click="onAuth(row)">授权</el-button>
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
                        <el-form-item label="用户名" prop="userName"><el-input v-model="formData.userName" placeholder="请输入用户名" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="登录名" prop="loginName"><el-input v-model="formData.loginName" placeholder="请输入登录名" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="密码" prop="password"><el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="电子邮箱" prop="eMail"><el-input v-model="formData.eMail" type="email" placeholder="请输入邮箱" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="联系电话" prop="phoneNo"><el-input v-model="formData.phoneNo" placeholder="请输入联系电话" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="座机电话" prop="telNo"><el-input v-model="formData.telNo" placeholder="请输入座机电话" clearable /></el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="性别" prop="sex">
                            <el-select v-model="formData.sex" placeholder="请选择性别" clearable class="w-full!">
                                <el-option label="男" value="男" />
                                <el-option label="女" value="女" />
                                <el-option label="其他" value="其他" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="有效期" prop="expire">
                            <el-date-picker v-model="formData.expire" type="date" placeholder="请选择有效期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="w-full!" />
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="用户类型" prop="userType">
                            <el-select v-model="formData.userType" placeholder="请选择用户类型" clearable class="w-full!">
                                <el-option label="内部用户" value="内部用户" />
                                <el-option label="外部用户" value="外部用户" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="12" :md="12" :sm="12" :xs="24">
                        <el-form-item label="状态" prop="enable">
                            <el-switch v-model="formData.enable" active-value="Y" inactive-value="N" active-text="启用" inactive-text="禁用" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
            </template>
        </el-dialog>

        <!-- 授权弹窗 -->
        <el-dialog v-model="authDialogVisible" title="用户授权" class="edit-dialog" destroy-on-close :close-on-click-modal="false">
            <div class="mb-4">为用户「{{ currentAuthUser.UserName }}」授权</div>
            <el-transfer v-model="authRoles" :data="authRolesList" :titles="['可选角色', '已选角色']" filterable>
                <template #default="{ option }"><span>{{ option.value }}</span></template>
            </el-transfer>
            <template #footer>
                <el-button @click="authDialogVisible = false">返回</el-button>
                <el-button type="primary" @click="onAuthSubmit">保存授权</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) { margin: 0; }
</style>