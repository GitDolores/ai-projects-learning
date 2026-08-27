<template>
    <div class="main main-content">
        <el-card shadow="never" :body-style="{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }">
            <!-- 列表页面 -->
            <div v-show="pageState === 'list'" class="flex flex-col h-full">
                <div class="flex-shrink-0">
                    <el-form :inline="true">
                        <el-form-item label="企业名称~">
                            <el-input v-model="searchForm.companyNameLike" placeholder="企业名称" class="search-input" />
                        </el-form-item>
                        <el-form-item label="企业代码~">
                            <el-input v-model="searchForm.companyCodeLike" placeholder="企业代码" class="search-input" />
                        </el-form-item>
                        <el-form-item label="企业类型:">
                            <el-select v-model="searchForm.companyType" style="width: 100px" class="search-input">
                                <el-option key="all" label="全部" value="" />
                                <el-option v-for="ct in companytypes" :key="ct" :label="ct" :value="ct" />
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :icon="Search" @click="onSearch">搜索</el-button>
                            <el-button type="primary" @click="onAdd">新增</el-button>
                        </el-form-item>
                    </el-form>
                    <el-divider style="margin-top: 8px" />
                </div>
                <div class="flex-grow overflow-hidden">
                    <el-table :data="companyList" border fit height="100%" style="width: 100%">
                        <el-table-column label="企业代码" prop="CompanyCode" min-width="340" />
                        <el-table-column label="企业名称" prop="CompanyName" min-width="140" />
                        <el-table-column label="企业简称" prop="ShortName" min-width="100" />
                        <el-table-column label="企业类型" prop="CompanyType" min-width="100" />
                        <el-table-column label="所属项目" prop="LOGIN_TITLE_NAME" min-width="100" />
                        <el-table-column label="电话" prop="PhoneNo" min-width="140" />
                        <el-table-column label="有效期" prop="Expire" min-width="140" />
                        <el-table-column label="创建时间" prop="CreateTime" min-width="160" />
                        <el-table-column label="状态" prop="Enable" min-width="75">
                            <template #default="scope">
                                <el-button :type="scope.row.Enable === 'Y' ? 'success' : 'danger'" plain>{{ scope.row.Enable === 'Y' ? '可用' : '禁用' }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="200" fixed="right">
                            <template #default="scope">
                                <el-button link type="primary" @click="onEdit(scope.row)">编辑</el-button>
                                <el-button link type="primary" @click="onEditAdminPwd(scope.row)">修改密码</el-button>
                                <el-button link type="danger" @click="onDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="mt-4 flex justify-end">
                    <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 30, 50]" size="small" :background="true" layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" @size-change="onSizeChange" @current-change="onPageChange" />
                </div>
            </div>

            <!-- 企业表单页面（包含角色分配） -->
            <div v-show="pageState === 'form'" class="p-6 bg-white place-self-center w-200 max-w-full" style="height: calc(100vh - 180px); overflow-y: auto">
                <h2 class="text-xl font-bold mb-6">{{ isEdit ? '编辑企业' : '新增企业' }}</h2>
                <el-form ref="companyFormRef" :model="formDataAddCompany" :rules="formDataAddCompanyRules" label-width="180px" label-position="right">
                    <el-form-item label="企业中文名称" prop="companyName">
                        <el-input v-model="formDataAddCompany.companyName" placeholder="请输入企业中文名称" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="中文简称" prop="shortName">
                        <el-input v-model="formDataAddCompany.shortName" placeholder="请输入中文简称" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="企业类型" prop="companyType">
                        <el-select v-model="formDataAddCompany.companyType" :disabled="isEdit" placeholder="请选择企业类型" class="full-width-input">
                            <el-option v-for="ct in companytypes" :key="ct" :label="ct" :value="ct" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="企业管理员-登陆帐号" prop="LOGINNAME">
                        <el-input v-model.trim="formDataAddCompany.LOGINNAME" placeholder="请输入管理员登陆帐号" :disabled="isEdit" class="full-width-input" @keyup="formDataAddCompany.LOGINNAME = formDataAddCompany.LOGINNAME.toUpperCase()" />
                    </el-form-item>
                    <el-form-item v-if="!isEdit" label="企业管理员-登陆密码" prop="superAdminPwd">
                        <el-input v-model="formDataAddCompany.SUPERADMIN_PWD" placeholder="请输入管理员登陆密码" type="password" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="有效期" prop="expire">
                        <el-date-picker v-model="formDataAddCompany.expire" value-format="YYYY-MM-DD" type="date" placeholder="请选择有效期" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="电话" prop="phoneNo">
                        <el-input v-model="formDataAddCompany.phoneNo" placeholder="请输入电话" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="所属项目" prop="loginTitle">
                        <el-select v-model="formDataAddCompany.loginTitle" placeholder="请选择所属项目" class="full-width-input">
                            <el-option v-for="c in sysCodes" :key="c.SCode" :label="c.SValue" :value="c.SCode" />
                        </el-select>
                        <div class="mt-2 text-sm text-gray-600">
                            <i class="el-icon-warning mr-1" />
                            <span v-if="multiloginpage === 'Y'" style="color: darkblue"> 当前[多项目模式]下，需要选择项目名称，从而在企业登陆时，显示的信息皆为此选定项目的信息 </span>
                            <span v-else-if="multiloginpage === 'N'" style="color: darkblue"> 当前[单项目模式]下，所有企业都选择[微服务]或者任意一个项目即可 </span>
                            <span v-else style="color: red"> 当前无法正确获取项目模式，配置企业信息可能会失败，建议重新刷新页面，然后登陆系统，再进行配置 </span>
                        </div>
                    </el-form-item>
                    <el-form-item label="状态" prop="enable">
                        <el-select v-model="formDataAddCompany.enable" placeholder="请选择状态" class="full-width-input">
                            <el-option label="可用" value="Y" />
                            <el-option label="禁用" value="N" />
                        </el-select>
                    </el-form-item>

                    <!-- 角色分配区域 -->
                    <el-form-item label="角色配置">
                        <div class="w-full" style="min-width: 580px">
                            <el-transfer :key="transferKey" v-model="selectedRoles" :props="{ key: 'key', label: 'label' }" filterable :titles="['未配置角色', '已配置角色']" filter-placeholder="请输入角色名" :data="allRoles" class="full-width-input" style="width: 100%; min-width: 580px">
                                <template #default="{ option }">
                                    <span :title="option.label">{{ option.label }}</span>
                                </template>
                            </el-transfer>
                        </div>
                    </el-form-item>

                    <el-form-item class="text-center">
                        <span class="dialog-footer">
                            <el-button @click="pageState = 'list'">取消</el-button>
                            <el-button type="primary" @click="submitForm">确定</el-button>
                        </span>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 修改密码页面 -->
            <div v-show="pageState === 'password'" class="p-6 bg-white place-self-center w-200 max-w-full">
                <h2 class="text-xl font-bold mb-6">修改企业管理员密码</h2>
                <el-form ref="passwordFormRef" label-width="140px" label-position="right">
                    <el-form-item label="企业名称">
                        <el-input v-model="currentCompany.CompanyName" readonly class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="新密码">
                        <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" class="full-width-input" />
                    </el-form-item>
                    <el-form-item label="再次输入新密码">
                        <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" class="full-width-input" />
                    </el-form-item>
                    <el-form-item>
                        <span class="dialog-footer">
                            <el-button @click="pageState = 'list'">取消</el-button>
                            <el-button type="primary" @click="onSaveAdminPwd">确认修改</el-button>
                        </span>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, ElLoadingService, ElForm, ElTransfer, FormItemRule } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { http } from '@/utils/http'
import { Arrayable } from '@pureadmin/utils'

defineOptions({
    name: 'Xsupercompany',
})

// 组件挂载时加载初始数据
onMounted(() => {
    initData()
})

// --- 状态管理 ---
type PageState = 'list' | 'form' | 'password'
const pageState = ref<PageState>('list') // 当前界面状态
const transferKey = ref(0)

// --- 添加watch监听 ---
watch(
    () => pageState.value,
    (newVal, oldVal) => {
        if (oldVal === 'form' || oldVal === 'password') {
            // 离开表单页面时重置相关状态
            selectedRoles.value = []
            transferKey.value++ // 重置transfer组件
        }
    },
)

// 表格数据和分页
const loading = ref(true)
const companyList = ref([])
const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
})

// 查询表单
const searchForm = reactive({
    companyNameLike: '',
    companyCodeLike: '',
    companyType: '',
})

// 表单相关
const companyFormRef = ref<InstanceType<typeof ElForm>>()
const isEdit = ref(false)
const formDataAddCompany = reactive({
    companyCode: '',
    companyName: '',
    shortName: '',
    companyType: '',
    LOGINNAME: '',
    SUPERADMIN_PWD: '',
    expire: null,
    phoneNo: '',
    loginTitle: '',
    enable: 'Y',
})

const passwordFormRef = ref<InstanceType<typeof ElForm>>()
const passwordForm = reactive({
    newPassword: '',
    confirmPassword: '',
})

const formDataAddCompanyRules = ref<Partial<Record<string, Arrayable<FormItemRule>>>>({
    companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
    shortName: [{ required: true, message: '请输入企业简称', trigger: 'blur' }],
    LOGINNAME: [{ required: true, message: '请输入管理员登陆名', trigger: 'blur' }],
    SUPERADMIN_PWD: [{ required: true, message: '请输入管理员密码', trigger: 'blur' }],
    companyType: [{ required: true, message: '请选择企业类型', trigger: 'blur' }],
})

// 角色配置相关
const allRoles = ref([])
const selectedRoles = ref([])

// 其他数据
const companytypes = ref([])
const multiloginpage = ref(null)
const sysCodes = ref([])
const currentCompany = ref<any>({})

// --- 数据获取与操作函数 ---
/** 初始化数据 */
/** 初始化数据 */
const initData = async () => {
    const loading = ElLoadingService({
        lock: true,
        text: `正在加载数据……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        // 获取企业类型
        let typeResp = await http.request<any>('get', 'api/MPA/typecode/List', {
            params: {
                typecode: 'COMPANY_TYPE',
            },
        })
        let companyTypeData = typeResp
        if (!Array.isArray(companyTypeData)) {
            companyTypeData = [companyTypeData]
        }
        companytypes.value = companyTypeData
            .map((item) => {
                if (item === null || item === undefined) return ''
                return String(item)
            })
            .filter((item) => item.trim() !== '')
        if (companytypes.value.length === 0) {
            console.warn('企业类型为空，使用默认值')
            companytypes.value = ['默认']
        }

        // 获取项目模式
        let modeResp = await http.request<any>('get', 'api/MPA/syscode/multiloginpage')
        multiloginpage.value = modeResp

        // 获取企业列表
        await getListData()

        // 获取项目列表
        await getLoginTitles()
    } catch (err) {
        alertx('初始化数据失败', err)
    } finally {
        loading.close()
    }
}

/** 获取企业列表 */
const getListData = async () => {
    loading.value = true
    try {
        let resp = await http.request<any>('get', 'api/MPA/systcompany/search', {
            params: {
                COMPANYCODE_LIKE: searchForm.companyCodeLike,
                COMPANYNAME_LIKE: searchForm.companyNameLike,
                PAGEINDEX: pagination.currentPage,
                PAGESIZE: pagination.pageSize,
                COMPANY_TYPE: searchForm.companyType,
            },
        })
        pagination.total = resp.Total
        companyList.value = resp.List
    } catch (ex) {
        alertx('获取企业列表失败', ex)
    } finally {
        loading.value = false
    }
}

/** 获取项目列表 */
const getLoginTitles = async () => {
    try {
        let resp = await http.request<any>('get', 'api/MPA/syscode/All')
        sysCodes.value = resp
            .map((item) => {
                if (!item) return null
                return {
                    SCode: String(item.SCode || ''),
                    SValue: String(item.SValue || ''),
                }
            })
            .filter((item) => item && item.SCode && item.SValue)
    } catch (ex) {
        alertx('获取项目列表失败', ex)
    }
}

/** 获取角色列表 */
const getRoleList = async () => {
    try {
        let resp = await http.request<any>('get', 'api/MPA/systrole/All')
        allRoles.value = resp.map((x) => {
            return {
                key: x.RoleCode,
                label: x.RoleName || x.roleName,
                disabled: false,
            }
        })
    } catch (err) {
        alertx('获取角色列表失败', err)
    }
}

/** 获取企业已有角色列表*/
const getCompanyRoleList = async (row) => {
    try {
        let resp = await http.request<any>('get', 'api/MPA/systrelcompanysrole/COMPANYCODE', {
            params: {
                COMPANYCODE: row.CompanyCode,
            },
        })
        // 处理响应数据
        const data = resp.data || resp || []
        const roleCodes = data
            .map((item) => {
                // 提取SuperRoleCode字段
                return item.SuperRoleCode
            })
            .filter((code) => code) // 过滤空值
        selectedRoles.value = roleCodes
    } catch (err) {
        alertx('获取企业角色列表失败', err)
        selectedRoles.value = []
    }
}

// --- 事件处理 ---
// 列表查询
const onSearch = () => {
    pagination.currentPage = 1
    getListData()
}

const onPageChange = (page: number) => {
    pagination.currentPage = page
    getListData()
}

const onSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    getListData()
}

// 新增
const onAdd = async () => {
    isEdit.value = false
    companyFormRef.value?.resetFields()
    await getRoleList()
    selectedRoles.value = []
    pageState.value = 'form'
}

// 编辑
const onEdit = async (row) => {
    isEdit.value = true
    Object.assign(formDataAddCompany, {
        companyCode: row.CompanyCode,
        companyName: row.CompanyName,
        shortName: row.ShortName,
        companyType: row.CompanyType,
        LOGINNAME: row.LOGINNAME,
        SUPERADMIN_PWD: row.SUPERADMIN_PWD,
        phoneNo: row.PhoneNo,
        expire: row.Expire,
        loginTitle: row.LoginTitle,
        enable: row.Enable,
    })
    await getRoleList()
    await getCompanyRoleList(row)
    pageState.value = 'form'
}

// 提交（新增或编辑）
const submitForm = async () => {
    companyFormRef.value?.validate(async (valid, errors) => {
        if (valid) {
            const req_title = isEdit.value ? '更新企业' : '创建企业'
            const loading = ElLoadingService({
                lock: true,
                text: `正在${req_title}……`,
                spinner: 'el-icon-loading',
                background: 'rgba(0,0,0,0.7)',
            })
            try {
                const method = isEdit.value ? 'put' : 'post'

                const resp = await http.request<any>(method, 'api/MPA/systcompany', {
                    data: formDataAddCompany,
                })
                console.log(resp)
                // 如果是新增，获取返回的企业代码
                const companyCode = isEdit.value ? formDataAddCompany.companyCode : resp.CompanyCode
                // 保存角色配置
                await saveCompanyRoles(companyCode)
                const msg = isEdit.value ? '编辑' : '新增'
                ElMessage.success(`${msg}成功！`)
                pageState.value = 'list'
                getListData()
            } catch (err) {
                alertx(`${req_title}失败`, err)
            } finally {
                loading.close()
            }
        } else {
            ElMessage.warning('请检查表单输入！')
        }
    })
}

/** 保存企业角色配置 */
const saveCompanyRoles = async (companyCode) => {
    const req_title = '保存角色配置'
    try {
        await http.request('put', 'api/MPA/systrelcompanysrole', {
            params: {
                COMPANYCODE: companyCode,
            },
            data: selectedRoles.value,
        })
        ElMessage.success('保存角色配置成功')
    } catch (err) {
        alertx(`${req_title}失败`, err)
    }
}

// 删除
const onDelete = (row) => {
    ElMessageBox.confirm(`确定删除企业「${row.CompanyName}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            const req_title = '删除企业'
            const loading = ElLoadingService({
                lock: true,
                text: `正在${req_title}……`,
                spinner: 'el-icon-loading',
                background: 'rgba(0,0,0,0.7)',
            })
            try {
                const resp = await http.request('delete', 'api/MPA/systcompany', {
                    params: {
                        COMPANYCODE: row.CompanyCode,
                    },
                })
                ElMessage.success('删除企业成功')
                getListData()
                pageState.value = 'list'
            } catch (err) {
                alertx(`${req_title}失败`, err)
            } finally {
                loading.close()
            }
        })
        .catch(() => {})
}

// 修改密码
const onEditAdminPwd = (row) => {
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    currentCompany.value = row
    pageState.value = 'password'
}

// 保存密码
const onSaveAdminPwd = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.warning('两次密码不一致')
        return
    }

    const req_title = '修改密码'
    const loading = ElLoadingService({
        lock: true,
        text: `正在${req_title}……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        const resp = await http.request('put', 'api/MPA/systcompany/admin-password', {
            data: {
                companycode: currentCompany.value.CompanyCode,
                newpassword: passwordForm.newPassword,
            },
        })
        ElMessage.success('修改密码成功')
        pageState.value = 'list'
    } catch (err) {
        alertx(`${req_title}失败`, err)
    } finally {
        loading.close()
    }
}
</script>

<style scoped></style>
