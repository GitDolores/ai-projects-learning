<script setup lang="ts">
import { PropType } from 'vue'
import { ListItem } from '../data'
import NoticeItem from './NoticeItem.vue'
import { transformI18n } from '@/plugins/i18n'
import { DtoMsgItem } from '@/api/user'

defineProps({
    list: {
        type: Array as PropType<Array<DtoMsgItem>>,
        default: () => [],
    },
    emptyText: {
        type: String,
        default: '',
    },
})
</script>

<template>
    <div v-if="list.length">
        <template
            v-for="item in list"
            :key="item.MsgId"
        >
            <NoticeItem
                v-if="item.IsRead === 'N'"
                :noticeItem="item"
            />
        </template>
    </div>
    <el-empty
        v-else
        :description="transformI18n(emptyText)"
    />
</template>
