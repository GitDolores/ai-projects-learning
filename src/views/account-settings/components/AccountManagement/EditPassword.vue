<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { defaultProps } from 'element-plus'
export type PwdModelType = {
    OldPwd: string
    NewPwd1: string
    NewPwd2: string
}

// 声明 props 默认值
// 推荐阅读：https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-props
const props = withDefaults(
    defineProps<{
        modelValue?: PwdModelType
    }>(),
    {
        modelValue: () => ({
            OldPwd: '',
            NewPwd1: '',
            NewPwd2: '',
        }),
    },
)
// 使用 vueuse 的双向绑定工具
const emit = defineEmits(['update:PwdModel'])
const data = useVModel(props, 'modelValue', emit)
</script>

<template>
    <el-form :model="props">
        <el-form-item
            label="请输入旧密码"
            :rules="[{ required: true }]"
        >
            <el-input
                v-model="data.OldPwd"
                type="password"
                class="w-[220px]!"
                placeholder="请输入旧密码"
            />
        </el-form-item>
        <el-form-item
            label="请输入新密码"
            :rules="[{ required: true }]"
        >
            <el-input
                v-model="data.NewPwd1"
                type="password"
                class="w-[220px]!"
                placeholder="请输入新密码"
            />
        </el-form-item>
        <el-form-item
            label="请输入新密码"
            :rules="[{ required: true }]"
        >
            <el-input
                v-model="data.NewPwd2"
                type="password"
                class="w-[220px]!"
                placeholder="请重新输入新密码"
            />
        </el-form-item>
    </el-form>
</template>
