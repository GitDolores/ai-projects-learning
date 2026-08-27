<template>
    <div class="main main-content">
        <el-card
            shadow="never"
            :body-style="{
                height: 'calc(100vh - 160px)',
                display: 'flex',
                flexDirection: 'column',
            }"
        >
            <!-- 列表页面 -->
            <div v-show="pageState === 'list'" class="flex flex-col h-full">
                <div class="flex-shrink-0">
                    <el-form :inline="true">
                        <el-form-item label="用户代码~">
                            <el-input v-model="searchForm.usercodeLike" placeholder="用户代码" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :icon="Search" @click="onSearch">查询</el-button>
                            <el-button type="primary" @click="onAdd">添加用户</el-button>
                        </el-form-item>
                    </el-form>
                    <el-divider style="margin-top: 8px" />
                </div>
                <div class="flex-grow overflow-hidden">
                    <el-table :data="thirderList" border fit height="100%" style="width: 100%">
                        <el-table-column label="用户代码" prop="UserCode" min-width="150" />
                        <el-table-column label="关联企业" min-width="150">
                            <template #default="scope">
                                {{
                                    (scope.row.COMPANYS || [])
                                        .filter((x) => x !== null && x !== undefined)
                                        .map((x) => x.CompanyName)
                                        .join(',')
                                }}
                            </template>
                        </el-table-column>
                        <el-table-column label="手机号" prop="PhoneNo" min-width="150" />
                        <el-table-column label="邮箱" prop="EMail" min-width="150" />
                        <el-table-column label="第三方名称" prop="UserName" min-width="210" />
                        <el-table-column label="状态" min-width="80">
                            <template #default="scope">
                                <el-tag type="info">
                                    {{ scope.row.Enable === 'Y' ? '可用' : '禁用' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="400" fixed="right">
                            <template #default="scope">
                                <el-button link type="primary" size="small" @click="handleDoc(scope.row)">文档</el-button>
                                <el-button link type="primary" size="small" @click="onEdit(scope.row)">编辑用户</el-button>
                                <el-button link type="primary" size="small" @click="handleCompany(scope.row)">关联企业</el-button>
                                <el-button link type="primary" size="small" @click="handleApiPermission(scope.row)">接口权限</el-button>
                                <el-button link type="danger" size="small" @click="onDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="mt-4 flex justify-end">
                    <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize" :page-sizes="[5, 10, 20, 30, 50]" size="small" :background="true" layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" @size-change="onSizeChange" @current-change="onPageChange" />
                </div>
            </div>

            <!-- 新增/编辑表单 -->
            <div v-show="pageState === 'form'" class="p-6 bg-white place-self-center w-200 max-w-full">
                <h2 class="text-xl font-bold mb-6">
                    {{ isEdit ? '编辑用户' : '新增用户' }}
                </h2>
                <el-form ref="userFormRef" :model="formDataAddUser" :rules="formDataAddUserRules" label-width="120px" label-position="right">
                    <el-form-item label="用户代码" prop="userCode">
                        <el-input v-model="formDataAddUser.userCode" placeholder="请输入用户代码" :disabled="isEdit" class="full-width-input" @keyup="formDataAddUser.userCode = formDataAddUser.userCode.toUpperCase()" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="formDataAddUser.password" type="password" placeholder="请输入密码" :show-password="true" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="手机号" prop="phoneNo">
                        <el-input v-model="formDataAddUser.phoneNo" placeholder="请输入手机号" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="邮箱" prop="eMail">
                        <el-input v-model="formDataAddUser.eMail" placeholder="请输入邮箱" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="第三方名称" prop="userName">
                        <el-input v-model="formDataAddUser.userName" placeholder="请输入第三方名称" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="状态" prop="enable">
                        <el-select v-model="formDataAddUser.enable" placeholder="请选择" class="full-width-input">
                            <el-option v-for="item in ynOptions" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <span class="dialog-footer">
                            <el-button @click="pageState = 'list'">取消</el-button>
                            <el-button type="primary" @click="onSubmitAddUser">确定</el-button>
                        </span>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 接口权限配置表单 -->
            <div v-show="pageState === 'apiPermission'" class="p-6 bg-white place-self-center w-200 max-w-full">
                <h2 class="text-xl font-bold mb-6">接口权限配置</h2>
                <div class="mb-6">
                    <span>用户: {{ currentUser.userCode }}</span>
                </div>
                <el-transfer v-model="selectedApis" filterable :titles="['接口列表', '已配置']" filter-placeholder="请输入接口名" :data="apis" :props="{ key: 'key', label: 'label' }" class="full-width-input">
                    <template #default="{ option }">
                        <span :title="option.key + '-' + option.label">{{ option.key }}-{{ option.label }}</span>
                    </template>
                </el-transfer>
                <div class="mt-6 text-center">
                    <el-button @click="pageState = 'list'">取消</el-button>
                    <el-button type="primary" @click="submitApiPermission">确定</el-button>
                </div>
            </div>

            <!-- 关联企业表单 -->
            <div v-show="pageState === 'company'" class="p-6 bg-white place-self-center w-200 max-w-full">
                <h2 class="text-xl font-bold mb-6">关联企业</h2>
                <div class="mb-6">
                    <span>用户: {{ currentCompanyUser?.UserCode || '' }}</span>
                </div>
                <div class="flex gap-4">
                    <!-- 左侧：所有企业 -->
                    <div class="flex-1">
                        <div class="mb-4">
                            <el-input v-model="companyFilter" placeholder="过滤条件" class="mb-2" />
                            <div>所有企业</div>
                        </div>
                        <div class="border rounded overflow-auto" style="height: 300px">
                            <div v-for="company in filteredCompanies" :key="company.CompanyCode" class="p-2 border-b hover:bg-gray-50 cursor-pointer" :class="{ 'bg-blue-50': company.selected }" @click="toggleCompanySelection(company)">
                                <el-checkbox v-model="company.selected" class="w-full" @click.stop>
                                    {{ company.CompanyName }}
                                </el-checkbox>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：已关联企业 -->
                    <div class="flex-1">
                        <div class="mb-4">
                            <div class="h-10" />
                            <div>已关联企业</div>
                        </div>
                        <div class="border rounded overflow-auto" style="height: 300px">
                            <div v-for="company in selectedCompanies" :key="company.CompanyCode" class="p-2 border-b hover:bg-gray-50 cursor-pointer" @click="toggleCompanySelection(company)">
                                <el-checkbox v-model="company.selected" class="w-full">
                                    {{ company.CompanyName }}
                                </el-checkbox>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-6 text-center">
                    <el-button @click="pageState = 'list'">取消</el-button>
                    <el-button type="primary" @click="submitCompanyRelation">确定</el-button>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElLoadingService, ElForm, FormItemRule } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { http } from '@/utils/http'
import { Arrayable } from '@pureadmin/utils'
import dayjs from 'dayjs'

interface Company {
    CompanyCode: string
    CompanyName: string
    selected: boolean
}

interface ApiItem {
    key: string
    label: string
    ApiCode: string
    ApiDesc: string
}

defineOptions({
    name: 'Xsuperthird',
})

// 组件挂载时加载初始数据
onMounted(() => {
    getListData()
    getApiList()
})

// --- 状态管理 ---
type PageState = 'list' | 'form' | 'apiPermission' | 'company'
const pageState = ref<PageState>('list')

// 表格数据和分页
const loading = ref(true)
const thirderList = ref([])
const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
})

// 查询表单
const searchForm = reactive({
    usercodeLike: '',
})

// 新增/编辑表单
const userFormRef = ref<InstanceType<typeof ElForm>>()
const isEdit = ref(false)
const formDataAddUser = ref({
    userCode: '', // 由后端生成，前端可不填
    password: '',
    phoneNo: '',
    eMail: '',
    userName: '',
    enable: 'Y',
})

const formDataAddUserRules = ref<Partial<Record<string, Arrayable<FormItemRule>>>>({
    userCode: [{ required: true, message: '请输入用户代码', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const ynOptions = ref([
    { value: 'Y', label: '可用' },
    { value: 'N', label: '禁用' },
])

// 接口权限相关
const apis = ref<ApiItem[]>([])
const selectedApis = ref<string[]>([])
const currentUser = ref({
    userCode: '',
    userName: '',
})

// 关联企业相关
const companies = ref<Company[]>([])
const companyFilter = ref('')
const currentCompanyUser = ref<any>(null)

// --- 数据获取与操作函数 ---

/** 获取第三方用户列表 */
const getListData = async () => {
    loading.value = true
    try {
        const resp = await http.request<any>('post', 'api/systhird/Pages', {
            data: {
                USERCODE: searchForm.usercodeLike,
                PAGESIZE: pagination.pageSize,
                PAGENOW: pagination.currentPage,
            },
        })
        pagination.total = resp.Total
        thirderList.value = resp.List
    } catch (ex) {
        alertx('获取第三方用户列表失败', ex)
    } finally {
        loading.value = false
    }
}

/** 获取接口列表 */
const getApiList = async () => {
    const loading = ElLoadingService({
        lock: true,
        text: '正在加载接口数据...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        const resp = await http.request<any>('get', 'api/MPA/systapi/GROUP', {
            params: { APIGROUP: 'basic-auth-third' },
        })

        apis.value = resp.map((item: any) => ({
            key: item.ApiCode,
            label: item.ApiDesc,
            ApiCode: item.ApiCode,
            ApiDesc: item.ApiDesc,
        }))
    } catch (error) {
        alertx('获取接口数据失败', error)
    } finally {
        loading.close()
    }
}

/** 获取企业列表 */
const getCompanyList = async () => {
    if (!currentCompanyUser.value) {
        ElMessage.warning('无正在编辑的帐号')
        return
    }

    const loading = ElLoadingService({
        lock: true,
        text: '正在请求数据...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        const resp = await http.request<any>('get', 'api/MPA/systcompany')
        const companyData = resp

        // 获取当前用户已关联的企业代码 - 过滤掉 null 值
        const userCompanyCodes = new Set((currentCompanyUser.value.COMPANYS || []).filter((c: any) => c !== null && c !== undefined && c.CompanyCode).map((c: any) => c.CompanyCode))

        // 设置选中状态
        companies.value = companyData.map((company: any) => ({
            CompanyCode: company.CompanyCode,
            CompanyName: company.CompanyName,
            selected: userCompanyCodes.has(company.CompanyCode),
        }))
    } catch (err) {
        alertx('获取企业列表失败', err)
    } finally {
        loading.close()
    }
}

/** 获取用户接口权限 */
const getUserApis = async (userCode: string) => {
    selectedApis.value = []
    try {
        const resp = await http.request<any>('get', 'api/systhird/USERCODE', {
            params: { USERCODE: userCode },
        })

        if (resp && resp.length) {
            selectedApis.value = resp.map((item: any) => item.ApiCode)
        }
    } catch (error) {
        alertx('获取用户接口权限失败', error)
    }
}

// --- 事件处理 ---

/** 查询 */
const onSearch = () => {
    pagination.currentPage = 1
    getListData()
}

/** 分页变化 */
const onPageChange = (page: number) => {
    pagination.currentPage = page
    getListData()
}

/** 每页条数变化 */
const onSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    getListData()
}

/** 新增用户 */
const onAdd = () => {
    isEdit.value = false
    userFormRef.value?.resetFields()
    pageState.value = 'form'
}

/** 编辑用户 */
const onEdit = (row: any) => {
    isEdit.value = true
    Object.assign(formDataAddUser.value, {
        userCode: row.UserCode,
        password: row.Password,
        phoneNo: row.PhoneNo,
        eMail: row.EMail,
        userName: row.UserName,
        enable: row.Enable,
    })
    pageState.value = 'form'
}

/** 提交（新增或编辑） */
const onSubmitAddUser = async () => {
    userFormRef.value?.validate(async (valid) => {
        if (valid) {
            const req_title = isEdit.value ? '更新用户' : '创建用户'
            const loading = ElLoadingService({
                lock: true,
                text: `正在${req_title}...`,
                spinner: 'el-icon-loading',
                background: 'rgba(0,0,0,0.7)',
            })

            try {
                const method = isEdit.value ? 'post' : 'post'
                const url = isEdit.value ? 'api/systhird/Update' : 'api/systhird/Insert'

                await http.request(method, url, {
                    data: formDataAddUser.value,
                })

                ElMessage.success(`${req_title}成功`)
                pageState.value = 'list'
                getListData()
            } catch (err) {
                alertx(`${req_title}失败`, err)
            } finally {
                loading.close()
            }
        }
    })
}

/** 删除用户 */
const onDelete = (row: any) => {
    ElMessageBox.confirm('此操作将永久删除该第三方, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            const loading = ElLoadingService({
                lock: true,
                text: '正在删除用户...',
                spinner: 'el-icon-loading',
                background: 'rgba(0,0,0,0.7)',
            })

            try {
                await http.request('post', 'api/systhird/Delete', {
                    params: { USERCODE: row.UserCode },
                })
                ElMessage.success('删除成功')
                getListData()
            } catch (err) {
                alertx('删除失败', err)
            } finally {
                loading.close()
            }
        })
        .catch(() => {})
}

/** 处理接口权限 */
const handleApiPermission = async (row: any) => {
    currentUser.value = {
        userCode: row.UserCode,
        userName: row.UserName,
    }
    await getUserApis(row.UserCode)
    pageState.value = 'apiPermission'
}

/** 提交接口权限 */
const submitApiPermission = async () => {
    const loading = ElLoadingService({
        lock: true,
        text: '正在保存接口权限...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        const apiData = selectedApis.value.map((code) => ({ ApiCode: code }))
        await http.request('post', 'api/systhird/Filter', {
            params: { USERCODE: currentUser.value.userCode },
            data: apiData,
        })
        ElMessage.success('保存成功')
        pageState.value = 'list'
    } catch (err) {
        alertx('保存接口权限失败', err)
    } finally {
        loading.close()
    }
}

/** 处理关联企业 */
const handleCompany = async (row: any) => {
    currentCompanyUser.value = row
    await getCompanyList()
    pageState.value = 'company'
}

/** 切换企业选择 */
const toggleCompanySelection = (company: Company) => {
    company.selected = !company.selected
}

/** 提交关联企业 */
const submitCompanyRelation = async () => {
    if (!currentCompanyUser.value) return

    const loading = ElLoadingService({
        lock: true,
        text: '正在保存企业关系...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        const selectedCompanyCodes = companies.value.filter((company) => company.selected).map((company) => company.CompanyCode)

        await http.request('post', 'api/systhird/ref/companycodes', {
            params: { usercode: currentCompanyUser.value.UserCode },
            data: selectedCompanyCodes,
        })

        ElMessage.success('保存企业关系成功')
        pageState.value = 'list'
        getListData()
    } catch (err) {
        alertx('保存企业关系失败', err)
    } finally {
        loading.close()
    }
}

/** 生成文档 */
const handleDoc = async (row: any) => {
    return
    const loading = ElLoadingService({
        lock: true,
        text: '正在生成文档...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        const resp = await http.request<any>('post', 'api/mpa/docs/doc/key', {
            data: {
                usercode: row.UserCode,
                expired: dayjs().add(60, 'days').format('YYYY-MM-DD'),
            },
        })

        const key = resp.data
        const baseUrl = String(import.meta.env.VITE_BASE_URL).replace(/\/$/gi, '')
        window.open(`${baseUrl}/api/mpa/docs/doc/download?key=${encodeURIComponent(key)}`)
    } catch (err) {
        alertx('生成文档失败', err)
    } finally {
        loading.close()
    }
}

// --- 计算属性 ---

/** 过滤后的企业列表 */
const filteredCompanies = computed(() => {
    if (!companyFilter.value) {
        return companies.value
    }
    return companies.value.filter((company) => company.CompanyName.includes(companyFilter.value))
})

/** 已选中的企业 */
const selectedCompanies = computed(() => {
    return companies.value.filter((company) => company.selected)
})
</script>

<style scoped>
.full-width-input {
    width: 100%;
}

/* 表格样式 */
:deep(.el-table) {
    min-width: 1000px;
}

:deep(.el-table__body-wrapper) {
    overflow-x: auto;
}

:deep(.el-transfer-panel) {
    min-width: 250px;
}
</style>
