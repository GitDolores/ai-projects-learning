<script setup lang="ts">
import { ref } from 'vue'
import { message } from '@/utils/message'
import { deviceDetection } from '@pureadmin/utils'
import { setUserConfig, getUserConfig } from '@/api/user'

defineOptions({
    name: 'Preferences',
})

const list = ref([
    {
        title: '用户消息',
        illustrate: '其他用户的消息将以站内信的形式通知',
        code: 'user-msg',
        checked: true,
    },
    {
        title: '系统消息',
        illustrate: '系统消息将以站内信的形式通知',
        code: 'system-msg',
        checked: true,
    },
    {
        title: '待办任务',
        illustrate: '待办任务将以站内信的形式通知',
        code: 'task-msg',
        checked: true,
    },
])

const model = ref({
    userMsg: false,
    systemMsg: false,
    taskMsg: false,
})

function loaddata() {
    getUserConfig('user-msg').then((data) => {
        model.value.userMsg = data === 'Y'
    })
    getUserConfig('system-msg').then((data) => {
        model.value.systemMsg = data === 'Y'
    })
    getUserConfig('task-msg').then((data) => {
        model.value.taskMsg = data === 'Y'
    })
}

function onChange(val, configCode) {
    setUserConfig({ code: configCode, value: val ? 'Y' : 'N' })
        .then((resp) => {
            message(`${configCode}设置成功`, { type: 'success' })
        })
        .catch((ex) => {
            alertx('保存配置失败', ex)
        })
        .finally(() => {
            loaddata()
        })
}
loaddata()
</script>

<template>
    <div :class="['min-w-[180px]', deviceDetection() ? 'max-w-[100%]' : 'max-w-[70%]']">
        <h3 class="my-8!">偏好设置</h3>
        <div>
            <div class="flex items-center">
                <div class="flex-1">
                    <p>用户消息</p>
                    <p class="wp-4">
                        <el-text
                            class="mx-1"
                            type="info"
                        >
                            来自其它用户的消息，通过站内信通知
                        </el-text>
                    </p>
                </div>
                <el-switch
                    v-model="model.userMsg"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                    @change="(val) => onChange(val, 'user-msg')"
                />
            </div>
            <el-divider />
        </div>
        <div>
            <div class="flex items-center">
                <div class="flex-1">
                    <p>系统消息</p>
                    <p class="wp-4">
                        <el-text
                            class="mx-1"
                            type="info"
                        >
                            系统消息，通过站内信通知
                        </el-text>
                    </p>
                </div>
                <el-switch
                    v-model="model.systemMsg"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                    @change="(val) => onChange(val, 'system-msg')"
                />
            </div>
            <el-divider />
        </div>
        <div>
            <div class="flex items-center">
                <div class="flex-1">
                    <p>任务消息</p>
                    <p class="wp-4">
                        <el-text
                            class="mx-1"
                            type="info"
                        >
                            任务消息，通过站内信通知
                        </el-text>
                    </p>
                </div>
                <el-switch
                    v-model="model.taskMsg"
                    inline-prompt
                    active-text="是"
                    inactive-text="否"
                    @change="(val) => onChange(val, 'task-msg')"
                />
            </div>
            <el-divider />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.el-divider--horizontal {
    border-top: 0.1px var(--el-border-color) var(--el-border-style);
}
</style>
