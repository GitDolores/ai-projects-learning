<script setup lang="ts">
import { ListItem } from '../data'
import { ref, PropType, nextTick } from 'vue'
import { useNav } from '@/layout/hooks/useNav'
import { deviceDetection } from '@pureadmin/utils'
import { DtoMsgItem, readMsgItem } from '@/api/user'

defineProps({
    noticeItem: {
        type: Object as PropType<DtoMsgItem>,
        default: () => {},
    },
})

const titleRef = ref(null)
const titleTooltip = ref(false)
const descriptionRef = ref(null)
const descriptionTooltip = ref(false)
const { tooltipEffect } = useNav()
const isMobile = deviceDetection()

function hoverTitle() {
    nextTick(() => {
        titleRef.value?.scrollWidth > titleRef.value?.clientWidth ? (titleTooltip.value = true) : (titleTooltip.value = false)
    })
}

function hoverContent(event, description) {
    // currentWidth 为文本在页面中所占的宽度，创建标签，加入到页面，获取currentWidth ,最后在移除
    const tempTag = document.createElement('span')
    tempTag.innerText = description
    tempTag.className = 'getDescriptionWidth'
    document.querySelector('body').appendChild(tempTag)
    const currentWidth = (document.querySelector('.getDescriptionWidth') as HTMLSpanElement).offsetWidth
    document.querySelector('.getDescriptionWidth').remove()

    // cellWidth为容器的宽度
    const cellWidth = event.target.offsetWidth

    // 当文本宽度大于容器宽度两倍时，代表文本显示超过两行
    currentWidth > 2 * cellWidth ? (descriptionTooltip.value = true) : (descriptionTooltip.value = false)
}
function clickMsgItem(item: DtoMsgItem) {
    // 点击消息后触发的事件
    readMsgItem(item.MsgId).then(() => {
        item.IsRead = 'Y'
    })
    console.log('点击消息', item)
}
</script>

<template>
    <div class="notice-container border-0 border-b-[1px] border-solid border-[#f0f0f0] dark:border-[#303030]">
        <!-- <el-avatar
      v-if="noticeItem."
      :size="30"
      :src="noticeItem.avatar"
      class="notice-container-avatar"
    /> -->
        <div class="notice-container-text">
            <div class="notice-text-title text-[#000000d9] dark:text-white">
                <el-tooltip
                    popper-class="notice-title-popper"
                    :effect="tooltipEffect"
                    :disabled="!titleTooltip"
                    :content="noticeItem.Title"
                    placement="top-start"
                    :enterable="!isMobile"
                >
                    <div
                        ref="titleRef"
                        class="notice-title-content"
                        @mouseover="hoverTitle"
                    >
                        {{ noticeItem.Title }}
                    </div>
                </el-tooltip>
                <el-tag
                    v-if="noticeItem?.IsRead"
                    :type="noticeItem?.Level"
                    size="small"
                    class="notice-title-extra"
                >
                    {{ noticeItem?.MsgType }}
                </el-tag>
            </div>

            <el-tooltip
                popper-class="notice-title-popper"
                :effect="tooltipEffect"
                :disabled="!descriptionTooltip"
                :content="noticeItem.Content"
                placement="top-start"
            >
                <div
                    ref="descriptionRef"
                    class="notice-text-description"
                    @mouseover="hoverContent($event, noticeItem)"
                    @click="clickMsgItem(noticeItem)"
                >
                    {{ noticeItem.Content }}
                </div>
            </el-tooltip>
            <div class="notice-text-datetime text-[#00000073] dark:text-white">
                {{ noticeItem.MsgTime }}
            </div>
        </div>
    </div>
</template>

<style>
.notice-title-popper {
    max-width: 238px;
}
</style>
<style lang="scss" scoped>
.notice-container {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px 0;

    // border-bottom: 1px solid #f0f0f0;

    .notice-container-avatar {
        margin-right: 16px;
        background: #fff;
    }

    .notice-container-text {
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-between;

        .notice-text-title {
            display: flex;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5715;
            cursor: pointer;

            .notice-title-content {
                flex: 1;
                width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .notice-title-extra {
                float: right;
                margin-top: -1.5px;
                font-weight: 400;
            }
        }

        .notice-text-description,
        .notice-text-datetime {
            font-size: 12px;
            line-height: 1.5715;
        }

        .notice-text-description {
            display: -webkit-box;
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            cursor: pointer;
        }

        .notice-text-datetime {
            margin-top: 4px;
        }
    }
}
</style>
