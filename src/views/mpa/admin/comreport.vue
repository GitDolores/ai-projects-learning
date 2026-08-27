<template>
    <el-card
        shadow="never"
        :body-style="{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }"
    >
        <div
            v-show="pageState === 'list'"
            class="flex flex-col h-full"
        >
            <div class="flex-shrink-0">
                <el-form :inline="true">
                    <el-form-item label="模板名称~">
                        <el-input v-model="searchForm.templateNameLike" />
                    </el-form-item>
                    <el-form-item label="模板类型代码=">
                        <el-input v-model="searchForm.templateTypeCode" />
                    </el-form-item>
                    <el-form-item>
                        <el-button
                            type="primary"
                            @click="onSearch"
                            >查询</el-button
                        >
                        <el-button
                            v-show="CompanyInfo.CompanyCode === 'SUPER'"
                            type="primary"
                            @click="onAdd"
                            >新增</el-button
                        >
                    </el-form-item>
                </el-form>
                <el-divider style="margin-top: 8px" />
            </div>
            <div class="flex-grow overflow-hidden">
                <el-table
                    :data="templateList"
                    border
                    fit
                    height="100%"
                    style="width: 100%"
                >
                    <el-table-column
                        label="模板名称"
                        prop="TemplateName"
                    />
                    <el-table-column
                        label="模板类型代码"
                        prop="TemplateTypeCode"
                    />
                    <el-table-column label="父模板">
                        <template #default="scope">
                            <span v-if="scope.row.ParentId == null || scope.row.ParentId === ''">父模板</span>
                            <span v-else>子模板</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="添加时间"
                        prop="MsgTime"
                        width="140"
                    />
                    <el-table-column
                        label="编辑时间"
                        prop="ModifyTime"
                        width="140"
                    />
                    <el-table-column
                        label="操作"
                        width="400"
                        fixed="right"
                    >
                        <template #default="scope">
                            <div style="text-align: center">
                                <el-button
                                    v-show="(scope.row.ParentId == null || scope.row.ParentId === '') && CompanyInfo.CompanyCode === 'SUPER'"
                                    type="primary"
                                    link
                                    @click="onDelete(scope.row.TemplateId)"
                                >
                                    删除
                                </el-button>
                                <el-button
                                    v-show="!(scope.row.ParentId == null || scope.row.ParentId === '')"
                                    type="primary"
                                    link
                                    @click="onDelete(scope.row.TemplateId)"
                                >
                                    删除
                                </el-button>
                                <el-button
                                    v-if="scope.row.ParentId == null || scope.row.ParentId === ''"
                                    type="primary"
                                    link
                                    @click="onAddSubTemplate(scope.row)"
                                >
                                    复制
                                </el-button>
                                <el-button
                                    type="primary"
                                    link
                                    @click="onShowCode(scope.row)"
                                >
                                    查看数据项
                                </el-button>
                                <el-button
                                    type="primary"
                                    link
                                    @click="onEdit(scope.row.TemplateId)"
                                >
                                    设计
                                </el-button>
                                <el-button
                                    type="primary"
                                    link
                                    @click="onPrint(scope.row.TemplateId)"
                                >
                                    测试
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="mt-4 flex justify-end">
                <el-pagination
                    v-model:current-page="pagination.currentPage"
                    v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 30, 50]"
                    size="small"
                    :background="true"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pagination.total"
                    @size-change="onSizeChange"
                    @current-change="onPageChange"
                />
            </div>
        </div>

        <div
            v-show="pageState === 'add'"
            class="p-6 bg-white place-self-center w-200 max-w-full"
        >
            <h2 class="text-xl font-bold mb-6">新增模板</h2>
            <el-form
                ref="templateFormRef"
                :model="formDataAddTemplate"
                :rules="formDataAddTemplateRules"
                label-width="120px"
                label-position="right"
                class="form-container"
            >
                <el-form-item
                    label="模板名称"
                    prop="templateName"
                >
                    <el-input
                        v-model="formDataAddTemplate.templateName"
                        placeholder="请输入模板名称"
                    />
                </el-form-item>
                <el-form-item
                    label="模板类型代码"
                    prop="templateTypeCode"
                >
                    <el-input
                        v-model="formDataAddTemplate.templateTypeCode"
                        placeholder="请输入模板类型代码"
                    />
                </el-form-item>
                <el-form-item
                    label="JSON数据"
                    prop="fakeJson"
                >
                    <div class="json-editor-container">
                        <div
                            ref="jsonEditor"
                            class="json-editor"
                        />
                    </div>
                </el-form-item>
                <el-form-item class="mt-6">
                    <span class="dialog-footer">
                        <el-button @click="pageState = 'list'">返回</el-button>
                        <el-button
                            type="primary"
                            @click="onSubmitAddTemplate"
                            >保存</el-button
                        >
                    </span>
                </el-form-item>
            </el-form>
        </div>

        <div
            v-show="pageState === 'add-sub'"
            class="p-6 bg-white place-self-center w-200 max-w-full"
        >
            <h2 class="text-xl font-bold mb-6">新增子模板</h2>
            <el-form
                ref="subTemplateFormRef"
                :model="formDataSubTemplate"
                :rules="formDataSubTemplateRules"
                label-width="120px"
                label-position="right"
            >
                <el-form-item label="父模板名称">
                    <span>{{ subTemplateParent.templateName }}</span>
                </el-form-item>
                <el-form-item
                    label="子模板名称"
                    prop="templateName"
                >
                    <el-input
                        v-model="formDataSubTemplate.templateName"
                        placeholder="请输入子模板名称"
                    />
                </el-form-item>
                <el-form-item label="模板类型代码">
                    <span>{{ subTemplateParent.templateTypeCode }}</span>
                </el-form-item>
                <el-form-item>
                    <span class="dialog-footer">
                        <el-button @click="pageState = 'list'">返回</el-button>
                        <el-button
                            type="primary"
                            @click="onSubmitAddTemplate"
                            >保存</el-button
                        >
                    </span>
                </el-form-item>
            </el-form>
        </div>

        <div
            v-show="pageState === 'code'"
            class="p-6 bg-white place-self-center w-200 max-w-full"
        >
            <h2 class="text-xl font-bold mb-6">模板数据项</h2>
            <el-form
                :inline="true"
                class="mb-6"
            >
                <el-form-item label="模板名称">
                    <el-input
                        v-model="currentTemplate.templateName"
                        readonly
                    />
                </el-form-item>
                <el-form-item label="模板类型代码">
                    <el-input
                        v-model="currentTemplate.templateTypeCode"
                        readonly
                    />
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        @click="pageState = 'list'"
                        >返回</el-button
                    >
                </el-form-item>
                <el-form-item label="JSON数据">
                    <div class="json-viewer-container">
                        <div
                            ref="jsonShowEditor"
                            class="json-show-editor"
                        />
                    </div>
                </el-form-item>
            </el-form>
            <div>
                <div
                    ref="jsonShowEditor"
                    style="height: calc(100vh - 270px)"
                />
            </div>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElLoadingService, ElForm } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { storeToRefs } from 'pinia'
import { http } from '@/utils/http'
import comreport from '@/components/LayControls/local/comreport/index.js'
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'

defineOptions({
    name: 'MpaComReport',
})

// --- Store ---
const userStore = useUserStore()
const { CompanyInfo } = storeToRefs(userStore)

// --- 状态管理 ---
type PageState = 'list' | 'add' | 'add-sub' | 'code' | 'edit'
const pageState = ref<PageState>('list')

// 表格数据和分页
const loading = ref(true)
const templateList = ref([])
const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
})

// 查询表单
const searchForm = reactive({
    templateNameLike: '',
    templateTypeCode: '',
})

// 新增/编辑表单
const templateFormRef = ref<InstanceType<typeof ElForm>>()
const subTemplateFormRef = ref<InstanceType<typeof ElForm>>()
const formDataAddTemplate = ref({
    templateId: '',
    templateTypeCode: '',
    templateB64: '',
    templateName: '',
    msgTime: null,
    companyCode: '',
    parentId: '',
    fakeJson: '',
    createMan: '',
    modifyMan: '',
    modifyTime: null,
    tmpB64ModifyTime: null,
})

const formDataAddTemplateRules = ref({
    templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
    templateTypeCode: [{ required: true, message: '请输入模板类型代码', trigger: 'blur' }],
})

// 子模板相关
const subTemplateParent = ref({ templateName: '', templateTypeCode: '' })
const formDataSubTemplate = ref({
    templateId: '',
    templateTypeCode: '',
    templateName: '',
    parentId: '',
    fakeJson: '',
})

const formDataSubTemplateRules = ref({
    templateName: [{ required: true, message: '请输入子模板名称', trigger: 'blur' }],
})

// 当前查看的模板
const currentTemplate = ref({
    templateName: '',
    templateTypeCode: '',
    fakeJson: '',
})

// JSON Editor
const jsonEditor = ref<HTMLElement>()
const jsonShowEditor = ref<HTMLElement>()
let editor: JSONEditor | null = null
let jsonShow: JSONEditor | null = null

// --- 生命周期 ---
onMounted(() => {
    // 初始化列表数据
    getTemplateList()

    // 直接初始化两个编辑器（像选项式那样）
    initJSONEditors()
})

// --- 数据获取与操作函数 ---
/** 初始化JSON编辑器（同步初始化） */
const initJSONEditors = () => {
    nextTick(() => {
        // 初始化新增编辑器
        if (jsonEditor.value) {
            editor = new JSONEditor(jsonEditor.value, {
                mode: 'code',
                onChangeText: (jsonString) => {
                    formDataAddTemplate.value.fakeJson = jsonString
                },
            })
        }

        // 初始化查看编辑器（设置为只读）
        if (jsonShowEditor.value) {
            jsonShow = new JSONEditor(jsonShowEditor.value, {
                mode: 'code',
                indentation: 2,
                onEditable: function (node) {
                    if (!node.path) {
                        // 设置为只读
                        return false
                    }
                },
            })
        }
    })
}

/** 获取模板列表 */
const getTemplateList = async () => {
    try {
        loading.value = true
        const resp = await http.request<any>('get', 'api/mpa/comreport/cmd/page', {
            params: {
                pageSize: pagination.pageSize,
                pageIndex: pagination.currentPage,
                template_name_like: searchForm.templateNameLike,
                template_type_code: searchForm.templateTypeCode,
            },
        })
        templateList.value = resp.List
        pagination.total = resp.Total
    } catch (ex) {
        alertx('获取模板列表失败', ex)
    } finally {
        loading.value = false
    }
}

// --- 事件处理 ---
/** 查询 */
const onSearch = () => {
    pagination.currentPage = 1
    getTemplateList()
}

/** 分页大小改变 */
const onSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    getTemplateList()
}

/** 页码改变 */
const onPageChange = (page: number) => {
    pagination.currentPage = page
    getTemplateList()
}

/** 新增模板 */
const onAdd = () => {
    formDataAddTemplate.value = {
        templateId: '',
        templateTypeCode: '',
        templateB64: '',
        templateName: '',
        msgTime: null,
        companyCode: '',
        parentId: '',
        fakeJson: '',
        createMan: '',
        modifyMan: '',
        modifyTime: null,
        tmpB64ModifyTime: null,
    }
    if (editor) {
        editor.setText('{}')
    }
    pageState.value = 'add'
}

/** 新增子模板 */
const onAddSubTemplate = (row: any) => {
    subTemplateParent.value = { templateName: row.TemplateName, templateTypeCode: row.TemplateTypeCode }
    formDataSubTemplate.value = {
        templateId: '',
        templateTypeCode: row.TemplateTypeCode,
        templateName: '',
        parentId: row.TemplateId,
        fakeJson: row.FakeJson,
    }
    pageState.value = 'add-sub'
}

/** 查看数据项 */
const onShowCode = (row: any) => {
    currentTemplate.value = {
        templateName: row.TemplateName,
        templateTypeCode: row.TemplateTypeCode,
        fakeJson: row.FakeJson,
    }

    // 设置JSON内容
    if (jsonShow && row.FakeJson) {
        jsonShow.setText(row.FakeJson)
    }

    pageState.value = 'code'
}

/** 设计模板 */
const onEdit = async (templateId: string) => {
    const req_title = '编辑模板'
    const loading = ElLoadingService({
        lock: true,
        text: `正在${req_title}……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        const resp = await http.request<any>('post', 'api/mpa/comreport/cmd/cmd-edit', {
            params: { tmplt_id: templateId },
        })
        comreport.templateedit(resp.data)
    } catch (err) {
        alertx(`${req_title}失败`, err)
    } finally {
        loading.close()
    }
}

/** 测试打印 */
const onPrint = async (templateId: string) => {
    const req_title = '测试打印'
    const loading = ElLoadingService({
        lock: true,
        text: `正在${req_title}……`,
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })
    try {
        const resp = await http.request<any>('post', 'api/mpa/comreport/cmd/cmd-print', {
            params: {
                tmplt_id: templateId,
                busy_type: '',
                param_json: '',
            },
        })
        comreport.templateprint(resp.data)
    } catch (err) {
        alertx(`${req_title}失败`, err)
    } finally {
        loading.close()
    }
}

/** 提交新增/编辑模板 */
const onSubmitAddTemplate = async () => {
    const isSubTemplate = pageState.value === 'add-sub'
    const formRef = isSubTemplate ? subTemplateFormRef.value : templateFormRef.value

    if (formRef) {
        await formRef.validate(async (valid) => {
            if (valid) {
                const req_title = isSubTemplate ? '保存子模板' : '保存模板'
                const loading = ElLoadingService({
                    lock: true,
                    text: `正在${req_title}……`,
                    spinner: 'el-icon-loading',
                    background: 'rgba(0,0,0,0.7)',
                })
                try {
                    let requestData
                    if (isSubTemplate) {
                        // 子模板
                        requestData = {
                            TemplateTypeCode: formDataSubTemplate.value.templateTypeCode, // 注意：TemplateTypeCode
                            TemplateName: formDataSubTemplate.value.templateName, // 注意：TemplateName
                            ParentId: formDataSubTemplate.value.parentId || '', // 注意：ParentId
                            FakeJson: formDataSubTemplate.value.fakeJson || '{}', // 注意：FakeJson
                        }
                    } else {
                        // 新增模板
                        requestData = {
                            TemplateTypeCode: formDataAddTemplate.value.templateTypeCode,
                            TemplateName: formDataAddTemplate.value.templateName,
                            FakeJson: editor ? editor.getText() : '{}',
                        }
                    }

                    await http.request('post', 'api/mpa/comreport/cmd', {
                        data: requestData,
                    })

                    ElMessage.success('保存成功')
                    pageState.value = 'list'
                    getTemplateList()
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
}

/** 删除模板 */
const onDelete = (templateId: string) => {
    ElMessageBox.confirm('确定删除这个模板吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
            const req_title = '删除模板'
            const loading = ElLoadingService({
                lock: true,
                text: `正在${req_title}……`,
                spinner: 'el-icon-loading',
                background: 'rgba(0,0,0,0.7)',
            })
            try {
                await http.request('delete', 'api/mpa/comreport/cmd', {
                    params: { template_id: templateId },
                })
                ElMessage.success('删除成功')
                getTemplateList()
            } catch (err) {
                alertx(`${req_title}失败`, err)
            } finally {
                loading.close()
            }
        })
        .catch(() => {})
}
</script>

<style scoped>
/* 表单容器 */
.form-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* JSON 编辑器容器 */
.json-editor-container {
    width: 100%;
    height: 400px;
    /* 固定高度 */
    min-height: 300px;
    max-height: 500px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
}

.json-editor {
    width: 100%;
    height: 100%;
}

/* 确保整个表单可以滚动 */
.p-6.bg-white.place-self-center.w-200.max-w-full {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    overflow-x: auto;
    padding: 24px;
}

/* 对话框底部按钮固定 */
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
    margin-top: 20px;
    position: sticky;
    bottom: 0;
    background: white;
    z-index: 10;
}

/* 确保按钮可见 */
:deep(.jsoneditor) {
    height: 100% !important;
}

:deep(.jsoneditor-menu) {
    display: none;
    /* 隐藏顶部菜单栏以节省空间 */
}

:deep(.ace_editor) {
    height: 100% !important;
    min-height: 200px;
}
</style>
