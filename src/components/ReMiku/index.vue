<script setup lang="ts">
/**
 * 初音未来（Q 版）动态形象
 * 纯 SVG + CSS 动画：双马尾甩动、眨眼、身体轻摆、悬浮音符
 * 尺寸跟随容器（width: 100%），建议外层限定宽度
 */
defineOptions({ name: 'ReMiku' })

withDefaults(defineProps<{ size?: number }>(), { size: 320 })
</script>

<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="re-miku"
        role="img"
        aria-label="初音未来动态形象"
    >
        <defs>
            <linearGradient id="miku-hair" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#5fe3d8" />
                <stop offset="55%" stop-color="#39c5bb" />
                <stop offset="100%" stop-color="#1fa89e" />
            </linearGradient>
            <linearGradient id="miku-skin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fffdf9" />
                <stop offset="100%" stop-color="#ffeee4" />
            </linearGradient>
            <linearGradient id="miku-suit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f2fbfa" />
                <stop offset="100%" stop-color="#c9efec" stop-opacity="0.9" />
            </linearGradient>
            <linearGradient id="miku-tie" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4fd8cd" />
                <stop offset="100%" stop-color="#2aa79e" />
            </linearGradient>
            <radialGradient id="miku-blush" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ff9fb0" stop-opacity="0.85" />
                <stop offset="100%" stop-color="#ff9fb0" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="miku-note" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7de8e0" />
                <stop offset="100%" stop-color="#39c5bb" />
            </linearGradient>
        </defs>

        <!-- 悬浮音符（三个，错峰上升循环） -->
        <g class="miku-note miku-note-1">
            <path d="M236 96c0-5 4-8 9-9l3-1v22c0 3-2 5-5 6-4 1-7-1-7-5 0-3 2-5 5-6l2-1v-9c-3 1-5 2-5 4z" fill="url(#miku-note)" />
            <path d="M248 88l14-3" stroke="#39c5bb" stroke-width="2.4" stroke-linecap="round" />
        </g>
        <g class="miku-note miku-note-2">
            <text x="272" y="140" fill="url(#miku-note)" font-size="20" font-weight="bold">♪</text>
        </g>
        <g class="miku-note miku-note-3">
            <text x="46" y="120" fill="url(#miku-note)" font-size="16" font-weight="bold">♫</text>
        </g>

        <!-- 身体整体：轻微摇摆 -->
        <g class="miku-body">
            <!-- 后发（长发） -->
            <path
                d="M96 118c-10 34-6 78 6 108 4 10 2 22-6 30 26-4 42-20 40-46-2-30-2-62 6-88z"
                fill="url(#miku-hair)"
                opacity="0.92"
            />

            <!-- 双马尾：左右各一，围绕固定点甩动 -->
            <g class="miku-tail miku-tail-l">
                <path
                    d="M78 108c-30 8-46 40-42 76 3 28 18 52 40 64-8-22-6-44 2-64 6-16 8-34 6-50z"
                    fill="url(#miku-hair)"
                />
                <path d="M64 150c-8 26-6 54 6 76" stroke="#2bb3a9" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.5" />
            </g>
            <g class="miku-tail miku-tail-r">
                <path
                    d="M242 108c30 8 46 40 42 76-3 28-18 52-40 64 8-22 6-44-2-64-6-16-8-34-6-50z"
                    fill="url(#miku-hair)"
                />
                <path d="M256 150c8 26 6 54-6 76" stroke="#2bb3a9" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.5" />
            </g>
            <!-- 发饰方块（初音标志性的黑色发带方块） -->
            <rect x="66" y="102" width="16" height="12" rx="2" fill="#1c2b33" transform="rotate(-12 74 108)" />
            <rect x="238" y="102" width="16" height="12" rx="2" fill="#1c2b33" transform="rotate(12 246 108)" />

            <!-- 脖子与身体（领口、领带式设计） -->
            <rect x="146" y="196" width="28" height="22" fill="url(#miku-skin)" />
            <path d="M118 218h84l10 66c-34 12-70 12-104 0z" fill="url(#miku-suit)" stroke="#9adfd9" stroke-width="2" />
            <!-- 灰色袖与臂 -->
            <path d="M118 222c-18 4-28 18-30 38l20 8c4-14 12-24 22-28z" fill="#d9dde1" stroke="#b9c2c9" stroke-width="1.6" />
            <path d="M202 222c18 4 28 18 30 38l-20 8c-4-14-12-24-22-28z" fill="#d9dde1" stroke="#b9c2c9" stroke-width="1.6" />
            <!-- 领口与领结 -->
            <path d="M146 214l14 12 14-12-14-10z" fill="#0f1f26" />
            <path d="M152 226h16l-4 18h-8z" fill="url(#miku-tie)" />
            <!-- 编号 01 胸牌 -->
            <rect x="148" y="248" width="24" height="14" rx="3" fill="#0f1f26" />
            <text x="160" y="259" fill="#5fe3d8" font-size="10" font-weight="bold" text-anchor="middle" font-family="Consolas, monospace">01</text>

            <!-- 头部（含前发） -->
            <g class="miku-head">
                <!-- 脸 -->
                <ellipse cx="160" cy="132" rx="62" ry="58" fill="url(#miku-skin)" />
                <!-- 前发刘海 -->
                <path
                    d="M98 128c-2-44 28-72 62-72s64 28 62 72c-8-14-16-20-24-26 2 8 0 14-4 18-2-12-8-20-14-26-2 8-6 14-12 18-2-10-8-18-16-24-4 8-10 14-18 18-4-8-8-12-14-14-8 8-16 18-22 38z"
                    fill="url(#miku-hair)"
                />
                <!-- 眨眼组 -->
                <g class="miku-eyes">
                    <ellipse cx="138" cy="138" rx="7" ry="9" fill="#1c2b33" />
                    <ellipse cx="182" cy="138" rx="7" ry="9" fill="#1c2b33" />
                    <circle cx="140.5" cy="135" r="2.2" fill="#fff" />
                    <circle cx="184.5" cy="135" r="2.2" fill="#fff" />
                </g>
                <!-- 腮红 -->
                <ellipse cx="122" cy="152" rx="10" ry="6" fill="url(#miku-blush)" />
                <ellipse cx="198" cy="152" rx="10" ry="6" fill="url(#miku-blush)" />
                <!-- 微笑（说话感） -->
                <path d="M150 158c4 5 16 5 20 0" stroke="#c96a7e" stroke-width="3" stroke-linecap="round" fill="none" />
                <!-- 耳机（初音标志） -->
                <rect x="92" y="124" width="10" height="20" rx="4" fill="#d4373e" stroke="#a62830" stroke-width="1.5" />
                <rect x="218" y="124" width="10" height="20" rx="4" fill="#d4373e" stroke="#a62830" stroke-width="1.5" />
            </g>
        </g>
    </svg>
</template>

<style lang="scss" scoped>
.re-miku {
    overflow: visible;
}

/* 双马尾：绕发根小角度摆动，左右相位相反 */
.miku-tail-l {
    transform-box: fill-box;
    transform-origin: 85% 12%;
    animation: miku-tail-l 2.6s ease-in-out infinite;
}

.miku-tail-r {
    transform-box: fill-box;
    transform-origin: 15% 12%;
    animation: miku-tail-r 2.6s ease-in-out infinite;
}

@keyframes miku-tail-l {
    0%,
    100% {
        transform: rotate(0deg);
    }

    50% {
        transform: rotate(-7deg);
    }
}

@keyframes miku-tail-r {
    0%,
    100% {
        transform: rotate(0deg);
    }

    50% {
        transform: rotate(7deg);
    }
}

/* 头部轻微点头 */
.miku-head {
    transform-box: fill-box;
    transform-origin: 50% 95%;
    animation: miku-head 3.2s ease-in-out infinite;
}

@keyframes miku-head {
    0%,
    100% {
        transform: rotate(0deg);
    }

    50% {
        transform: rotate(2.5deg);
    }
}

/* 身体整体呼吸感摇摆 */
.miku-body {
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: miku-body 3.2s ease-in-out infinite;
}

@keyframes miku-body {
    0%,
    100% {
        transform: rotate(-1deg) translateY(0);
    }

    50% {
        transform: rotate(1deg) translateY(-3px);
    }
}

/* 眨眼：压扁眼睛模拟闭眼，每 4s 眨一次 */
.miku-eyes {
    transform-box: fill-box;
    transform-origin: center;
    animation: miku-blink 4s infinite;
}

@keyframes miku-blink {
    0%,
    92%,
    100% {
        transform: scaleY(1);
    }

    95% {
        transform: scaleY(0.08);
    }
}

/* 音符：上浮 + 淡出循环，三者错峰 */
.miku-note {
    opacity: 0;
    transform-box: fill-box;
    transform-origin: center;
}

.miku-note-1 {
    animation: miku-note 3s ease-out infinite;
}

.miku-note-2 {
    animation: miku-note 3s ease-out 1s infinite;
}

.miku-note-3 {
    animation: miku-note 3s ease-out 2s infinite;
}

@keyframes miku-note {
    0% {
        opacity: 0;
        transform: translateY(6px) rotate(-6deg);
    }

    20% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translateY(-26px) rotate(8deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .miku-tail-l,
    .miku-tail-r,
    .miku-head,
    .miku-body,
    .miku-eyes,
    .miku-note-1,
    .miku-note-2,
    .miku-note-3 {
        animation: none;
    }
}
</style>
