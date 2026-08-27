<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
    name: 'MpaCommonIframepage',
})

const route = useRoute()

// 当前菜单（路由）的 url 字段，即 MpaTSysMenu.MENU_URL
const url = computed(() => (route.meta?.url as string) || (route.query?.url as string) || '')
</script>

<template>
    <div class="iframepage">
        <iframe
            v-if="url"
            :src="url"
            class="iframepage-iframe"
            frameborder="0"
            scrolling="auto"
        />
        <div
            v-else
            class="iframepage-empty"
        >
            未配置链接地址
        </div>
    </div>
</template>

<style lang="scss" scoped>
.iframepage {
    position: absolute;
    inset: 0;

    .iframepage-iframe {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border: 0;
    }

    .iframepage-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: #909399;
    }
}
</style>
