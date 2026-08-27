<script setup lang="ts">
import { computed } from 'vue'
import { isUrl } from '@pureadmin/utils'
import { useRouter } from 'vue-router'
import { menuType } from '@/layout/types'
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'

const props = defineProps<{
    to: menuType
}>()

const router = useRouter()

const isExternalLink = computed(() => isUrl(props.to.name) || (props.to.meta?.menuType === 'URL' && !!props.to.meta?.url))
const isTab = computed(() => props.to.meta?.menuType === 'TAB')

// TAB 类型菜单：允许多开，每次点击都打开一个新的标签页
function onTabClick() {
    const query = { _: String(Date.now()) }
    useMultiTagsStoreHook().handleTags('push', {
        path: props.to.path,
        name: props.to.name,
        query,
        meta: props.to.meta,
    })
    router.push({ path: props.to.path, query })
}

const getLinkProps = (item: menuType) => {
    if (isExternalLink.value) {
        return {
            href: item.meta?.url || item.name,
            target: '_blank',
            rel: 'noopener',
        }
    }
    return {
        to: item,
    }
}
</script>

<template>
    <a
        v-if="isTab"
        class="cursor-pointer"
        @click.prevent="onTabClick"
    >
        <slot />
    </a>
    <component
        v-else
        :is="isExternalLink ? 'a' : 'router-link'"
        v-bind="getLinkProps(to)"
    >
        <slot />
    </component>
</template>
