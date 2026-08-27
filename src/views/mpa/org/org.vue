<template>
    <div class="main-content main">
        <el-card shadow="never" :body-style="{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }">
            <!-- 列表页面 -->
            <div v-show="pageState === 'list'" class="flex flex-col h-full">
                <div class="flex-shrink-0">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-button type="primary" :icon="Search" @click="onSearch">刷新</el-button>
                            <el-button type="primary" @click="handleAddMainOrg">添加一级组织</el-button>
                            <el-button v-show="nowSelectedRow != null" type="primary" @click="handleSetOrgAsZeroLevel">设为一级组织</el-button>
                        </el-form-item>
                    </el-form>
                    <el-divider style="margin-top: 8px" />
                </div>
                <div class="flex-grow overflow-hidden">
                    <!-- 左侧组织树表格 -->
                    <div class="flex h-full">
                        <div class="w-1/2 border-r pr-4">
                            <el-table highlight-current-row :data="orgs" row-key="UnitId" border fit :row-class-name="orgRowStyle" :tree-props="{ children: 'children' }" height="100%" style="width: 100%" @current-change="selectedRow">
                                <el-table-column min-width="170px" prop="UName" label="组织名称" show-overflow-tooltip />
                                <el-table-column min-width="100px" prop="T_UTYPE" label="组织类型" />
                                <el-table-column min-width="230px" label="操作" fixed="right">
                                    <template #default="scope">
                                        <el-button size="small" type="success" @click="handleAddSubOrg(scope.row as OrgItem)"> 添加子组织 </el-button>
                                        <el-button size="small" type="primary" @click="handleUpdate(scope.row as OrgItem)"> 编辑 </el-button>
                                        <el-button size="small" type="warning" @click="handleDelete(scope.row as OrgItem)"> 删除 </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>

                        <!-- 右侧用户信息 -->
                        <div v-if="nowSelectedRow != null" class="w-1/2 pl-4">
                            <el-card shadow="never" class="h-full">
                                <div class="mb-4">
                                    <el-form>
                                        <el-form-item label="组织名称">
                                            <span class="text-xl font-bold text-purple-600">
                                                {{ nowSelectedRow.UName }}
                                            </span>
                                        </el-form-item>
                                    </el-form>
                                    <div class="flex gap-2 mt-2">
                                        <el-button size="small" type="danger" @click="handleChangeParent"> 修改上级 </el-button>
                                        <el-button size="small" type="success" @click="loadOrgUsers"> 刷新用户 </el-button>
                                        <el-button size="small" type="primary" @click="addUser"> 添加用户 </el-button>
                                    </div>
                                </div>
                                <div class="flex-grow overflow-hidden">
                                    <el-table fit :data="users" border stripe height="100%" style="width: 100%">
                                        <el-table-column width="120px" prop="USERNAME" label="用户名" />
                                        <el-table-column prop="LOGINNAME" label="登陆名" />
                                        <el-table-column prop="POSITIONNAME" label="职位" />
                                        <el-table-column label="操作" width="100" fixed="right">
                                            <template #default="scope">
                                                <el-button size="small" @click="deleteUser(scope.row as User)"> 移出组织 </el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                            </el-card>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 组织表单对话框 -->
            <el-dialog v-model="dialogFormVisible" :title="dialogStatus === 'create' ? '创建组织' : '编辑组织'" :close-on-click-modal="false">
                <el-form ref="orgFormRef" :rules="orgRules" :model="orgForm" label-position="left" label-width="100px">
                    <el-form-item :label="'状态'">
                        <span v-show="!parentName">正在添加一级组织机构。</span>
                        <span v-show="parentName">正在为【{{ parentName }}】添加子组织机构。</span>
                    </el-form-item>
                    <el-form-item label="组织名称" prop="UName">
                        <el-input v-model="orgForm.UName" class="full-width-input" @keypress.enter="dialogStatus === 'create' ? createData() : updateData()" />
                    </el-form-item>
                    <el-form-item label="组织类型" prop="UType">
                        <el-select v-model="orgForm.UType" filterable placeholder="请选择组织类型" class="full-width-input">
                            <el-option v-for="item in orgTypes" :key="item.Code" :label="item.Name" :value="item.Code" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
                        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()"> 确定 </el-button>
                    </div>
                </template>
            </el-dialog>

            <!-- 添加用户对话框 -->
            <el-dialog v-model="dialogUserVisible" title="新增用户" :close-on-click-modal="false">
                <el-form ref="userFormRef" :model="userForm" label-position="left" label-width="100px">
                    <el-form-item :label="'状态'">
                        <span>正在为【{{ nowSelectedRow ? nowSelectedRow.UName : '' }}】添加成员。</span>
                    </el-form-item>
                    <el-form-item label="用户" prop="userCode">
                        <el-select v-model="userForm.userCode" filterable placeholder="请选择用户" class="full-width-input">
                            <el-option v-for="item in allUsers" :key="item.UserCode" :label="item.UserName" :value="item.UserCode">
                                <span>{{ item.UserName }}-{{ item.LoginName }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="职位" prop="positionId">
                        <el-select v-model="userForm.positionId" filterable placeholder="请选择职位" class="full-width-input">
                            <el-option v-for="item in positions" :key="item.PositionId" :label="item.PositionName" :value="item.PositionId">
                                <span>{{ item.Level }}-{{ item.PositionName }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="dialogUserVisible = false"> 取消 </el-button>
                        <el-button type="primary" @click="createUser"> 确定 </el-button>
                    </div>
                </template>
            </el-dialog>

            <!-- 修改上级对话框 -->
            <el-dialog v-model="changeParentVisible" title="修改上级" :close-on-click-modal="false" width="800px">
                <el-form label-position="left" label-width="100px">
                    <el-form-item label="当前组织">
                        <span class="text-xl font-bold text-purple-600">
                            {{ nowSelectedRow ? nowSelectedRow.UName : '' }}
                        </span>
                    </el-form-item>
                </el-form>
                <div class="overflow-auto" style="max-height: 300px">
                    <el-table highlight-current-row :data="orgs" row-key="UnitId" border fit :row-class-name="orgRowStyle" :tree-props="{ children: 'children' }">
                        <el-table-column min-width="170px" prop="UName" label="组织名称" show-overflow-tooltip />
                        <el-table-column min-width="100px" prop="T_UTYPE" label="组织类型" />
                        <el-table-column min-width="260px" label="操作">
                            <template #default="scope">
                                <el-button type="success" @click="changeAsParent(scope.row as OrgItem)"> 选择 </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="changeParentVisible = false"> 取消 </el-button>
                    </div>
                </template>
            </el-dialog>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElLoadingService, ElForm, FormItemRule } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { http } from '@/utils/http'
import { Arrayable } from '@pureadmin/utils'

interface OrgType {
    Code: string
    Name: string
    Enable?: string | null
}

interface Position {
    PositionId: string
    PositionCode: string
    PositionName: string
    Level: number
    Remark: string
    CompanyCode: string
    MsgTime: string
}

interface User {
    UserCode: string
    UserName: string
    LoginName: string
    PositionName?: string
    PositionId?: string
    USERCODE?: string
    USERNAME?: string
    LOGINNAME?: string
    POSITIONID?: string
    POSITIONNAME?: string
}

interface OrgItem {
    UnitId: string
    UName: string
    UType: string
    ParentId: string | null
    CompanyCode: string
    Level: number
    T_UTYPE: string
    children: OrgItem[]
    PARENTNAME?: string
}

interface OrgForm {
    UnitId: string
    UName: string
    UType: string | null
    ParentId: string | null
    CompanyCode: string
}

interface UserForm {
    userCode: string | null
    positionId: string | null
}

defineOptions({
    name: 'Xorgorg',
})

// 组件挂载时加载初始数据
onMounted(() => {
    loadOrgInfos()
    loadPositions()
    loadAllUsers()
    loadOrgTypes()
})

// --- 状态管理 ---
type PageState = 'list' | 'form'
const pageState = ref<PageState>('list')

// 组织数据
const orgs = ref<OrgItem[]>([])
const nowSelectedRow = ref<OrgItem | null>(null)
const users = ref<User[]>([])
const allUsers = ref<User[]>([])
const positions = ref<Position[]>([])
const orgTypes = ref<OrgType[]>([])

// 对话框状态
const dialogFormVisible = ref(false)
const dialogUserVisible = ref(false)
const changeParentVisible = ref(false)
const dialogStatus = ref<'create' | 'update'>('create')

// 表单数据
const orgForm = reactive<OrgForm>({
    UnitId: '',
    UName: '',
    UType: null,
    ParentId: null,
    CompanyCode: 'SUPER',
})

const userForm = reactive<UserForm>({
    userCode: null,
    positionId: null,
})

const parentName = ref<string>('')

// 表单引用
const orgFormRef = ref<InstanceType<typeof ElForm>>()
const userFormRef = ref<InstanceType<typeof ElForm>>()

// 表单验证规则
const orgRules = ref<Partial<Record<string, Arrayable<FormItemRule>>>>({
    UName: [
        {
            required: true,
            message: '请输入组织机构名称',
            trigger: 'blur',
        },
    ],
    UType: [
        {
            required: true,
            message: '请输入组织机构类型',
            trigger: 'blur',
        },
    ],
})

// --- 数据获取与操作函数 ---

/** 获取组织列表 */
const loadOrgInfos = async () => {
    const loading = ElLoadingService({
        lock: true,
        text: '正在加载组织信息……',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        const resp = await http.request<any>('get', 'api/MPA/orgtunit')
        orgs.value = resp
    } catch (err) {
        alertx('获取组织数据失败', err)
    } finally {
        loading.close()
    }
}

/** 获取职位列表 */
const loadPositions = async () => {
    try {
        const resp = await http.request<any>('get', 'api/MPA/orgtunitposition')
        positions.value = resp
    } catch (err) {
        alertx('获取职位信息失败', err)
    }
}

/** 获取所有用户 */
const loadAllUsers = async () => {
    try {
        const resp = await http.request<any>('get', 'api/MPA/systuser')
        allUsers.value = resp
    } catch (err) {
        alertx('获取用户信息失败', err)
    }
}

/** 获取组织类型 */
const loadOrgTypes = async () => {
    try {
        const resp = await http.request<any>('get', 'api/MPA/orgtunittype')
        orgTypes.value = resp
    } catch (err) {
        alertx('获取组织类型失败', err)
    }
}

/** 获取组织用户 */
const loadOrgUsers = async () => {
    if (!nowSelectedRow.value) return

    try {
        const resp = await http.request<any>('get', 'api/MPA/orgtunit/orgusers', {
            params: { UNITID: nowSelectedRow.value.UnitId },
        })
        users.value = Array.isArray(resp) ? resp : []
    } catch (err) {
        console.error('获取组织用户信息失败:', err)
        alertx('获取组织用户信息失败', err)
    }
}

// --- 事件处理 ---

/** 刷新列表 */
const onSearch = () => {
    loadOrgInfos()
}

/** 选择行 */
const selectedRow = (currentRow: OrgItem | null) => {
    nowSelectedRow.value = currentRow
    if (currentRow) {
        loadOrgUsers()
    }
}

/** 组织行样式 */
const orgRowStyle = ({ row, rowIndex }: { row: OrgItem; rowIndex: number }) => {
    return 'color-' + row.Level
}

/** 添加一级组织 */
const handleAddMainOrg = () => {
    resetOrgForm()
    orgForm.ParentId = null
    dialogStatus.value = 'create'
    dialogFormVisible.value = true
    parentName.value = ''
    nextTick(() => {
        orgFormRef.value?.clearValidate()
    })
}

/** 添加子组织 */
const handleAddSubOrg = (row: OrgItem) => {
    resetOrgForm()
    orgForm.ParentId = row.UnitId
    dialogStatus.value = 'create'
    dialogFormVisible.value = true
    parentName.value = row.UName
    nextTick(() => {
        orgFormRef.value?.clearValidate()
    })
}

/** 编辑组织 */
const handleUpdate = (row: OrgItem) => {
    Object.assign(orgForm, {
        UnitId: row.UnitId,
        UName: row.UName,
        UType: row.UType,
        ParentId: row.ParentId,
        CompanyCode: row.CompanyCode,
    })
    parentName.value = row.PARENTNAME || ''
    dialogStatus.value = 'update'
    dialogFormVisible.value = true
    nextTick(() => {
        orgFormRef.value?.clearValidate()
    })
}

/** 创建组织 */
const createData = async () => {
    orgFormRef.value?.validate(async (valid) => {
        if (!valid) return

        try {
            // 根据API返回的数据结构，发送正确的字段名
            const requestData = {
                UName: orgForm.UName,
                UType: orgForm.UType,
                ParentId: orgForm.ParentId,
                CompanyCode: orgForm.CompanyCode,
            }

            await http.request('post', 'api/MPA/orgtunit', {
                data: requestData,
            })
            ElMessage.success('保存成功')
            loadOrgInfos()
            dialogFormVisible.value = false
        } catch (err) {
            console.error('保存失败:', err)
            alertx('保存失败', err)
        }
    })
}

/** 更新组织 */
const updateData = async () => {
    orgFormRef.value?.validate(async (valid) => {
        if (!valid) return

        try {
            const requestData = {
                UnitId: orgForm.UnitId,
                UName: orgForm.UName,
                UType: orgForm.UType,
                ParentId: orgForm.ParentId,
                CompanyCode: orgForm.CompanyCode,
            }

            await http.request('put', 'api/MPA/orgtunit', {
                data: requestData,
            })
            ElMessage.success('修改成功')
            loadOrgInfos()
            dialogFormVisible.value = false
        } catch (err) {
            console.error('修改失败:', err)
            alertx('修改失败', err)
        }
    })
}

/** 删除组织 */
const handleDelete = (row: OrgItem) => {
    ElMessageBox.confirm('确定要删除该组织吗？删除之后将不可恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            try {
                await http.request('delete', 'api/MPA/orgtunit', {
                    params: { UNITID: row.UnitId },
                })
                ElMessage.success('删除成功')
                loadOrgInfos()
            } catch (err) {
                console.error('删除失败:', err)
                alertx('删除失败', err)
            }
        })
        .catch(() => {})
}

/** 设为一级组织 */
const handleSetOrgAsZeroLevel = async () => {
    if (!nowSelectedRow.value) return

    try {
        await http.request('put', 'api/MPA/orgtunit/set-parent-unit', {
            params: {
                unit_id: nowSelectedRow.value.UnitId,
                parent_id: null,
            },
        })
        ElMessage.success('保存成功')
        loadOrgInfos()
        nowSelectedRow.value = null
    } catch (err) {
        console.error('设为一级组织失败:', err)
        alertx('保存失败', err)
    }
}

/** 修改上级 */
const handleChangeParent = () => {
    changeParentVisible.value = true
}

/** 选择为上级 */
const changeAsParent = async (row: OrgItem) => {
    if (!nowSelectedRow.value) return

    try {
        await http.request('put', 'api/MPA/orgtunit/set-parent-unit', {
            params: {
                unit_id: nowSelectedRow.value.UnitId,
                parent_id: row.UnitId,
            },
        })
        ElMessage.success('保存成功')
        loadOrgInfos()
        nowSelectedRow.value = null
        changeParentVisible.value = false
    } catch (err) {
        console.error('修改上级失败:', err)
        alertx('保存失败', err)
    }
}

/** 添加用户 */
const addUser = () => {
    userForm.userCode = null
    userForm.positionId = null
    dialogUserVisible.value = true
}

/** 创建用户关联 */
const createUser = async () => {
    if (!userForm.positionId || !userForm.userCode) {
        ElMessage.warning('必须选择职位和用户')
        return
    }

    if (!nowSelectedRow.value) {
        ElMessage.warning('必须选中左侧某一个组织，再进行用户的添加')
        return
    }

    try {
        await http.request('post', 'api/MPA/orgtunit/usercodes', {
            params: {
                UNITID: nowSelectedRow.value.UnitId,
                POSITIONID: userForm.positionId,
            },
            data: [userForm.userCode],
        })
        ElMessage.success('添加成功')
        dialogUserVisible.value = false
        loadOrgUsers()
    } catch (err) {
        console.error('添加用户失败:', err)
        alertx('添加用户失败', err)
    }
}

/** 删除用户关联 */
const deleteUser = async (row: User) => {
    if (!nowSelectedRow.value) return

    try {
        const userCode = row.UserCode || row.USERCODE
        const positionId = row.POSITIONID

        if (!userCode) {
            ElMessage.warning('用户代码不能为空')
            return
        }

        await http.request('delete', 'api/MPA/orgtunit/usercodes', {
            params: {
                UNITID: nowSelectedRow.value.UnitId,
                USERCODE: userCode,
                POSITIONID: positionId,
            },
        })
        ElMessage.success('移出成功')
        loadOrgUsers()
    } catch (err) {
        console.error('移出用户失败:', err)
        alertx('移出用户失败', err)
    }
}

/** 重置组织表单 */
const resetOrgForm = () => {
    Object.assign(orgForm, {
        UnitId: '',
        UName: '',
        UType: null,
        ParentId: null,
        CompanyCode: 'SUPER',
    })
}
</script>

<style scoped>
/* 表格当前行高亮样式 */
:deep(.el-table__row.current-row > td.el-table__cell) {
    background-color: rgb(215, 231, 255);
    font-style: oblique;
    font-weight: 800;
}

.full-width-input {
    width: 100%;
}
</style>
