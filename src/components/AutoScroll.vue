<template>
  <el-scrollbar ref="scrollRef" max-height="400px">
    <slot />
  </el-scrollbar>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  // 监听这个值变化就自动滚到底
  watchValue: { type: [String, Number, Array], default: null }
});

const scrollRef = ref(null);

function scrollToBottom() {
  nextTick(() => {
    const wrap = scrollRef.value?.wrapRef;
    if (wrap) {
      scrollRef.value.setScrollTop(wrap.scrollHeight);
    }
  });
}

// 监听内容变化自动滚
watch(() => props.watchValue, scrollToBottom, { deep: true });

defineExpose({ scrollToBottom });
</script>