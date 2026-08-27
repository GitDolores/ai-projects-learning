<template>
    <el-card
        shadow="never"
        :body-style="{ height: 'calc(100vh - 160px)' }"
    >
        <div v-show="pageState === 'list'">
            <el-form :inline="true">
                <el-form-item label="过程名称~">
                    <el-input v-model="searchForm.spNameLike" />
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        :icon="Search"
                        @click="onSearch"
                        >查询</el-button
                    >
                    <!-- <el-button
                        type="primary"
                        @click="onAdd"
                        >新增</el-button
                    > -->
                </el-form-item>
            </el-form>
            <el-divider style="margin-top: 8px" />
            <el-table
                :data="processList"
                border
                fit
            >
                <el-table-column
                    label="过程名称"
                    prop="SpName"
                    min-width="100"
                />
                <el-table-column
                    label="描述"
                    prop="SpDesc"
                    min-width="200"
                />
                <el-table-column
                    label="ISOPEN"
                    prop="IsOpen"
                    min-width="75"
                />
                <el-table-column
                    label="状态"
                    min-width="75"
                >
                    <template #default="scope">
                        <el-button
                            :type="scope.row.Enable === 'Y' ? 'success' : 'danger'"
                            plain
                            >{{ scope.row.Enable === 'Y' ? '可用' : '禁用' }}</el-button
                        >
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作"
                    width="200"
                    fixed="right"
                >
                    <template #default="scope">
                        <el-button
                            link
                            type="primary"
                            @click="onView(scope.row.SpName)"
                            >查看定义</el-button
                        >
                        <el-button
                            link
                            type="primary"
                            @click="onEdit(scope.row)"
                            >编辑</el-button
                        >
                        <el-button
                            link
                            type="danger"
                            @click="onDelete(scope.row)"
                            >删除</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElForm } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { http } from '@/utils/http'

defineOptions({
    name: 'Xsuperprocess',
})
// 组件挂载时加载初始数据
onMounted(() => {
    getListData()
})
// --- 状态管理 ---
type PageState = 'list'
const pageState = ref<PageState>('list') // 当前界面状态

// 表格数据和分页
const loading = ref(true)
const processList = ref([])

// 查询表单
const searchForm = reactive({
    spNameLike: '',
})

// --- 数据获取与操作函数 ---

/** 获取过程列表数据 */
const getListData = async () => {
    try {
        loading.value = true
        let resp = await http.request<any>('get', 'api/MPA/syssptext', {
            params: {
                SPNAME: searchForm.spNameLike,
            },
        })
        processList.value = resp.List
    } catch (ex) {
        alertx('获取过程列表失败', ex)
    } finally {
        loading.value = false
    }
}

// --- 事件处理 ---
// 列表查询
const onSearch = () => {
    getListData()
}

// 新增
const onAdd = () => {}

// 编辑
const onEdit = (row) => {}

// 提交（新增或编辑）
// const onSubmitAddUser = async () => {}

// 删除
const onDelete = (row) => {}

//查看定义
const onView = (SpName) => {}
</script>

<style scoped></style>
