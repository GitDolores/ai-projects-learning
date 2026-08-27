<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CloseIcon from '~icons/ri/close-line'
import { getToken } from '@/utils/auth'
import 'deep-chat'
import { fetchEventSource, EventSourceMessage } from '@microsoft/fetch-event-source'
const { VITE_BASE_URL } = import.meta.env

// refs
const dialogVisible = ref(false)
const chatRef = ref<any>()
// 存储用户提交前的输入文本（通过 onInput 事件获取）
let lastUserInput = ''

// 打开对话框
function handleOpen() {
    dialogVisible.value = true
}

// 关闭对话框
function handleClose() {
    dialogVisible.value = false
    chatMessages.value = []
}

// 处理 deep-chat 的 input 事件，保存用户输入
function handleInput(event: any) {
    const text = event?.detail?.content?.text
    if (text && text.trim()) {
        lastUserInput = text.trim()
    }
}

// 处理 deep-chat 的 message 事件，获取用户提交的消息
function handleMessage(event: any) {
    const detail = event?.detail
    if (detail?.message?.text && detail.message.text.trim()) {
        lastUserInput = detail.message.text.trim()
    }
}

// ============ 聊天历史管理 ============
interface ChatMessage {
    role: 'system' | 'user' | 'assistant' | 'tool'
    content: string | null
    tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>
    tool_call_id?: string
    name?: string
}

const chatMessages = ref<ChatMessage[]>([])

// ============ API 端点 ============
const endpoint = VITE_BASE_URL + (VITE_BASE_URL.endsWith('/') ? '' : '/') + 'api/mpa/chatai/agent/stream'

// ============ AbortController ============
let currentAbortController: AbortController | null = null

// ============ 自定义 handler ============
// 使用 fetchEventSource 处理 SSE 流，通过 deep-chat 的 addMessage 方法更新 UI
const connect = {
    url: endpoint,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + getToken(),
    },
    handler: async (body: any, signals: any) => {
        // deep-chat 的 handler body 格式是 {text: string, files?: File[]}
        const userText = body?.text || lastUserInput || ''

        // 构建 OpenAI 兼容格式请求
        const userMessage: ChatMessage = {
            role: 'user',
            content: userText,
        }
        // 使用历史消息
        const messages: ChatMessage[] = [...chatMessages.value, userMessage]

        currentAbortController = new AbortController()
        const signal = currentAbortController.signal
        let isCompleted = false
        let finalText = ''

        // 停止按钮
        signals.stopClicked.listener = () => {
            currentAbortController?.abort()
        }

        // 获取 deep-chat 元素
        const deepChatEl = chatRef.value

        // 完成流式响应的函数
        const completeStream = (text: string) => {
            if (isCompleted) return
            isCompleted = true
            finalText = text

            // 保存消息到历史
            if (text) {
                chatMessages.value.push({
                    role: 'assistant',
                    content: text,
                })
            }
            // 调用 deep-chat 的内部完成处理来重置发送按钮
            setTimeout(() => {
                try {
                    const activeService = deepChatEl?._activeService
                    if (activeService?.completionsHandlers?.onFinish) {
                        activeService.completionsHandlers.onFinish()
                    } else if (deepChatEl?.completionsHandlers?.onFinish) {
                        deepChatEl.completionsHandlers.onFinish()
                    }
                } catch (e) {
                    console.error('[SSE] 调用 onFinish 失败:', e)
                }
                signals.onClose()
            }, 50)
        }

        // 执行一次流式请求
        const runStreamRequest = async (msgs: ChatMessage[]): Promise<{ text: string; tool_calls?: any[]; finish_reason?: string }> => {
            return new Promise((resolve, reject) => {
                let accumulatedText = ''
                let currentToolCalls: any[] = []
                let finish_reason = ''

                fetchEventSource(endpoint, {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + getToken(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(msgs.map((x) => ({ Role: x.role, Text: x.content }))),
                    signal,
                    async onopen(response) {
                        if (response.ok) {
                            console.log('[SSE] 连接成功')
                            signals.onOpen()
                            signals.onResponse({ text: '' })
                        } else {
                            reject(new Error(`连接失败: ${response.status}`))
                        }
                    },
                    onmessage(msg: EventSourceMessage) {
                        if (signal.aborted || isCompleted) return

                        if (msg.data === '[DONE]') {
                            resolve({ text: accumulatedText, tool_calls: currentToolCalls.length > 0 ? currentToolCalls : undefined, finish_reason })
                            return
                        }

                        try {
                            const data = JSON.parse(msg.data)

                            if (data?.text) {
                                accumulatedText += data.text
                                if (deepChatEl?.addMessage) {
                                    deepChatEl.addMessage({ text: accumulatedText, overwrite: true })
                                }
                            }
                        } catch {
                            // 忽略解析错误
                        }
                    },
                    onerror(err) {
                        console.error('[SSE] 错误:', err)
                        reject(err)
                    },
                    onclose() {
                        if (!isCompleted && !finish_reason) {
                            resolve({ text: accumulatedText, tool_calls: currentToolCalls.filter(Boolean), finish_reason })
                        }
                    },
                })
            })
        }
        // 工具调用循环
        try {
            let currentMessages = [...messages]
            const result = await runStreamRequest(currentMessages)
            console.log('[SSE] 流式请求结果:', result)
            if (result.finish_reason === 'stop') {
                // 正常结束
                completeStream(result.text)
            } else {
                // 其他原因结束
                completeStream(result.text)
            }
        } catch (e: any) {
            if (signal.aborted) {
                console.log('[SSE] 请求已中止')
            } else {
                console.error('[SSE] 错误:', e)
                signals.onResponse({ error: e.message || '请求失败' })
                completeStream('')
            }
        }
    },
}
onMounted(() => {
    // 确保 deep-chat 元素渲染后再设置属性
    setTimeout(() => {
        const deepChatEl = chatRef.value
        if (deepChatEl) {
            console.log('[AI Chat] deep-chat 元素已就绪')
            // 监听输入事件，保存用户输入内容
            // 只在文本非空时更新，避免 deep-chat 清空输入框时覆盖
            deepChatEl.onInput = (detail: any) => {
                const text = detail?.content?.text
                if (text && text.trim()) {
                    lastUserInput = text.trim()
                }
            }
        }
    }, 500)
})
</script>

<template>
    <div>
        <div class="ai-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover" @click="handleOpen">
            <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="aiGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#79b8ff" />
                        <stop offset="60%" stop-color="#4080ff" />
                        <stop offset="100%" stop-color="#2563eb" />
                    </radialGradient>
                </defs>

                <!-- 外圈脉冲环 -->
                <circle cx="32" cy="32" r="24" fill="none" stroke="#4080ff" stroke-width="1.5" opacity="0.3">
                    <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>

                <!-- 主光球 -->
                <circle cx="32" cy="32" r="16" fill="url(#aiGlow)">
                    <animate attributeName="r" values="15;17;15" dur="2.5s" repeatCount="indefinite" />
                </circle>

                <!-- 环绕光点 -->
                <circle cx="32" cy="12" r="2" fill="#fff" opacity="0.8">
                    <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="32" cy="52" r="1.5" fill="#fff" opacity="0.6">
                    <animateTransform attributeName="transform" type="rotate" from="180 32 32" to="540 32 32" dur="4s" repeatCount="indefinite" />
                </circle>
            </svg>
        </div>

        <el-dialog v-model="dialogVisible" title="AI 智能助手" class="ai-dialog" width="1000px" top="5vh" destroy-on-close :close-on-click-modal="false" :show-close="false" append-to-body>
            <template #header>
                <div class="ai-dialog-header">
                    <div class="header-left">
                        <div>
                            <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <radialGradient id="aiGlow" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="#79b8ff" />
                                        <stop offset="60%" stop-color="#4080ff" />
                                        <stop offset="100%" stop-color="#2563eb" />
                                    </radialGradient>
                                </defs>

                                <!-- 外圈脉冲环 -->
                                <circle cx="32" cy="32" r="24" fill="none" stroke="#4080ff" stroke-width="1.5" opacity="0.3">
                                    <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                                </circle>

                                <!-- 主光球 -->
                                <circle cx="32" cy="32" r="16" fill="url(#aiGlow)">
                                    <animate attributeName="r" values="15;17;15" dur="2.5s" repeatCount="indefinite" />
                                </circle>

                                <!-- 环绕光点 -->
                                <circle cx="32" cy="12" r="2" fill="#fff" opacity="0.8">
                                    <animateTransform attributeName="transform" type="rotate" from="0 32 32" to="360 32 32" dur="4s" repeatCount="indefinite" />
                                </circle>
                                <circle cx="32" cy="52" r="1.5" fill="#fff" opacity="0.6">
                                    <animateTransform attributeName="transform" type="rotate" from="180 32 32" to="540 32 32" dur="4s" repeatCount="indefinite" />
                                </circle>
                            </svg>
                        </div>
                        <span class="title">AI 智能助手</span>
                    </div>
                    <el-button text type="primary" class="close-btn" @click="handleClose">
                        <IconifyIconOffline :icon="CloseIcon" />
                    </el-button>
                </div>
            </template>
            <div class="chat-panel-wrapper">
                <div class="tech-bg">
                    <div class="tech-bg-grid" />
                    <div class="tech-bg-glow" />
                </div>
                <deep-chat ref="chatRef" :connect="connect" style="height: 100%; width: 100%; display: block; position: relative; z-index: 1; font-size: 1rem" @input="handleInput" @message="handleMessage" />
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
.ai-container {
    color: var(--el-text-color-primary);

    &:hover {
        background-color: var(--el-fill-color-light);
    }

    .ai-icon {
        font-size: 18px;
    }
}

.ai-dialog {
    :deep(.el-dialog) {
        border-radius: 16px;
        overflow: hidden;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        border: 1px solid rgba(99, 102, 241, 0.3);
        box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.5),
            0 0 30px rgba(99, 102, 241, 0.2);
    }

    :deep(.el-dialog__header) {
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);
        border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        padding: 0;
        margin: 0;
    }

    :deep(.el-dialog__body) {
        padding: 0;
        height: 600px;
    }

    :deep(.el-dialog__footer) {
        display: none;
    }
}

.ai-dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .ai-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
        animation: pulse 2s infinite;

        .ai-avatar-icon {
            font-size: 18px;
            color: #fff;
        }
    }

    .title {
        font-size: 16px;
        font-weight: 600;
        color: #2f8ce4;
        text-shadow: 0 0 0px rgba(99, 102, 241, 0.5);
    }

    .close-btn {
        color: #94a3b8 !important;
        transition: all 0.3s ease;

        &:hover {
            color: #f472b6 !important;
            transform: rotate(90deg);
        }
    }
}

.chat-panel-wrapper {
    position: relative;
    width: 100%;
    height: 700px;
    max-height: calc(100vh - 100px);
    overflow: hidden;
    background: linear-gradient(180deg, #0f172a 0%, #1a1f2e 100%);
}

.tech-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;

    .tech-bg-grid {
        width: 100%;
        height: 100%;
        background-image: linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
        background-size: 30px 30px;
        animation: gridMove 20s linear infinite;
    }

    .tech-bg-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
        animation: glowRotate 15s linear infinite;
    }
}

@keyframes pulse {
    0%,
    100% {
        box-shadow: 0 0 12px rgba(99, 102, 241, 0.6);
        transform: scale(1);
    }

    50% {
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
        transform: scale(1.05);
    }
}

@keyframes gridMove {
    0% {
        transform: translate(0, 0);
    }

    100% {
        transform: translate(30px, 30px);
    }
}

@keyframes glowRotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
