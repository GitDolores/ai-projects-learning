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
            <div v-show="pageState === 'list'" class="flex flex-col h-full">
                <div class="flex-shrink-0">
                    <el-form :inline="true">
                        <el-form-item label="权限代码~">
                            <el-input v-model="searchForm.funcCodeLike" />
                        </el-form-item>
                        <el-form-item label="权限名称~">
                            <el-input v-model="searchForm.funcNameLike" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :icon="Search" @click="onSearch">查询</el-button>
                            <el-button type="primary" @click="onAdd">新增权限</el-button>
                            <el-button type="primary" @click="onExport">导出</el-button>
                            <el-popover
                                placement="top-start"
                                title="导入权限json示例"
                                :width="400"
                                trigger="hover"
                                content='{
                                    "FuncCode": "USER_MANAGEMENT",
                                    "FuncName": "用户管理",
                                    "FuncDesc": "管理系统的用户信息，包括新增、修改、删除和查询用户功能",
                                    "Enable": "Y",
                                    "MsgTime": "2023-10-15T14:30:00Z"
                                    }'
                            >
                                <template #reference>
                                    <el-upload action="#" :before-upload="(file) => beforeUpload(file, 'func')" :show-file-list="false" style="display: inline-block; margin-left: 10px" accept=".json">
                                        <el-button type="primary">导入权限集合</el-button>
                                    </el-upload>
                                </template>
                            </el-popover>
                            <el-popover
                                placement="top-start"
                                title="导入权限接口json示例"
                                :width="400"
                                trigger="hover"
                                content='[
                                    {
                                        "ApiCode": "API_LOGIN",
                                        "FuncCode": "FUNC_LOGIN"
                                    },
                                    {
                                        "ApiCode": "API_LOGOUT",
                                        "FuncCode": "FUNC_LOGIN"
                                    }
                                    ]'
                            >
                                <template #reference>
                                    <el-upload action="#" :before-upload="(file) => beforeUpload(file, 'funcApi')" :show-file-list="false" style="display: inline-block; margin-left: 10px" accept=".json">
                                        <el-button type="primary">导入权限接口关系</el-button>
                                    </el-upload>
                                </template>
                            </el-popover>
                        </el-form-item>
                    </el-form>
                    <el-divider style="margin-top: 8px" />
                </div>
                <div class="flex-grow overflow-hidden">
                    <el-table :data="funcList" border fit height="100%" style="width: 100%" @selection-change="handleSelectionChange">
                        <el-table-column type="selection" width="30" align="center" />
                        <el-table-column label="权限代码" prop="FuncCode" />
                        <el-table-column label="权限名称" prop="FuncName" />
                        <el-table-column label="权限说明" prop="FuncDesc" min-width="100" />
                        <el-table-column label="状态" prop="Enable" min-width="55">
                            <template #default="scope">
                                <el-button :type="scope.row.Enable === 'Y' ? 'success' : 'danger'" plain>{{ scope.row.Enable === 'Y' ? '可用' : '禁用' }}</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="添加日期" prop="MsgTime" min-width="100" />
                        <el-table-column label="操作" min-width="100" fixed="right">
                            <template #default="scope">
                                <el-button link type="primary" @click="onEdit(scope.row)">编辑</el-button>
                                <el-button link type="primary" @click="onSetApi(scope.row)">接口权限</el-button>
                                <el-button link type="danger" @click="onDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="mt-4 flex justify-end">
                    <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 30, 50]" size="small" :background="true" layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" @size-change="onSizeChange" @current-change="onPageChange" />
                </div>
            </div>
            <div v-show="pageState === 'form'" class="p-6 bg-white place-self-center w-200 max-w-full">
                <h2 class="text-xl font-bold mb-6">
                    {{ isEdit ? '编辑权限' : '新增权限' }}
                </h2>
                <el-form ref="funcFormRef" :model="formDataAddFunc" :rules="formDataAddFuncRules" label-width="120px" label-position="right">
                    <el-form-item label="权限代码" prop="funcCode">
                        <el-input v-model="formDataAddFunc.funcCode" placeholder="请输入权限代码" :disabled="isEdit" style="text-transform: lowercase" />
                    </el-form-item>
                    <el-form-item label="权限名称" prop="funcName">
                        <el-input v-model="formDataAddFunc.funcName" placeholder="请输入权限名称" />
                    </el-form-item>
                    <el-form-item label="权限说明" prop="funcDesc">
                        <el-input v-model="formDataAddFunc.funcDesc" placeholder="请输入权限说明" />
                    </el-form-item>
                    <el-form-item label="状态" prop="enable">
                        <el-switch v-model="formDataAddFunc.enable" active-value="Y" inactive-value="N" active-text="启用" inactive-text="禁用" />
                    </el-form-item>
                    <el-form-item>
                        <span class="dialog-footer">
                            <el-button @click="pageState = 'list'">取消</el-button>
                            <el-button type="primary" @click="onSubmitAddFunc">确定</el-button>
                        </span>
                    </el-form-item>
                </el-form>
            </div>
            <div v-show="pageState === 'auth'" class="flex flex-col h-full">
                <div class="flex-shrink-0 mb-4">
                    <h2 class="text-xl font-bold">为权限「{{ currentAuthFunc.FuncName }}」配置接口</h2>
                </div>
                <!-- 已配置接口表格 -->
                <div class="flex-shrink-0 mb-2">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-base font-medium">已配置接口（{{ configuredApis.length }}）</span>
                        <el-button type="danger" :disabled="configuredSelection.length === 0" @click="handleRemoveApis"> 取消授权 </el-button>
                    </div>
                    <el-table ref="configuredTableRef" :data="configuredApis" border max-height="250" style="width: 100%" @selection-change="handleConfiguredSelectionChange" @row-click="handleConfiguredRowClick">
                        <el-table-column type="selection" width="40" align="center" />
                        <el-table-column label="接口代码" prop="apiCode" min-width="160" show-overflow-tooltip />
                        <el-table-column label="接口描述" prop="apiDesc" min-width="200" show-overflow-tooltip />
                    </el-table>
                </div>
                <!-- 可选接口表格（虚拟滚动） -->
                <div class="flex-1 flex flex-col overflow-hidden mb-4">
                    <div class="flex items-center justify-between mb-2 flex-shrink-0">
                        <span class="text-base font-medium">可选接口（{{ filteredAvailableApis.length }}）</span>
                        <div class="flex items-center gap-2">
                            <el-input v-model="availableSearch" placeholder="搜索接口代码或描述" clearable class="w-[240px]!" @keyup.enter="handleAvailableSearch" />
                            <el-button type="primary" :icon="Search" @click="handleAvailableSearch"> 搜索 </el-button>
                            <el-button type="primary" :disabled="availableSelection.length === 0" @click="handleAddApis"> 授权 </el-button>
                        </div>
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <vxe-table ref="availableTableRef" :data="filteredAvailableApis" border height="100%" :row-config="{ isHover: true }" :checkbox-config="{ checkMethod: checkRowSelectable }" @checkbox-change="handleAvailableSelectionChange" @checkbox-all="handleAvailableSelectionChange" @row-click="handleAvailableRowClick">
                            <vxe-column type="checkbox" width="40" align="center" />
                            <vxe-column field="apiCode" title="接口代码" min-width="160" show-overflow />
                            <vxe-column field="apiDesc" title="接口描述" min-width="200" show-overflow />
                        </vxe-table>
                    </div>
                </div>
                <!-- 底部按钮 -->
                <div class="flex-shrink-0 text-center pt-2 border-t border-gray-200">
                    <el-button @click="pageState = 'list'">返回</el-button>
                    <el-button type="primary" :loading="authSubmitLoading" @click="onAuthSubmit">确认提交</el-button>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, ElLoadingService, ElForm, FormItemRule } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { http } from '@/utils/http'
import { Arrayable } from '@pureadmin/utils'
import JSON5 from 'json5'

defineOptions({
    name: 'Xsuperfunc',
})

// 组件挂载时加载初始数据
onMounted(() => {
    getListData()
})

// --- 状态管理 ---
type PageState = 'list' | 'form' | 'auth'
type ImportType = 'func' | 'funcApi'
const pageState = ref<PageState>('list') // 当前界面状态

// --- 添加watch监听 ---
watch(
    () => pageState.value,
    (newVal, oldVal) => {
        if (oldVal === 'auth') {
            // 离开表单页面时重置相关状态
            configuredApiCodes.value = []
            availableSearch.value = ''
            configuredSelection.value = []
            availableSelection.value = []
            allApiList.value = []
        }
    },
)

// 表格数据和分页
const loading = ref(true)
const funcList = ref([])
const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
})

// 查询表单
const searchForm = reactive({
    funcCodeLike: '',
    funcNameLike: '',
})

// 新增/编辑表单
const funcFormRef = ref<InstanceType<typeof ElForm>>()
const isEdit = ref(false)
const formDataAddFunc = ref({
    funcCode: '',
    funcName: '',
    funcDesc: '',
    enable: 'Y',
})
const formDataAddFuncRules = ref<Partial<Record<string, Arrayable<FormItemRule>>>>({
    funcCode: [
        { required: true, message: '请输入权限代码', trigger: 'blur' },
        // { pattern: /^[a-z:\-0-9]{3,}$/, message: '必须是小写字母、数字、冒号、减号的不小于3位的组合', trigger: 'blur' },
    ],
    funcName: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
    enable: [{ required: true, message: '请选择状态', trigger: 'change' }],
})

// 授权相关
const currentAuthFunc = ref({ FuncName: '', FuncCode: '' })

// 所有接口原始列表
type ApiItem = { apiCode: string; apiDesc: string }
const allApiList = ref<ApiItem[]>([])

// 已配置接口代码集合（核心数据源，提交时使用）
const configuredApiCodes = ref<string[]>([])

// 已配置接口表格引用 & 选中
const configuredTableRef = ref()
const configuredSelection = ref<ApiItem[]>([])

// 可选接口搜索 & 选中
const availableSearch = ref('')
const availableTableRef = ref()
const availableSelection = ref<ApiItem[]>([])

// 提交loading
const authSubmitLoading = ref(false)

// 已配置接口列表（从 allApiList 中筛选出 configuredApiCodes 对应的 item）
const configuredApis = computed<ApiItem[]>(() => {
    return allApiList.value.filter((api) => configuredApiCodes.value.includes(api.apiCode))
})

// 可选接口：allApiList 中排除已配置的，且支持搜索过滤
const filteredAvailableApis = computed<ApiItem[]>(() => {
    const keyword = (availableSearch.value || '').toLowerCase().trim()
    return allApiList.value.filter((api) => {
        if (configuredApiCodes.value.includes(api.apiCode)) return false
        if (!keyword) return true
        return (api.apiCode || '').toLowerCase().includes(keyword) || (api.apiDesc || '').toLowerCase().includes(keyword)
    })
})

// vxe-table 行是否可选（已配置的不可选，但 filteredAvailableApis 已经排除了）
const checkRowSelectable = () => true

// 已配置表格选择变化
const handleConfiguredSelectionChange = (rows: ApiItem[]) => {
    configuredSelection.value = rows
}

// 点击行切换选中
const handleConfiguredRowClick = (row: ApiItem) => {
    configuredTableRef.value?.toggleRowSelection(row)
}

// 搜索按钮点击 / 回车触发（筛选已通过 computed 实时生效，此处仅用于清除 vxe-table 选中状态）
const handleAvailableSearch = () => {
    availableSelection.value = []
    availableTableRef.value?.clearCheckboxRow()
}

// 可用接口表格选择变化
const handleAvailableSelectionChange = ({ records }: { records: ApiItem[] }) => {
    availableSelection.value = records
}

// 点击行切换选中
const handleAvailableRowClick = ({ row }: { row: ApiItem }) => {
    availableTableRef.value?.toggleCheckboxRow(row)
}

// 取消授权：将选中的已配置接口移除
const handleRemoveApis = () => {
    const codesToRemove = configuredSelection.value.map((api) => api.apiCode)
    configuredApiCodes.value = configuredApiCodes.value.filter((code) => !codesToRemove.includes(code))
    configuredSelection.value = []
    availableTableRef.value?.clearCheckboxRow()
    ElMessage.success('已取消授权')
}

// 授权：将选中的可选接口添加到已配置
const handleAddApis = () => {
    const codesToAdd = availableSelection.value.map((api) => api.apiCode)
    // 去重
    const newCodes = codesToAdd.filter((code) => !configuredApiCodes.value.includes(code))
    configuredApiCodes.value = [...configuredApiCodes.value, ...newCodes]
    availableSelection.value = []
    availableTableRef.value?.clearCheckboxRow()
    ElMessage.success('已添加授权')
}

// 原有的引用（保留兼容，不再使用但保留定义）
const multipleSelection = ref([])

// --- 数据获取与操作函数 ---

/** 获取权限列表数据 */
const getListData = async () => {
    try {
        loading.value = true
        let resp = await http.request<any>('get', 'api/mpa/rbac/func/page', {
            params: {
                func_code_like: searchForm.funcCodeLike,
                func_name_like: searchForm.funcNameLike,
                pageindex: pagination.currentPage,
                pagesize: pagination.pageSize,
            },
        })
        pagination.total = resp.Total || resp.data?.Total || 0
        funcList.value = resp.List || resp.data?.List || []
    } catch (ex) {
        alertx('获取权限列表失败', ex)
    } finally {
        loading.value = false
    }
}

/** 获取所有接口数据 */
const getAllApis = async () => {
    const req_title = '获取接口列表'
    const loading = ElLoadingService({
        lock: true,
        text: `正在${req_title}……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        const resp = await http.request<Array<any>>('get', 'api/MPA/systapi/GROUP', {
            params: {
                APIGROUP: 'jwt-func',
            },
        })
        allApiList.value = resp.map((x) => ({
            apiCode: x.ApiCode || x.APICODE,
            apiDesc: x.ApiDesc || x.APIDESC,
        }))
    } catch (err) {
        alertx(`${req_title}-失败`, err)
    } finally {
        loading.close()
    }
}

/** 获取权限已配置的接口 */
const getFuncApis = async (funcCode: string) => {
    const req_title = '获取权限已有接口'
    const loading = ElLoadingService({
        lock: true,
        text: `正在${req_title}……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        const resp = await http.request<string[]>('get', 'api/mpa/rbac/func/func/apicodes', {
            params: {
                func_code: funcCode,
            },
        })
        configuredApiCodes.value = resp || []
    } catch (err) {
        alertx(`${req_title}-失败`, err)
    } finally {
        loading.close()
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
const onAdd = () => {
    isEdit.value = false
    funcFormRef.value?.resetFields()
    pageState.value = 'form'
}

// 编辑
const onEdit = (row) => {
    isEdit.value = true
    // 转换后端字段为前端小驼峰
    formDataAddFunc.value.funcCode = row.FuncCode
    formDataAddFunc.value.funcName = row.FuncName
    formDataAddFunc.value.funcDesc = row.FuncDesc || ''
    formDataAddFunc.value.enable = row.Enable || 'N'
    pageState.value = 'form'
}

// 提交（新增或编辑）
const onSubmitAddFunc = async () => {
    funcFormRef.value?.validate(async (valid, errors) => {
        if (valid) {
            const req_title = '保存权限'
            const loading = ElLoadingService({
                lock: true,
                text: `正在${req_title}……`,
                spinner: 'el-icon-loading',
                background: 'rgba(0,0,0,0.7)',
            })
            try {
                // 转换前端字段为后端命名
                const requestData = {
                    FuncCode: formDataAddFunc.value.funcCode,
                    FuncName: formDataAddFunc.value.funcName,
                    FuncDesc: formDataAddFunc.value.funcDesc,
                    Enable: formDataAddFunc.value.enable,
                }

                const resp = await http.request('put', 'api/mpa/rbac/func', {
                    data: requestData,
                })
                ElMessage.success('保存权限成功')
                const msg = isEdit.value ? '编辑' : '新增'
                ElMessage.success(`${msg}成功！`)
                pageState.value = 'list'
                getListData() // 刷新列表
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

// 删除
const onDelete = (row) => {
    ElMessageBox.confirm(`确定删除权限「${row.FuncName}」吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            const req_title = '删除权限'
            const loading = ElLoadingService({
                lock: true,
                text: `正在${req_title}……`,
                spinner: 'el-icon-loading',
                background: 'rgba(0,0,0,0.7)',
            })
            try {
                const resp = await http.request('delete', 'api/mpa/rbac/func', {
                    params: {
                        func_code: row.FuncCode,
                    },
                })
                ElMessage.success('删除权限成功')
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

// 配置接口
const onSetApi = async (row) => {
    currentAuthFunc.value = row
    // 1. 获取所有接口
    await getAllApis()
    // 2. 获取该权限已有的接口
    await getFuncApis(row.FuncCode)
    pageState.value = 'auth'
}

// 提交接口配置
const onAuthSubmit = async () => {
    const req_title = '保存接口配置'
    authSubmitLoading.value = true
    const loading = ElLoadingService({
        lock: true,
        text: `正在${req_title}……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        await http.request('put', 'api/mpa/rbac/func/func/apicodes', {
            params: {
                func_code: currentAuthFunc.value.FuncCode,
            },
            data: configuredApiCodes.value,
        })
        ElMessage.success('接口配置保存成功！')
        pageState.value = 'list'
    } catch (err) {
        alertx(`${req_title}-失败`, err)
    } finally {
        loading.close()
        authSubmitLoading.value = false
    }
}

// 导出
const onExport = async () => {
    if (multipleSelection.value.length === 0) {
        ElMessage.warning('请勾选需要导出的数据！')
        return
    }
    // const funcCodes = multipleSelection.value.map((item) => item.FuncCode)
    // const req_title = '导出权限'
    // const loading = ElLoadingService({
    //     lock: true,
    //     text: `正在${req_title}……`,
    //     spinner: 'el-icon-loading',
    //     background: 'rgba(0,0,0,0.7)',
    // })
    // try {
    //     const resp = await http.request('post', 'api/MPA/rbac/func/export', {
    //         data: funcCodes,
    //         responseType: 'blob',
    //     })
    //     // 处理文件下载
    //     const disposition = resp.headers?.['content-disposition']
    //     let fileName = '权限导出数据.json'
    //     if (disposition && disposition.includes('filename*=')) {
    //         const match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
    //         if (match && match[1]) {
    //             fileName = decodeURIComponent(match[1].trim())
    //         }
    //     }
    //     const blob = new Blob([resp.data], { type: 'application/json' })
    //     const downloadUrl = window.URL.createObjectURL(blob)
    //     const link = document.createElement('a')
    //     link.href = downloadUrl
    //     link.download = fileName
    //     document.body.appendChild(link)
    //     link.click()
    //     window.URL.revokeObjectURL(downloadUrl)
    //     document.body.removeChild(link)
    //     ElMessage.success('导出成功！')
    // } catch (err) {
    //     alertx(`${req_title}失败`, err)
    // } finally {
    //     loading.close()
    // }
}

// 导入
const beforeUpload = async (file: File, importType: ImportType) => {
    const isJSON = file.type === 'application/json'
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isJSON) {
        ElMessage.error('只能上传JSON格式文件!')
        return false
    }
    if (!isLt10M) {
        ElMessage.error('文件大小不能超过10MB!')
        return false
    }

    const isValid = await validateImportFile(file, importType)
    if (!isValid) {
        return false
    }

    const importConfig = {
        func: {
            title: '导入权限集合',
            apiUrl: 'api/MPA/rbac/func/import/formdata/json',
        },
        funcApi: {
            title: '导入权限接口关系',
            apiUrl: 'api/MPA/rbac/func/api/import/formdata/json',
        },
    }
    const config = importConfig[importType]

    const loading = ElLoadingService({
        lock: true,
        text: `正在${config.title}……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        const fileContent = await readFileContent(file)
        const originalData = JSON5.parse(fileContent)

        // 如果是权限集合导入，处理默认值
        let processedData = originalData
        if (importType === 'func') {
            processedData = processFuncData(originalData)
        }

        const processedBlob = new Blob([JSON.stringify(processedData)], {
            type: 'application/json',
        })
        const processedFile = new File([processedBlob], file.name, {
            type: 'application/json',
        })

        const formData = new FormData()
        formData.append('file', processedFile)

        await http.request('post', config.apiUrl, {
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        ElMessage.success('导入成功')
        getListData()
    } catch (err) {
        alertx(`${config.title}失败`, err)
    } finally {
        loading.close()
    }
    return false // 阻止默认上传
}

// 前端预检查文件
const validateImportFile = (file: File, importType: 'func' | 'funcApi'): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const data = JSON5.parse(content)

                if (!Array.isArray(data)) {
                    ElMessage.error('JSON必须是数组格式')
                    resolve(false)
                    return
                }

                if (data.length === 0) {
                    ElMessage.error('文件数据为空')
                    resolve(false)
                    return
                }

                const firstItem = data[0]
                if (importType === 'func') {
                    if (!firstItem.FuncCode || !firstItem.FuncName || !firstItem.Enable) {
                        ElMessage.error('文件缺少必需字段：FuncCode 或 FuncName 或 Enable')
                        resolve(false)
                        return
                    }
                } else {
                    if (!firstItem.ApiCode || !firstItem.FuncCode) {
                        ElMessage.error('文件缺少必需字段：ApiCode 或 FuncCode')
                        resolve(false)
                        return
                    }
                }
                resolve(true)
            } catch (err) {
                ElMessage.error('JSON文件格式错误')
                resolve(false)
            }
        }
        reader.onerror = () => {
            ElMessage.error('文件读取失败')
            resolve(false)
        }
        reader.readAsText(file)
    })
}

// 读取文件内容
const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = (e) => reject(new Error('文件读取失败'))
        reader.readAsText(file)
    })
}

// 处理权限数据，设置默认值
const processFuncData = (data: any[]): any[] => {
    const now = new Date()
    const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
    const chinaTimeString = chinaTime.toISOString()

    return data.map((item) => ({
        FuncCode: item.FuncCode,
        FuncName: item.FuncName,
        FuncDesc: item.FuncDesc || '', // 如果没有描述，设为空字符串
        Enable: item.Enable,
        MsgTime: item.MsgTime || chinaTimeString, // 如果没有时间，设为当前时间
    }))
}

// 多选变化
const handleSelectionChange = (val: any[]) => {
    multipleSelection.value = val
}
</script>

<style scoped>
:deep(.vxe-table--render-default .vxe-body--column) {
    cursor: pointer;
}
</style>
