<template>
  <div class="svg-container">
    <svg-viewer :svg="svgAnimation"></svg-viewer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { SVGViewer } from './SVGViewer.vue'

const svgAnimation = ref(null)

onMounted(() => {
    // Load the SVG animation here
    svgAnimation.value = 'path/to/your/svg-animation.svg'
})
</script>

<style scoped>
.svg-container {
  text-align: center;
}
</style>
