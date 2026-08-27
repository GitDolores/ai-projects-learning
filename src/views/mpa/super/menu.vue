<template>
    <div class="main main-content">
        <el-card shadow="never" :body-style="{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }">
            <div class="flex flex-col h-full">
                <!-- 工具栏 -->
                <div class="shrink-0 mb-3">
                    <div class="flex items-center gap-2 flex-wrap">
                        <el-button type="primary" :disabled="selectedMenus.length === 0" @click="onOpenSetFuncDialog"> 设定为权限的菜单 </el-button>
                        <el-button type="primary" @click="onImport">
                            <span class="inline-flex items-center gap-1"> <i class="ri/upload-2-line" /> 导入菜单 </span>
                        </el-button>
                        <el-button type="primary" :disabled="selectedMenus.length === 0" @click="onExport">
                            <span class="inline-flex items-center gap-1"> <i class="ri/download-2-line" /> 导出选中 </span>
                        </el-button>
                        <el-button type="success" @click="onExportAll">
                            <span class="inline-flex items-center gap-1"> <i class="ri/file-download-line" /> 导出全部 </span>
                        </el-button>
                        <el-button type="primary" @click="onAddRoot">新增顶级菜单</el-button>
                        <el-button type="primary" @click="loadTree">
                            <span class="inline-flex items-center">
                                <span>重新加载</span>
                            </span>
                        </el-button>
                        <span v-if="selectedMenus.length > 0" class="text-sm text-gray-500 ml-2"> 已选 {{ selectedMenus.length }} 个菜单 </span>
                    </div>
                    <div style="margin-top: 3px">
                        <el-card body-style="padding: 3px">
                            <span>权限：</span>
                            <el-select v-model="filterFuncCode" placeholder="按权限过滤" clearable size="default" style="width: 200px" @change="onFilterFuncChange"> <el-option v-for="f in allFuncs" :key="f.FuncCode" :label="`${f.FuncCode} - ${f.FuncName}`" :value="f.FuncCode" /> </el-select>
                        </el-card>
                    </div>
                </div>
                <!-- 树表格 -->
                <div class="grow overflow-hidden">
                    <el-table ref="tableRef" :indent="90" :data="treeData" row-key="MenuId" border fit height="100%" style="width: 100%" :tree-props="{ children: 'Children', hasChildren: 'hasChildren' }" :default-expand-all="false" @selection-change="handleSelectionChange" @row-click="handleRowClick">
                        <el-table-column type="selection" width="36" align="center" reserve-selection />
                        <el-table-column label="菜单标题" prop="MenuTitle" width="280" show-overflow-tooltip>
                            <template #default="{ row }">
                                <div class="inline-flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                    <IconPreview :icon="row.MenuIcon" /><span class="truncate">{{ row.MenuTitle }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="隐藏" width="70" align="center">
                            <template #default="{ row }">
                                <el-tag v-if="row.Hidden === 'Y'" type="info">是</el-tag>
                                <el-tag v-else type="success">否</el-tag>
                            </template>
                        </el-table-column>
                        <!-- @vue-generic {MenuTreeNode} -->
                        <el-table-column label="操作" width="220">
                            <template #default="{ row }">
                                <el-button link type="primary" size="small" @click="onEdit(row)">编辑</el-button>
                                <el-button v-if="row.IsPage !== 'Y'" link type="success" size="small" @click="onAddChild(row)">新增子菜单</el-button>
                                <el-button link type="danger" size="small" @click="onDelete(row)">删除</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="菜单路径" prop="MenuPath" width="340" show-overflow-tooltip />
                        <el-table-column label="路由名" prop="MenuName" width="100" show-overflow-tooltip />
                        <el-table-column label="排序" prop="MenuRank" width="70" align="center" />
                        <el-table-column label="类型" width="90" align="center">
                            <template #default="{ row }">
                                <el-tag :type="menuTypeTagType(row.MenuType)" size="small" effect="plain">
                                    {{ row.MenuType || 'PAGE' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="关联权限" min-width="140" show-overflow-tooltip>
                            <template #default="{ row }">
                                <el-tag v-for="fc in row.FuncCodes" :key="fc" size="small" type="info" class="mr-1">
                                    {{ fc }}
                                </el-tag>
                                <span v-if="!row.FuncCodes || row.FuncCodes.length === 0" class="text-gray-400 text-xs">无</span>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-card>
        <!-- 新增/编辑菜单弹窗 -->
        <el-dialog v-model="formVisible" :title="formMode === 'add' ? '新增菜单' : '编辑菜单'" width="600px" :close-on-click-modal="false" destroy-on-close>
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="110px">
                <el-form-item label="菜单路径" prop="MenuPath">
                    <el-input v-model="formData.MenuPath" placeholder="如 /super/menu" :disabled="formMode === 'edit'" />
                </el-form-item>
                <el-form-item label="路由名称" prop="MenuName">
                    <el-input v-model="formData.MenuName" placeholder="如 Xsupermenu" />
                </el-form-item>
                <el-form-item label="菜单标题" prop="MenuTitle">
                    <el-input v-model="formData.MenuTitle" placeholder="如 菜单管理" />
                </el-form-item>
                <el-form-item label="菜单图标" prop="MenuIcon">
                    <IconSelect v-model="iconSelectValue" />
                </el-form-item>
                <el-form-item label="父菜单">
                    <el-tree-select v-model="formData.ParentMenuId" :data="parentMenuOptions" node-key="MenuId" :props="{ label: 'MenuTitle', children: 'Children' }" check-strictly clearable placeholder="留空则为顶级菜单" style="width: 100%" />
                </el-form-item>
                <el-form-item label="排序号">
                    <el-input-number v-model="formData.MenuRank" :min="0" style="width: 100%" />
                </el-form-item>
                <el-form-item label="重定向">
                    <el-input v-model="formData.Redirect" placeholder="如 /super/menu" />
                </el-form-item>
                <el-form-item label="菜单类型" prop="MenuType">
                    <el-select v-model="formData.MenuType" style="width: 100%" @change="onMenuTypeChange">
                        <el-option label="PAGE（常规页面）" value="PAGE" />
                        <el-option label="URL（浏览器新页面）" value="URL" />
                        <el-option label="TAB（内嵌标签页）" value="TAB" />
                    </el-select>
                </el-form-item>
                <el-form-item v-if="formData.MenuType === 'URL' || formData.MenuType === 'TAB'" label="链接地址" prop="MenuUrl">
                    <el-input v-model="formData.MenuUrl" placeholder="请输入链接地址（http:// 或 https://）" />
                </el-form-item>
                <el-form-item label="节点类型" prop="IsPage">
                    <el-radio-group v-model="formData.IsPage" :disabled="formData.MenuType !== 'PAGE'">
                        <el-radio value="N">父菜单（容器）</el-radio>
                        <el-radio value="Y">页面（叶子节点）</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="组件路径" prop="Component">
                    <template v-if="formData.MenuType === 'TAB'">
                        <el-input v-model="formData.Component" disabled />
                        <div class="text-xs text-gray-400 mt-1">TAB 类型固定使用 <strong>mpa/common/iframepage.vue</strong> 组件</div>
                    </template>
                    <template v-else-if="formData.MenuType === 'URL'">
                        <el-input v-model="formData.Component" placeholder="可选，留空即可" />
                    </template>
                    <template v-else-if="formData.IsPage === 'Y'">
                        <el-input v-model="formData.Component" placeholder="如 mpa/super/menu.vue（对应 views/[mpa/super/menu.vue] 中 [] 内的部分）" />
                        <div class="text-xs text-gray-400 mt-1">填写 views/ 之后的完整路径，例如 views/<strong>[admin/user.vue]</strong> 则填写 <strong>admin/user.vue</strong></div>
                    </template>
                    <template v-else>
                        <div class="text-sm text-gray-400">父菜单无需设置组件，通过重定向跳到第一个子页面即可</div>
                    </template>
                </el-form-item>
                <el-form-item label="是否隐藏">
                    <el-switch v-model="formData.Hidden" active-value="Y" inactive-value="N" />
                </el-form-item>
                <el-form-item label="显示链接">
                    <el-switch v-model="formData.ShowLink" active-value="Y" inactive-value="N" />
                </el-form-item>
                <el-form-item label="不缓存">
                    <el-switch v-model="formData.NoCache" active-value="Y" inactive-value="N" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" @click="onFormSubmit">确定</el-button>
            </template>
        </el-dialog>
        <!-- 设定权限弹窗 -->
        <el-dialog v-model="funcDialogVisible" title="设定为权限的菜单" width="720px" :close-on-click-modal="false" @opened="onFuncDialogOpened">
            <div class="mb-2 text-sm text-gray-500">
                已选择 <strong>{{ selectedMenus.length }}</strong> 个菜单，勾选要授权的权限（确认后将覆盖这些菜单原有的权限）：
            </div>
            <div class="mb-2">
                <el-input v-model="funcFilterText" placeholder="按权限代码 / 名称 / 说明过滤" clearable size="default" />
            </div>
            <el-table ref="funcTableRef" :data="filteredFuncs" row-key="FuncCode" border height="360" style="width: 100%" @selection-change="handleFuncSelectionChange">
                <el-table-column type="selection" width="42" align="center" reserve-selection />
                <el-table-column label="权限代码" prop="FuncCode" width="200" show-overflow-tooltip />
                <el-table-column label="权限名称" prop="FuncName" min-width="160" show-overflow-tooltip />
                <el-table-column label="说明" prop="FuncDesc" min-width="180" show-overflow-tooltip />
            </el-table>
            <template #footer>
                <el-button @click="funcDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="onCoverFuncConfirm">确认覆盖授权</el-button>
            </template>
        </el-dialog>
        <!-- 导入弹窗 -->
        <el-dialog v-model="importVisible" title="导入菜单" width="800px" :close-on-click-modal="false">
            <div class="mb-3">
                <el-upload action="#" :before-upload="handleImportFile" :show-file-list="false" accept=".json,.ts">
                    <el-button type="primary">选择 JSON 文件</el-button>
                </el-upload>
                <span class="text-sm text-gray-400 ml-2">支持与路由文件相同格式的 JSON 文件</span>
            </div>
            <div class="text-sm font-medium mb-2">或直接粘贴 JSON：</div>
            <el-input v-model="importJson" type="textarea" :rows="15" placeholder="粘贴菜单 JSON 数据..." />
            <div v-if="importPreview" class="mt-2 text-sm text-green-600">已解析 {{ importPreview }} 个菜单项</div>
            <template #footer>
                <el-button @click="importVisible = false">取消</el-button>
                <el-button type="primary" :disabled="!importJson" @click="onImportConfirm">导入</el-button>
            </template>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, defineComponent, h } from 'vue'
import { ElMessage, ElMessageBox, ElLoadingService, type FormItemRule } from 'element-plus'
import { http } from '@/utils/http'
import type { MenuTreeNode, MenuItem, SysFuncItem, MenuExportNode } from '@/api/menu'
import { getMenuTree, getAllFuncs } from '@/api/menu'
import type { Arrayable } from '@pureadmin/utils'
import IconSelect from '@/components/ReIcon/src/Select.vue'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
defineOptions({ name: 'Xsupermenu' })
// Icon format: DB uses ep/xxx, IconSelect uses ep:xxx
function dbToSelectIcon(dbIcon: string): string {
    if (!dbIcon) return ''
    return dbIcon.replace('/', ':')
}
function selectToDbIcon(selectIcon: string): string {
    if (!selectIcon) return ''
    return selectIcon.replace(':', '/')
}
// --- Icon Preview 组件 ---
const IconPreview = defineComponent({
    props: { icon: String },
    setup(props) {
        return () => {
            if (!props.icon) return null
            return h('span', { class: 'inline-flex items-center' }, h(useRenderIcon(props.icon)))
        }
    },
})
// --- 状态 ---
const tableRef = ref()
const treeData = ref<MenuTreeNode[]>([])
const isRefreshing = ref(false)
const allFuncs = ref<SysFuncItem[]>([])
const selectedMenus = ref<MenuTreeNode[]>([])
// 表单
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formRef = ref()
const formData = reactive<MenuItem>({
    MenuId: '',
    MenuPath: '',
    ParentMenuId: '',
    ParentMenuPath: '',
    MenuName: '',
    MenuTitle: '',
    MenuIcon: '',
    MenuRank: 1,
    Redirect: '',
    Component: '',
    Hidden: 'N',
    ShowLink: 'Y',
    NoCache: 'N',
    IsPage: 'Y',
    MenuType: 'PAGE',
    MenuUrl: '',
})
const formRules: Partial<Record<string, Arrayable<FormItemRule>>> = {
    MenuPath: [{ required: true, message: '请输入菜单路径', trigger: 'blur' }],
    MenuName: [{ required: true, message: '请输入路由名称', trigger: 'blur' }],
    MenuTitle: [{ required: true, message: '请输入菜单标题', trigger: 'blur' }],
    MenuUrl: [
        {
            validator: (_rule, value, callback) => {
                if ((formData.MenuType === 'URL' || formData.MenuType === 'TAB') && !value) {
                    callback(new Error('URL / TAB 类型菜单必须填写链接地址'))
                } else {
                    callback()
                }
            },
            trigger: 'blur',
        },
    ],
}
// 权限设定
const funcDialogVisible = ref(false)
const funcFilterText = ref('')
const funcTableRef = ref()
const selectedFuncCodes = ref<string[]>([])
const filteredFuncs = computed(() => {
    const kw = funcFilterText.value.trim().toLowerCase()
    if (!kw) return allFuncs.value
    return allFuncs.value.filter(
        (f) =>
            (f.FuncCode || '').toLowerCase().includes(kw) ||
            (f.FuncName || '').toLowerCase().includes(kw) ||
            (f.FuncDesc || '').toLowerCase().includes(kw),
    )
})
// 权限过滤
const filterFuncCode = ref('')
function onFilterFuncChange(code: string) {
    if (!tableRef.value) return
    // 先清空所有选择
    tableRef.value.clearSelection()
    if (!code) return
    // 递归选中拥有此权限的菜单
    selectByFunc(treeData.value, code)
    syncSelectedMenus()
}
function selectByFunc(nodes: MenuTreeNode[], funcCode: string) {
    for (const node of nodes) {
        if (node.FuncCodes && node.FuncCodes.includes(funcCode)) {
            tableRef.value?.toggleRowSelection(node, true)
        }
        if (node.Children) {
            selectByFunc(node.Children, funcCode)
        }
    }
}
// 导入
const importVisible = ref(false)
const importJson = ref('')
const importPreview = ref(0)
// 图标选择器值（IconSelect 使用 ep:xxx 格式）
const iconSelectValue = ref('')
const BASE = 'api/mpa/SysTMenu'
const parentMenuOptions = computed(() => {
    const excludeId = formMode.value === 'edit' ? formData.MenuId : ''
    if (!excludeId) return treeData.value
    return filterOutDescendants(treeData.value, excludeId)
})
function filterOutDescendants(nodes: MenuTreeNode[], excludeId: string): MenuTreeNode[] {
    return nodes
        .filter((n) => n.MenuId !== excludeId)
        .map((n) => ({
            ...n,
            Children: n.Children ? filterOutDescendants(n.Children, excludeId) : [],
        }))
}
// --- 数据加载 ---
onMounted(() => {
    loadTree()
    loadAllFuncs()
})
async function loadTree() {
    isRefreshing.value = true
    const loading = ElLoadingService({ lock: true, text: '加载菜单树...', background: 'rgba(0,0,0,0.7)' })
    try {
        treeData.value = await getMenuTree()
    } catch (e) {
        ElMessage.error('加载菜单树失败')
    } finally {
        loading.close()
        isRefreshing.value = false
    }
}
async function loadAllFuncs() {
    try {
        allFuncs.value = await getAllFuncs()
    } catch (e) {
        // ignore
    }
}
// --- 选择 ---
/** 点击首列时展开/收起子菜单（仅对有子节点的行生效） */
function handleRowClick(row: any, column: any) {
    if (column.property === 'MenuTitle' && row.Children && row.Children.length > 0) {
        tableRef.value?.toggleRowExpansion(row)
    }
}
/** 递归切换节点及所有后代的选中状态 */
function cascadeSelect(node: MenuTreeNode, selected: boolean) {
    tableRef.value?.toggleRowSelection(node, selected)
    if (node.Children) {
        node.Children.forEach((child) => cascadeSelect(child, selected))
    }
}
function handleSelectionChange(selection: any[]) {
    selectedMenus.value = selection as MenuTreeNode[]
}
function syncSelectedMenus() {
    selectedMenus.value = (tableRef.value?.getSelectionRows() || []) as MenuTreeNode[]
}
// --- 增删改 ---
function resetForm() {
    formData.MenuId = ''
    formData.MenuPath = ''
    formData.ParentMenuId = ''
    formData.ParentMenuPath = ''
    formData.MenuName = ''
    formData.MenuTitle = ''
    formData.MenuIcon = ''
    formData.MenuRank = 1
    formData.Redirect = ''
    formData.Component = ''
    formData.Hidden = 'N'
    formData.ShowLink = 'Y'
    formData.NoCache = 'N'
    formData.IsPage = 'Y'
    formData.MenuType = 'PAGE'
    formData.MenuUrl = ''
    iconSelectValue.value = ''
}
function onAddRoot() {
    formMode.value = 'add'
    resetForm()
    formData.ParentMenuId = ''
    formVisible.value = true
}
function onAddChild(row: MenuTreeNode) {
    formMode.value = 'add'
    resetForm()
    formData.ParentMenuId = row.MenuId
    formVisible.value = true
}
function onEdit(row: MenuTreeNode) {
    formMode.value = 'edit'
    formData.MenuId = row.MenuId
    formData.MenuPath = row.MenuPath
    formData.ParentMenuId = row.ParentMenuId || ''
    formData.ParentMenuPath = row.ParentMenuPath || ''
    formData.MenuName = row.MenuName || ''
    formData.MenuTitle = row.MenuTitle || ''
    formData.MenuIcon = row.MenuIcon || ''
    iconSelectValue.value = dbToSelectIcon(row.MenuIcon || '')
    formData.MenuRank = row.MenuRank ?? 1
    formData.Redirect = row.Redirect || ''
    formData.Component = row.Component || ''
    formData.Hidden = row.Hidden || 'N'
    formData.ShowLink = row.ShowLink || 'Y'
    formData.NoCache = row.NoCache || 'N'
    formData.IsPage = row.IsPage || 'Y'
    formData.MenuType = row.MenuType || 'PAGE'
    formData.MenuUrl = row.MenuUrl || ''
    formVisible.value = true
}

/** 切换菜单类型时的联动处理 */
function onMenuTypeChange(type: string) {
    if (type === 'TAB') {
        formData.Component = 'mpa/common/iframepage.vue'
        formData.IsPage = 'Y'
    } else if (type === 'URL') {
        formData.IsPage = 'Y'
        formData.Component = ''
    }
}

/** 菜单类型对应的标签颜色 */
function menuTypeTagType(type: string): 'success' | 'warning' | 'danger' {
    if (type === 'TAB') return 'danger'
    if (type === 'URL') return 'warning'
    return 'success'
}
async function onFormSubmit() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    const loading = ElLoadingService({ lock: true, text: '保存中...', background: 'rgba(0,0,0,0.7)' })
    try {
        const submitData = { ...formData, MenuIcon: selectToDbIcon(iconSelectValue.value) }
        // 父菜单不需要组件，清空避免路由解析错误
        if (submitData.IsPage === 'N') submitData.Component = ''
        // URL / TAB 类型均为叶子页面
        if (submitData.MenuType === 'URL' || submitData.MenuType === 'TAB') {
            submitData.IsPage = 'Y'
        }
        // TAB 类型强制组件为 iframepage
        if (submitData.MenuType === 'TAB') {
            submitData.Component = 'mpa/common/iframepage.vue'
        }
        if (formMode.value === 'add') {
            await http.request('post', BASE, { data: submitData })
            ElMessage.success('新增成功')
        } else {
            await http.request('put', BASE, { data: submitData })
            ElMessage.success('修改成功')
        }
        formVisible.value = false
        await loadTree()
    } catch (e: any) {
        ElMessage.error(e?.response?.data?.Message || '操作失败')
    } finally {
        loading.close()
    }
}
async function onDelete(row: MenuTreeNode) {
    const childCount = row.Children?.length || 0
    const msg = childCount > 0 ? `此操作将同时删除「${row.MenuTitle}」及其 ${childCount} 个子菜单，确定继续？` : `确定删除菜单「${row.MenuTitle}」？`
    try {
        await ElMessageBox.confirm(msg, '删除确认', { type: 'warning' })
    } catch {
        return
    }
    const loading = ElLoadingService({ lock: true, text: '删除中...', background: 'rgba(0,0,0,0.7)' })
    try {
        await http.request('delete', BASE, { params: { MENUID: row.MenuId } })
        ElMessage.success('删除成功')
        await loadTree()
    } catch (e: any) {
        ElMessage.error(e?.response?.data?.Message || '删除失败')
    } finally {
        loading.close()
    }
}
// --- 权限设定 ---
function onOpenSetFuncDialog() {
    funcFilterText.value = ''
    funcDialogVisible.value = true
}
function onFuncDialogOpened() {
    funcTableRef.value?.clearSelection()
    selectedFuncCodes.value = []
    // 回显选中菜单共同拥有的权限（交集）
    const common = computeCommonFuncCodes()
    common.forEach((fc) => {
        const row = filteredFuncs.value.find((f) => f.FuncCode === fc)
        if (row) funcTableRef.value?.toggleRowSelection(row, true)
    })
}
function computeCommonFuncCodes(): string[] {
    if (selectedMenus.value.length === 0) return []
    const first = selectedMenus.value[0].FuncCodes || []
    return first.filter((fc) => selectedMenus.value.every((m) => (m.FuncCodes || []).includes(fc)))
}
function handleFuncSelectionChange(selection: any[]) {
    selectedFuncCodes.value = (selection as SysFuncItem[]).map((f) => f.FuncCode)
}
async function onCoverFuncConfirm() {
    const loading = ElLoadingService({ lock: true, text: '覆盖授权中...', background: 'rgba(0,0,0,0.7)' })
    try {
        // 直接从表格读取当前真实选中项，避免 selection-change 状态丢失（过滤、回显等场景）
        const menuRows = (tableRef.value?.getSelectionRows() || []) as MenuTreeNode[]
        const funcRows = (funcTableRef.value?.getSelectionRows() || []) as SysFuncItem[]
        const menuIds = (menuRows.length > 0 ? menuRows : selectedMenus.value).map((m) => m.MenuId)
        const funcCodes = (funcRows.length > 0 ? funcRows : []).map((f) => f.FuncCode)
        await http.request('post', BASE + '/funcs/cover', {
            data: {
                MenuIds: menuIds,
                FuncCodes: funcCodes,
            },
        })
        ElMessage.success('覆盖授权成功')
        funcDialogVisible.value = false
        await loadTree()
        if (filterFuncCode.value) onFilterFuncChange(filterFuncCode.value)
    } catch (e: any) {
        ElMessage.error(e?.response?.data?.Message || '覆盖授权失败')
    } finally {
        loading.close()
    }
}
// --- 导入 ---
function onImport() {
    importJson.value = ''
    importPreview.value = 0
    importVisible.value = true
}
async function handleImportFile(file: File) {
    try {
        const text = await file.text()
        // 尝试解析 .ts 文件（提取 JSON 数组部分）
        let jsonStr = text
        if (file.name.endsWith('.ts')) {
            const match = text.match(/export\s+default\s+(\[[\s\S]*\])/)
            if (match) {
                jsonStr = match[1]
            } else {
                // 尝试直接当作 JSON
            }
        }
        const parsed = JSON.parse(jsonStr)
        importJson.value = JSON.stringify(parsed, null, 2)
        importPreview.value = countMenuItems(parsed)
    } catch (e) {
        ElMessage.error('文件解析失败，请检查格式')
    }
    return false // 阻止默认上传
}
function countMenuItems(nodes: any[]): number {
    let count = 0
    for (const node of nodes) {
        count++
        if (node.children && Array.isArray(node.children)) {
            count += countMenuItems(node.children)
        }
    }
    return count
}
async function onImportConfirm() {
    let parsed: any[]
    try {
        parsed = JSON.parse(importJson.value)
        if (!Array.isArray(parsed)) throw new Error('必须是数组')
    } catch (e) {
        ElMessage.error('JSON 格式错误，必须是数组')
        return
    }
    const loading = ElLoadingService({ lock: true, text: '导入中...', background: 'rgba(0,0,0,0.7)' })
    try {
        await http.request('post', BASE + '/import', { data: parsed })
        ElMessage.success('导入成功')
        importVisible.value = false
        await loadTree()
    } catch (e: any) {
        ElMessage.error(e?.response?.data?.Message || '导入失败')
    } finally {
        loading.close()
    }
}
// --- 导出 ---
async function onExport() {
    const paths = selectedMenus.value.map((m) => m.MenuPath).join(',')
    await doExport(paths)
}
async function onExportAll() {
    await doExport('')
}
async function doExport(menuPaths: string) {
    const loading = ElLoadingService({ lock: true, text: '导出中...', background: 'rgba(0,0,0,0.7)' })
    try {
        const data = await http.request<MenuExportNode[]>('get', BASE + '/export', {
            params: { MENUPATHS: menuPaths },
        })
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `menu-export-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
        ElMessage.success('导出成功')
    } catch (e: any) {
        ElMessage.error('导出失败')
    } finally {
        loading.close()
    }
}
</script>
<style scoped>
:deep(.el-table__body-wrapper) {
    overflow-y: auto;
}
/* 防止树形列内容换行 */
:deep(.el-table__row) td:first-of-type .cell {
    white-space: nowrap;
}
/* 子菜单缩进 */
:deep(.el-table__indent) {
    padding-left: 24px !important;
}
/* 展开/收起图标 — 文件夹风格 */
:deep(.el-table__expand-icon .el-icon) {
    display: none;
}
</style>
