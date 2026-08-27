<template>
    <div class="main main-content">
        <el-card shadow="never" :body-style="{ height: 'calc(100vh - 160px)' }">
            <div v-show="pageState === 'list'">
                <el-table :data="serviceList">
                    <el-table-column prop="SvcName" label="服务名称" width="160" />
                    <el-table-column prop="SvcCode" label="服务代码" width="160" />
                    <el-table-column prop="BasePath" label="BasePath" />
                    <el-table-column prop="SvcOpenApiUri" label="SvcOpenApiUri" />
                    <el-table-column prop="SvcDesc" label="服务描述" width="200" />
                </el-table>
                <el-divider style="margin-top: 8px" />
                <el-form :inline="true">
                    <el-form-item>
                        <el-button class="filter-item" type="primary" @click="handleFilter"> 1.从后台服务生成接口 </el-button>
                        <el-button class="filter-item" style="margin-left: 10px" type="primary" :disabled="apiFailure" @click="handleCreate"> 2.保存下面的接口至服务器 </el-button>
                        <span class="smile ml-4">
                            <el-tag>.net api is ok</el-tag>
                            <el-tag v-show="jpistatus === 'Y'" class="ml-2">java api is ok</el-tag>
                            <el-tag v-show="jpistatus !== 'Y'" type="danger" class="ml-2">java api is not ok</el-tag>
                        </span>
                    </el-form-item>
                </el-form>
                <el-divider style="margin-top: 8px" />
                <el-table :key="tableKey" v-loading="listLoading" :data="apiList" border fit height="calc(100vh - 280px)" highlight-current-row>
                    <el-table-column label="接口名称" prop="APICODE" align="left" width="500" />
                    <el-table-column label="分组" prop="APIGROUP" align="left" width="100" />
                    <el-table-column label="描述" prop="APIDESC" align="left" />
                    <el-table-column label="服务名称" prop="SYSCODE" align="left" />
                </el-table>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElLoadingService, ElMessage } from 'element-plus'
import { http } from '@/utils/http'

defineOptions({
    name: 'Xsuperapis',
})

// 定义枚举
enum E_States {
    Y = 'Y',
    N = 'N',
}

// 定义响应接口
interface MsgResult {
    state: E_States
    msg: string
}
interface ServiceItem {
    ApiCode: string
    ApiDesc: string
    SysCode: string
    BasePath: string
    ApiType: string
    SvcOpenApiUri: string
    SvcName: string
}
// --- 状态管理 ---
type PageState = 'list'
const pageState = ref<PageState>('list') // 当前界面状态
const serviceList = ref<ServiceItem[]>([])
const tableKey = ref(0)
const listLoading = ref(true)
const apiList = ref<any[]>([])
const apiFailure = ref(true)

// 查询表单
const searchForm = reactive({
    SPNAME_LIKE: '',
})

// 环境变量
const jpiurl = String(import.meta.env.VITE_BASE_URL_JPI)
const apipcode = String(import.meta.env.VITE_API_PROJECT_CODE)
const jpipcode = String(import.meta.env.VITE_JPI_PROJECT_CODE)

// 计算属性
const jpistatus = computed(() => {
    return jpiurl == null || jpiurl === '' ? 'N' : 'Y'
})

// --- 数据获取与操作函数 ---

/** 获取.NET接口数据 */
const getApis = async (swaggerjsonurl: string, apigroup: string, nl: string | null, arr: any[], syscode: string, basepath: string) => {
    try {
        const resp = await http.request<any>('get', swaggerjsonurl, {
            allowAbsoluteUrls: true,
        })

        // 检查响应数据结构
        if (!resp || !resp.paths) {
            console.warn(`Swagger响应数据格式异常，URL: ${swaggerjsonurl}`, resp)
            return
        }

        for (const p in resp.paths) {
            for (const m in resp.paths[p]) {
                const c = (m ?? '').toUpperCase() + ':' + (basepath ?? '').toUpperCase() + (p ?? '').toUpperCase()
                if (c != null && nl != null) {
                    if (!c.indexOf(nl)) {
                        continue
                    }
                }
                arr.push({
                    APICODE: c,
                    APIDESC: resp.paths[p][m]?.summary || '',
                    APIGROUP: apigroup,
                    SYSCODE: syscode,
                })
            }
        }
    } catch (error) {
        console.error(`获取.NET接口失败，URL: ${swaggerjsonurl}`, error)
        throw error
    }
}
const getServiceList = async () => {
    const req_title = '获取服务清单'
    const loading = ElLoadingService({
        lock: true,
        text: `正在${req_title}……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        const resp = await http.request<any>('get', 'api/mpa/service/list')
        serviceList.value = resp
        if (serviceList.value.length > 0) {
            getListData()
        }
    } catch (err) {
        alertx(`${req_title}-失败`, err)
    } finally {
        loading.close()
    }
}
/** 获取接口列表 */
const getListData = async () => {
    try {
        listLoading.value = true
        let nl = null

        if (searchForm.SPNAME_LIKE != null && searchForm.SPNAME_LIKE.length > 0) {
            nl = searchForm.SPNAME_LIKE.toUpperCase()
        }
        console.log('fetch ApiList', serviceList.value)
        const a: any[] = []
        if (serviceList.value.length === 0) return
        for (const serv of serviceList.value) {
            await getApis(serv.SvcOpenApiUri, serv.ApiType, nl, a, apipcode, serv.BasePath)
        }

        apiList.value = a
        apiFailure.value = false
        tableKey.value += 1 // 强制表格重新渲染
    } catch (error) {
        console.error('获取接口列表失败:', error)
        apiFailure.value = true
        alertx('获取Api数据失败', error)
    } finally {
        listLoading.value = false
    }
}

/** 保存接口到服务器 */
const handleCreate = async () => {
    const req_title = '保存接口至服务器'
    try {
        const resp = await http.request<MsgResult>('post', 'api/MPA/systapi', {
            data: apiList.value,
            timeout: 120000,
        })
        ElMessage.success(resp.msg || '接口保存成功')
    } catch (error) {
        alertx(`${req_title}失败`, error)
    }
}

// --- 事件处理 ---

/** 从后台服务生成接口 */
const handleFilter = () => {
    getListData()
}

// 工具函数
const alertx = (title: string, err: any) => {
    console.error(title, err)
    ElMessage.error(`${title}: ${err.message || err}`)
}

// 组件挂载时加载初始数据
onMounted(() => {
    getServiceList()
})
watch(serviceList, (newVal) => {
    if (newVal.length > 0) {
        getListData()
    }
})
</script>

<style scoped>
.filter-item {
    margin-right: 10px;
}

.smile {
    display: inline-flex;
    align-items: center;
}

.ml-2 {
    margin-left: 8px;
}

.ml-4 {
    margin-left: 16px;
}
</style>
