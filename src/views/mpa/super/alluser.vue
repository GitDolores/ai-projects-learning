<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { PureTableBar } from '@/components/RePureTableBar'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import Refresh from '~icons/ep/refresh'
import View from '~icons/ep/view'
import { http } from '@/utils/http'
import type { FormInstance } from 'element-plus'

defineOptions({ name: 'Xsuperalluser' })

// ============ 类型定义 ============
type UserType = {
    UserCode: string
    UserName: string
    LoginName: string
    Sex: string
    Expire: string
    Enable: string
    CompanyName: string
    CompanyEnable: string
    PhoneNo: string
    RoleNames: string
}

type MenuItem = {
    MenuCode: string
    MenuName: string
    MenuDesc: string
    disabled?: boolean
    children?: MenuItem[]
}

// ============ refs ============
const tableRef = ref()
const formRef = ref()
const menuTreeRef = ref()

// ============ 搜索 ============
const searchForm = reactive({ userNameLike: '' })
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

// ============ 表格 ============
const dataList = ref<UserType[]>([])

const columns: TableColumnList = [
    { type: 'index', label: '序号', width: 60 },
    { label: '用户名', prop: 'UserName', minWidth: 120 },
    { label: '登陆名', prop: 'LoginName', minWidth: 100 },
    { label: '性别', prop: 'Sex', width: 80 },
    { label: '有效期', prop: 'Expire', width: 160 },
    { label: '用户状态', prop: 'Enable', slot: 'Enable', width: 100 },
    { label: '企业', prop: 'CompanyName', minWidth: 120 },
    { label: '企业状态', prop: 'CompanyEnable', slot: 'CompanyEnable', width: 100 },
    { label: '电话', prop: 'PhoneNo', width: 120 },
    { label: '角色', prop: 'RoleNames', minWidth: 140 },
    { label: '操作', slot: 'operation', fixed: 'right', width: 120 },
]

const getList = async () => {
    loading.value = true
    try {
        const params: Record<string, any> = {
            pageSize: pagination.pageSize,
            pageIndex: pagination.currentPage,
        }
        if (searchForm.userNameLike) params.username_like = searchForm.userNameLike

        const resp: { List: UserType[]; Total: number } = await http.request('get', 'api/mpa/systuser/super/page/alluser', { params })
        dataList.value = resp.List || []
        pagination.total = resp.Total || 0
    } catch (ex: any) {
        alertx('获取列表失败', ex)
    } finally {
        loading.value = false
    }
}

// ============ 菜单树弹窗 ============
const menuDialogVisible = ref(false)
const menuTreeData = ref<MenuItem[]>([])
const menuCount = ref(0)
const currentUserCode = ref('')

const treeProps = {
    children: 'children',
    label: 'MenuName',
    disabled: () => true,
}

const onShowMenuTree = async (row: UserType) => {
    currentUserCode.value = row.UserCode
    menuCount.value = 0
    menuTreeData.value = []
    menuDialogVisible.value = true
    await getMenuTreeData()
    await getUserMenus(row.UserCode)
}

const getMenuTreeData = async () => {
    try {
        const resp = await http.request('get', 'api/mpa/systmenu/tree/menu', {
            params: { nottree: 'N' },
        })
        const setDisabled = (menus: MenuItem[]) => {
            if (menus) {
                for (const menu of menus) {
                    ;(menu as any).disabled = true
                    if (menu.children) {
                        setDisabled(menu.children)
                    }
                }
            }
        }
        setDisabled(resp as MenuItem[])
        menuTreeData.value = resp as MenuItem[]
    } catch (ex: any) {
        alertx('获取菜单树失败', ex)
    }
}

const getUserMenus = async (userCode: string) => {
    try {
        const resp = await http.request('get', 'api/mpa/systrelrolemenu/super/menuofuser', {
            params: { userCode },
        })
        menuCount.value = (resp as string[]).length
        await nextTick()
        if (menuTreeRef.value) {
            menuTreeRef.value.setCheckedKeys([])
            for (const menuCode of resp as string[]) {
                menuTreeRef.value.setChecked(menuCode, true, false)
            }
        }
    } catch (ex: any) {
        alertx('获取用户菜单失败', ex)
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
                label="用户名："
                prop="userNameLike"
            >
                <el-input
                    v-model="searchForm.userNameLike"
                    placeholder="请输入用户名"
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
            title="所有用户管理"
            :columns="columns"
            @refresh="onSearch"
        >
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
                    @page-size-change="handleSizeChange"
                    @page-current-change="handleCurrentChange"
                >
                    <template #Enable="{ row }">
                        <el-tag
                            :type="row.Enable === 'Y' ? 'success' : 'danger'"
                            disable-transitions
                        >
                            {{ row.Enable === 'Y' ? '可用' : '禁用' }}
                        </el-tag>
                    </template>
                    <template #CompanyEnable="{ row }">
                        <el-tag
                            :type="row.CompanyEnable === 'Y' ? 'success' : 'danger'"
                            disable-transitions
                        >
                            {{ row.CompanyEnable === 'Y' ? '可用' : '禁用' }}
                        </el-tag>
                    </template>
                    <template #operation="{ row }">
                        <el-button
                            class="reset-margin"
                            link
                            type="primary"
                            :size="size"
                            :icon="useRenderIcon(View)"
                            @click="onShowMenuTree(row)"
                        >
                            查看菜单
                        </el-button>
                    </template>
                </pure-table>
            </template>
        </PureTableBar>

        <!-- 菜单树弹窗 -->
        <el-dialog
            v-model="menuDialogVisible"
            title="菜单查看"
            class="edit-dialog"
            destroy-on-close
            :close-on-click-modal="false"
        >
            <div>用户拥有的菜单数量：{{ menuCount }}</div>
            <div style="margin: 5px; border: 1px solid gray">
                <el-tree
                    ref="menuTreeRef"
                    style="height: 400px; overflow-y: scroll"
                    :data="menuTreeData"
                    show-checkbox
                    node-key="MenuCode"
                    :props="treeProps"
                    default-expand-all
                >
                    <template #default="{ data }">
                        <span
                            class="custom-tree-node"
                            :title="data.MenuDesc"
                        >
                            {{ data.MenuName }}
                        </span>
                    </template>
                </el-tree>
            </div>
            <template #footer>
                <el-button @click="menuDialogVisible = false">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
    margin: 0;
}

:deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner) {
    background-color: red;
}

:deep(.el-checkbox__input.is-disabled.is-indeterminate .el-checkbox__inner) {
    background-color: red;
}
</style>