<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ReMiku from '@/components/ReMiku/index.vue'

defineOptions({ name: 'MikuHero' })

/* 初音尺寸随视口高度自适应，占满主体区域 */
const winH = ref(window.innerHeight)
const onResize = () => (winH.value = window.innerHeight)
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
const mikuSize = computed(() => Math.min(Math.max(Math.round(winH.value * 0.42), 240), 480))

interface Star {
    left: string
    top: string
    size: number
    delay: string
    duration: string
    pink?: boolean
}

/* 星光粒子：固定散布位置，错峰闪烁 */
const stars: Star[] = [
    { left: '5%', top: '14%', size: 16, delay: '0s', duration: '2.4s' },
    { left: '12%', top: '62%', size: 11, delay: '0.8s', duration: '3s', pink: true },
    { left: '20%', top: '32%', size: 9, delay: '1.6s', duration: '2.8s' },
    { left: '30%', top: '10%', size: 14, delay: '0.4s', duration: '3.4s' },
    { left: '38%', top: '74%', size: 10, delay: '2s', duration: '2.6s' },
    { left: '52%', top: '8%', size: 12, delay: '1.2s', duration: '3.2s', pink: true },
    { left: '64%', top: '18%', size: 15, delay: '0.2s', duration: '2.9s' },
    { left: '74%', top: '48%', size: 10, delay: '1.8s', duration: '2.5s' },
    { left: '82%', top: '26%', size: 13, delay: '0.6s', duration: '3.1s', pink: true },
    { left: '90%', top: '12%', size: 9, delay: '2.4s', duration: '2.7s' },
    { left: '94%', top: '64%', size: 12, delay: '1s', duration: '3.3s' },
    { left: '3%', top: '82%', size: 9, delay: '1.4s', duration: '2.5s' },
    { left: '44%', top: '88%', size: 10, delay: '0.9s', duration: '3s', pink: true },
    { left: '68%', top: '84%', size: 9, delay: '2.2s', duration: '2.8s' },
]

/* 音乐波形条：正弦伪随机高度，视觉均衡 */
const waveBars = Array.from({ length: 64 }, (_, i) => ({
    height: 14 + Math.round((Math.sin(i * 1.7) * 0.5 + 0.5) * 40),
    delay: `${(i % 10) * 0.11}s`,
    pink: i % 5 === 2,
}))
</script>

<template>
    <div class="miku-hero">
        <!-- 柔光圆 -->
        <div class="hero-glow hero-glow-1" />
        <div class="hero-glow hero-glow-2" />

        <!-- 闪烁星光粒子 -->
        <span
            v-for="(s, i) in stars"
            :key="i"
            class="hero-star"
            :class="{ 'hero-star-pink': s.pink }"
            :style="{
                left: s.left,
                top: s.top,
                width: s.size + 'px',
                height: s.size + 'px',
                animationDelay: s.delay,
                animationDuration: s.duration,
            }"
        />

        <!-- 可爱爱心虚线 -->
        <svg class="hero-heart-line hero-heart-line-l" viewBox="0 0 260 120" fill="none" aria-hidden="true">
            <path d="M12 98 C 76 22, 172 26, 248 90" stroke="#ff9ec6" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0.5 9" />
            <text x="70" y="50" class="hero-heart" fill="#ff8fb8">♥</text>
            <text x="160" y="36" class="hero-heart hero-heart-sm" fill="#ffa8c9">♥</text>
        </svg>
        <svg class="hero-heart-line hero-heart-line-r" viewBox="0 0 260 120" fill="none" aria-hidden="true">
            <path d="M12 26 C 86 102, 172 98, 248 20" stroke="#39c5bb" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0.5 9" />
            <text x="86" y="78" class="hero-heart" fill="#39c5bb">♥</text>
            <text x="180" y="90" class="hero-heart hero-heart-sm" fill="#5fd8cf">♥</text>
        </svg>

        <!-- 标题区 -->
        <div class="hero-header">
            <h2 class="hero-title">初音未来主题</h2>
            <p class="hero-subtitle">
                <span class="hero-note hero-note-l">♪</span>
                你的专属AI编程与创作伙伴
                <span class="hero-note hero-note-r">♫</span>
            </p>
        </div>

        <!-- 中央初音形象：占满视觉主体 -->
        <div class="hero-miku">
            <ReMiku :size="mikuSize" />
        </div>

        <!-- 音乐波形 -->
        <div class="hero-wave" aria-hidden="true">
            <span
                v-for="(b, i) in waveBars"
                :key="i"
                class="hero-wave-bar"
                :class="{ 'hero-wave-bar-pink': b.pink }"
                :style="{ height: b.height + 'px', animationDelay: b.delay }"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* 全屏马卡龙渐变：浅粉 → 天蓝，铺满内容区 */
.miku-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 100%;
    height: calc(100vh - 120px);
    min-height: 560px;
    text-align: center;
    background: linear-gradient(135deg, #ffe9f3 0%, #e6f3ff 52%, #d9f5f1 100%);
    border-radius: 8px;
}

/* 柔光圆：大面积晕染呼吸 */
.hero-glow {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
    filter: blur(64px);
    animation: hero-breathe 6s ease-in-out infinite;
}

.hero-glow-1 {
    top: -180px;
    left: -140px;
    width: 560px;
    height: 560px;
    background: radial-gradient(circle, rgb(255 190 220 / 55%) 0%, rgb(255 190 220 / 0%) 70%);
}

.hero-glow-2 {
    right: -160px;
    bottom: -120px;
    width: 620px;
    height: 620px;
    background: radial-gradient(circle, rgb(150 214 255 / 55%) 0%, rgb(150 214 255 / 0%) 70%);
    animation-delay: 2.4s;
}

@keyframes hero-breathe {
    0%,
    100% {
        transform: scale(1);
        opacity: 0.9;
    }

    50% {
        transform: scale(1.12);
        opacity: 1;
    }
}

/* 星光粒子：四角星形闪烁 */
.hero-star {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    background: #fff;
    clip-path: polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%);
    filter: drop-shadow(0 0 4px rgb(255 255 255 / 90%));
    animation: hero-twinkle 2.6s ease-in-out infinite;
}

.hero-star-pink {
    background: #ffe3f0;
    filter: drop-shadow(0 0 5px #ffb7d5);
}

@keyframes hero-twinkle {
    0%,
    100% {
        transform: scale(0.55) rotate(0deg);
        opacity: 0.25;
    }

    50% {
        transform: scale(1) rotate(20deg);
        opacity: 1;
    }
}

/* 爱心虚线弧线 */
.hero-heart-line {
    position: absolute;
    z-index: 1;
    pointer-events: none;
}

.hero-heart-line-l {
    top: 24%;
    left: 4%;
    width: 240px;
}

.hero-heart-line-r {
    right: 4%;
    bottom: 26%;
    width: 240px;
}

.hero-heart {
    font-size: 20px;
    animation: hero-heart-float 3s ease-in-out infinite;
}

.hero-heart-sm {
    font-size: 14px;
    animation-delay: 1.2s;
}

@keyframes hero-heart-float {
    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-6px);
    }
}

/* 标题区 */
.hero-header {
    position: relative;
    z-index: 2;
    flex-shrink: 0;
    margin-top: 12px;
}

.hero-title {
    margin: 0;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: 5px;
    background: linear-gradient(92deg, #ff7fb0 0%, #39c5bb 55%, #58a6ff 100%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    filter: drop-shadow(0 2px 8px rgb(57 197 187 / 25%));
}

.hero-subtitle {
    margin: 10px 0 0;
    font-size: 16px;
    color: #55808d;
    letter-spacing: 2px;
}

.hero-note {
    margin: 0 4px;
    font-size: 15px;
}

.hero-note-l {
    color: #ff8fb8;
}

.hero-note-r {
    color: #39c5bb;
}

/* 中央初音：弹性占满剩余空间，柔和发光 */
.hero-miku {
    position: relative;
    z-index: 2;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 0;
    padding: 8px 0 48px;
    filter: drop-shadow(0 14px 36px rgb(57 197 187 / 32%));
}

/* 音乐波形：贴底部横贯全屏 */
.hero-wave {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    gap: 6px;
    align-items: flex-end;
    justify-content: center;
    width: 100%;
    padding-bottom: 20px;
    pointer-events: none;
}

.hero-wave-bar {
    width: 6px;
    border-radius: 999px;
    background: linear-gradient(to top, #39c5bb, #8ff0e8);
    opacity: 0.75;
    transform-origin: bottom;
    animation: hero-eq 0.9s ease-in-out infinite alternate;
}

.hero-wave-bar-pink {
    background: linear-gradient(to top, #ff9ec6, #ffd3e6);
}

@keyframes hero-eq {
    from {
        transform: scaleY(0.35);
    }

    to {
        transform: scaleY(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .hero-star,
    .hero-glow,
    .hero-heart,
    .hero-wave-bar {
        animation: none;
    }
}

/* 窄屏收敛装饰 */
@media (max-width: 768px) {
    .hero-heart-line {
        display: none;
    }

    .hero-title {
        font-size: 26px;
        letter-spacing: 2px;
    }
}
</style>
