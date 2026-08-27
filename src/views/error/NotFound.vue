<script setup lang="ts">
defineOptions({ name: 'NotFound' })
</script>

<template>
    <div class="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div class="text-8xl font-bold text-gray-300 mb-4">404</div>
        <div class="text-xl text-gray-500 mb-6">页面未找到</div>
        <div class="text-sm text-gray-400 mb-8">该菜单配置的页面组件不存在</div>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
</template>
