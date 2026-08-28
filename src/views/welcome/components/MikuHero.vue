<script setup lang="ts">
import ReMiku from '@/components/ReMiku/index.vue'

defineOptions({ name: 'MikuHero' })

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
    { left: '6%', top: '18%', size: 14, delay: '0s', duration: '2.4s' },
    { left: '14%', top: '58%', size: 10, delay: '0.8s', duration: '3s', pink: true },
    { left: '22%', top: '30%', size: 8, delay: '1.6s', duration: '2.8s' },
    { left: '33%', top: '12%', size: 12, delay: '0.4s', duration: '3.4s' },
    { left: '45%', top: '66%', size: 9, delay: '2s', duration: '2.6s' },
    { left: '58%', top: '14%', size: 11, delay: '1.2s', duration: '3.2s', pink: true },
    { left: '68%', top: '52%', size: 13, delay: '0.2s', duration: '2.9s' },
    { left: '76%', top: '22%', size: 9, delay: '1.8s', duration: '2.5s' },
    { left: '85%', top: '44%', size: 12, delay: '0.6s', duration: '3.1s', pink: true },
    { left: '93%', top: '15%', size: 8, delay: '2.4s', duration: '2.7s' },
    { left: '90%', top: '68%', size: 10, delay: '1s', duration: '3.3s' },
    { left: '4%', top: '78%', size: 8, delay: '1.4s', duration: '2.5s' },
    { left: '40%', top: '86%', size: 9, delay: '0.9s', duration: '3s', pink: true },
    { left: '62%', top: '80%', size: 8, delay: '2.2s', duration: '2.8s' },
]

/* 音乐波形条：正弦伪随机高度，视觉均衡不闪烁 */
const waveBars = Array.from({ length: 36 }, (_, i) => ({
    height: 16 + Math.round((Math.sin(i * 1.7) * 0.5 + 0.5) * 34),
    delay: `${(i % 9) * 0.12}s`,
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
        <svg class="hero-heart-line hero-heart-line-l" viewBox="0 0 240 110" fill="none" aria-hidden="true">
            <path d="M10 92 C 70 18, 160 22, 230 86" stroke="#ff9ec6" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0.5 9" />
            <text x="64" y="46" class="hero-heart" fill="#ff8fb8">♥</text>
            <text x="150" y="32" class="hero-heart hero-heart-sm" fill="#ffa8c9">♥</text>
        </svg>
        <svg class="hero-heart-line hero-heart-line-r" viewBox="0 0 240 110" fill="none" aria-hidden="true">
            <path d="M10 24 C 80 96, 160 92, 230 18" stroke="#39c5bb" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="0.5 9" />
            <text x="80" y="72" class="hero-heart" fill="#39c5bb">♥</text>
            <text x="170" y="84" class="hero-heart hero-heart-sm" fill="#5fd8cf">♥</text>
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

        <!-- 中央初音形象 -->
        <div class="hero-miku">
            <ReMiku :size="300" />
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
/* 马卡龙渐变背景：浅粉 → 天蓝，点缀初音青 */
.miku-hero {
    position: relative;
    overflow: hidden;
    padding: 30px 24px 64px;
    text-align: center;
    background: linear-gradient(135deg, #ffe9f3 0%, #e6f3ff 52%, #d9f5f1 100%);
    border-radius: 8px;
}

/* 柔光圆：粉色 / 天蓝大面积晕染，缓慢呼吸 */
.hero-glow {
    position: absolute;
    pointer-events: none;
    border-radius: 50%;
    filter: blur(48px);
    animation: hero-breathe 6s ease-in-out infinite;
}

.hero-glow-1 {
    top: -140px;
    left: -100px;
    width: 440px;
    height: 440px;
    background: radial-gradient(circle, rgb(255 190 220 / 55%) 0%, rgb(255 190 220 / 0%) 70%);
}

.hero-glow-2 {
    right: -120px;
    bottom: -80px;
    width: 480px;
    height: 480px;
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

/* 爱心虚线：左右弧线 + 漂浮爱心 */
.hero-heart-line {
    position: absolute;
    z-index: 1;
    pointer-events: none;
}

.hero-heart-line-l {
    top: 34%;
    left: 3%;
    width: 220px;
}

.hero-heart-line-r {
    right: 3%;
    bottom: 30%;
    width: 220px;
}

.hero-heart {
    font-size: 18px;
    animation: hero-heart-float 3s ease-in-out infinite;
}

.hero-heart-sm {
    font-size: 13px;
    animation-delay: 1.2s;
}

@keyframes hero-heart-float {
    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-5px);
    }
}

/* 标题区 */
.hero-header {
    position: relative;
    z-index: 2;
}

.hero-title {
    margin: 0;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: 4px;
    background: linear-gradient(92deg, #ff7fb0 0%, #39c5bb 55%, #58a6ff 100%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    filter: drop-shadow(0 2px 8px rgb(57 197 187 / 25%));
}

.hero-subtitle {
    margin: 10px 0 0;
    font-size: 15px;
    color: #55808d;
    letter-spacing: 2px;
}

.hero-note {
    margin: 0 4px;
    font-size: 14px;
}

.hero-note-l {
    color: #ff8fb8;
}

.hero-note-r {
    color: #39c5bb;
}

/* 中央初音：柔和发光质感 */
.hero-miku {
    position: relative;
    z-index: 2;
    margin-top: 2px;
    filter: drop-shadow(0 12px 32px rgb(57 197 187 / 30%));
}

/* 音乐波形：底部均衡器律动 */
.hero-wave {
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    gap: 5px;
    align-items: flex-end;
    justify-content: center;
    width: 100%;
    padding-bottom: 16px;
    pointer-events: none;
}

.hero-wave-bar {
    width: 5px;
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

/* 窄屏收敛装饰，保住主体 */
@media (max-width: 768px) {
    .hero-heart-line {
        display: none;
    }

    .hero-title {
        font-size: 24px;
        letter-spacing: 2px;
    }
}
</style>
