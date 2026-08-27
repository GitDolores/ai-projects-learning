<script setup lang="ts">
import { ref, h, reactive } from 'vue'
import { message } from '@/utils/message'
import { deviceDetection } from '@pureadmin/utils'
import { addDialog } from '@/components/ReDialog'
import EditPassword, { PwdModelType } from './AccountManagement/EditPassword.vue'
import { changeOwnPwd } from '@/api/user'
import GoogleAuth from './AccountManagement/GoogleAuth.vue'

defineOptions({
    name: 'AccountManagement',
})

const list = ref([
    {
        title: '账户密码',
        illustrate: '修改当前用户的密码',
        button: '修改',
    },
    {
        title: '密钥认证',
        illustrate: '设置密钥认证器',
        button: '设置',
    },
])

function onClick(item) {
    console.log('onClick', item.title)
    if (item.button === '修改') {
        let PwdModel = ref<PwdModelType>({
            OldPwd: '',
            NewPwd1: '',
            NewPwd2: '',
        })
        addDialog({
            width: '30%',
            title: '修改密码',
            closeOnClickModal: false,
            contentRenderer: () =>
                h(EditPassword, {
                    modelValue: PwdModel.value,
                    'onUpdate:modelValue': (val) => (PwdModel.value = val),
                }),
            beforeSure: (done) => {
                // 重置表单数据
                if (PwdModel.value.NewPwd1 != PwdModel.value.NewPwd2) {
                    message('两次输入的新密码不一致，请重新输入', {
                        type: 'warning',
                    })
                    return
                }
                if (PwdModel.value.NewPwd1 == null) {
                    message('新密码不能为空，请重新输入', { type: 'warning' })
                    return
                }
                changeOwnPwd(PwdModel.value.OldPwd, PwdModel.value.NewPwd1)
                    .then((res) => {
                        message('修改成功，请牢记新密码', { type: 'success' })
                        done()
                    })
                    .catch((err) => {
                        alertx('修改密码失败', err)
                    })
            },
        })
    } else if (item.button === '设置') {
        addDialog({
            width: '30%',
            title: '修改密码',
            closeOnClickModal: false,
            contentRenderer: () => h(GoogleAuth),
        })
    } else if (item.button === '更换') {
    } else {
    }
}
</script>

<template>
    <div :class="['min-w-[180px]', deviceDetection() ? 'max-w-[100%]' : 'max-w-[70%]']">
        <h3 class="my-8!">账户管理</h3>
        <div
            v-for="(item, index) in list"
            :key="index"
        >
            <div class="flex items-center">
                <div class="flex-1">
                    <p>{{ item.title }}</p>
                    <el-text
                        class="mx-1"
                        type="info"
                        >{{ item.illustrate }}</el-text
                    >
                </div>
                <el-button
                    type="primary"
                    text
                    @click="onClick(item)"
                >
                    {{ item.button }}
                </el-button>
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
