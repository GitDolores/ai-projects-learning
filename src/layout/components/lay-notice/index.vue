<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import { noticesData } from './data'
import NoticeList from './components/NoticeList.vue'
import BellIcon from '~icons/ep/bell'
import { useUserStore } from '@/store/modules/user'

const { t } = useI18n()
const noticesNum = computed(() => {
    return useUserStore().MsgList.filter((x) => x.IsRead === 'N').length
})
const notices = computed(() => {
    return useUserStore().MsgList
})
const activeKey = ref('消息通知')
</script>

<template>
    <el-dropdown trigger="click" placement="bottom-end">
        <span :class="['dropdown-badge', 'navbar-bg-hover', 'select-none', Number(noticesNum) !== 0 && 'mr-[10px]']">
            <el-badge :value="Number(noticesNum) === 0 ? '' : noticesNum" :max="99">
                <span class="header-notice-icon">
                    <IconifyIconOffline :icon="BellIcon" />
                </span>
            </el-badge>
        </span>
        <template #dropdown>
            <el-dropdown-menu>
                <el-tabs v-model="activeKey" :stretch="true" class="dropdown-tabs" :style="{ width: notices.length === 0 ? '200px' : '330px' }">
                    <el-empty v-if="notices.length === 0" :description="t('status.pureNoMessage')" :image-size="60" />
                    <span v-else>
                        <el-tab-pane label="消息通知" name="消息通知">
                            <el-scrollbar max-height="330px">
                                <div class="noticeList-container">
                                    <NoticeList :list="notices" emptyText="无内容" />
                                </div>
                            </el-scrollbar>
                        </el-tab-pane>
                    </span>
                </el-tabs>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<style lang="scss" scoped>
.dropdown-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 48px;
    cursor: pointer;

    .header-notice-icon {
        font-size: 18px;
    }
}

.dropdown-tabs {
    .noticeList-container {
        padding: 15px 24px 0;
    }

    :deep(.el-tabs__header) {
        margin: 0;
    }

    :deep(.el-tabs__nav-wrap)::after {
        height: 1px;
    }

    :deep(.el-tabs__nav-wrap) {
        padding: 0 36px;
    }
}
</style>
