<template>
    <div class="main main-content">
        <el-card shadow="never" :body-style="{ height: 'calc(100vh - 160px)' }">
            <div class="p-6 bg-white rounded-lg max-w-full">
                <h3 class="text-xl font-bold mb-6">企业选项配置</h3>

                <el-alert type="info" :closable="false" class="mb-6"> 此处配置企业的参数，修改后点击保存生效 </el-alert>

                <el-form ref="configFormRef" :model="configForm" label-width="180px" label-position="right">
                    <el-row :gutter="20">
                        <template v-for="(config, index) in configs" :key="config.CONFIG_CODE">
                            <el-col :span="12" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
                                <el-form-item :label="config.CONFIG_CODE_TXT || config.CONFIG_CODE" :prop="'configs.' + index + '.ConfigValue'" class="mb-4">
                                    <el-input v-model="config.ConfigValue" :placeholder="`请输入配置项值`" clearable />
                                </el-form-item>
                            </el-col>
                        </template>
                    </el-row>

                    <el-form-item class="mt-8">
                        <div class="flex justify-center space-x-4">
                            <el-button type="primary" :loading="loading.save" @click="saveConfigs"> 保存配置 </el-button>
                            <el-button type="success" :icon="Refresh" :loading="loading.load" @click="loadConfigs"> 刷新配置 </el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { http } from '@/utils/http'

// 定义配置项接口
interface CompanyConfig {
    CONFIG_CODE: string
    CONFIG_CODE_TXT: string
    ConfigValue: string
    [key: string]: any
}

// 组件名称
defineOptions({
    name: 'Xsupercmpconfig',
})

// --- 状态管理 ---
const loading = reactive({
    save: false,
    load: false,
})

const configs = ref<CompanyConfig[]>([])
const configFormRef = ref()

// 用于表单验证的虚拟表单模型
const configForm = reactive({
    configs: [] as CompanyConfig[],
})

// --- 数据获取与操作函数 ---

/** 组件挂载时加载初始数据 */
onMounted(() => {
    loadConfigs()
})

/** 加载配置数据 */
const loadConfigs = async () => {
    const req_title = '获取企业配置'
    loading.load = true

    try {
        const resp = await http.request<any>('get', 'api/Mpa/systcmpconfigcomp/all')

        // 处理返回数据
        configs.value = Array.isArray(resp) ? resp : resp.data || []
        configForm.configs = [...configs.value] // 用于表单验证

        ElMessage.success('配置加载成功')
    } catch (err) {
        alertx(`${req_title}失败`, err)
    } finally {
        loading.load = false
    }
}

/** 保存配置 */
const saveConfigs = async () => {
    const req_title = '保存企业配置'
    loading.save = true

    try {
        // 检查是否有空值
        const hasEmptyValue = configs.value.some((config) => {
            return config.ConfigValue === null || config.ConfigValue === undefined
        })

        if (hasEmptyValue) {
            ElMessage.warning('存在空值配置项，请检查')
            return
        }

        // 显示确认对话框
        const confirm = await ElMessageBox.confirm('确定要保存企业配置吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })

        if (confirm) {
            const resp = await http.request('put', 'api/mpa/systcmpconfigcomp', {
                data: configs.value,
            })

            ElMessage.success('配置保存成功')
            loadConfigs() // 保存后刷新数据
        }
    } catch (err) {
        if (err !== 'cancel') {
            alertx(`${req_title}失败`, err)
        }
    } finally {
        loading.save = false
    }
}
</script>

<style scoped>
/* 美化表单标签 */
:deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
}

/* 配置项卡片效果 */
.config-item {
    transition: all 0.3s ease;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 12px;
}

.config-item:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-color: #409eff;
}

/* 标题样式 */
h2 {
    color: #303133;
    border-bottom: 2px solid #409eff;
    padding-bottom: 8px;
    display: inline-block;
}
</style>
