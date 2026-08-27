<template>
    <div class="main p-6">
        <!-- 网格式布局：小屏单列，中大屏双列 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <!-- 头像卡片 -->
            <el-card shadow="hover" class="profile-card">
                <template #header>
                    <div class="card-header">
                        <span class="text-base font-medium">头像</span>
                    </div>
                </template>
                <div class="flex flex-col items-center">
                    <el-avatar shape="square" :size="100" :src="avatar" class="border mb-4" />
                    <el-upload ref="uploadRef" accept="image/*" action="#" :limit="1" :auto-upload="false" :show-file-list="false" :on-change="onChange">
                        <el-button type="primary" plain>
                            <IconifyIconOffline class="text-white" :icon="uploadLine" />
                            <span class="ml-2 text-white">更新头像</span>
                        </el-button>
                    </el-upload>
                </div>
            </el-card>

            <!-- 基本信息卡片 -->
            <el-card shadow="hover" class="profile-card">
                <template #header>
                    <div class="card-header">
                        <span class="text-base font-medium">基本信息</span>
                    </div>
                </template>
                <el-form ref="userInfoFormRef" :model="userInfoForm" label-width="80px" label-position="right">
                    <el-form-item label="登陆名">
                        <el-input v-model="userInfoForm.loginName" readonly />
                    </el-form-item>
                    <el-form-item label="名称">
                        <el-input v-model="userInfoForm.userName" placeholder="请输入名称" />
                    </el-form-item>
                    <el-form-item label="手机号">
                        <el-input v-model="userInfoForm.phoneNo" placeholder="请输入手机号" />
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="userInfoForm.email" placeholder="请输入邮箱" />
                    </el-form-item>
                    <el-form-item label="性别">
                        <el-select v-model="userInfoForm.sex" placeholder="请选择性别">
                            <el-option value="男" label="男" />
                            <el-option value="女" label="女" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <div class="flex gap-3">
                            <el-button type="primary" @click="saveUserInfo"> 保存基本信息 </el-button>
                            <el-button @click="loadUserInfo">恢复</el-button>
                        </div>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 密码修改卡片 -->
            <el-card shadow="hover" class="profile-card">
                <template #header>
                    <div class="card-header">
                        <span class="text-base font-medium">密码修改</span>
                    </div>
                </template>
                <el-form ref="passwordFormRef" :model="passwordForm" label-width="100px" label-position="right">
                    <el-form-item label="原密码">
                        <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
                    </el-form-item>
                    <el-form-item label="新密码">
                        <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
                    </el-form-item>
                    <el-form-item label="确认新密码">
                        <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
                    </el-form-item>
                    <el-form-item>
                        <div class="password-tip text-xs text-gray-500">密码要求：8-30位，包含大写字母、小写字母、数字和特殊字符</div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="savePassword"> 应用密码修改 </el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 身份验证器卡片 -->
            <el-card shadow="hover" class="profile-card">
                <template #header>
                    <div class="card-header">
                        <span class="text-base font-medium">身份验证器</span>
                    </div>
                </template>

                <!-- 查看状态 -->
                <div v-show="authView === 'view'">
                    <div class="mb-4">
                        <div style="margin-bottom: 7px">
                            <el-button v-if="authBindTime" type="danger" plain @click="removeAuthenticator"> 删除验证器 </el-button>
                            <el-button v-else type="primary" @click="showBindView"> 绑定验证器 </el-button>
                        </div>
                        <hr />
                        <span class="text-sm text-gray-600">绑定状态：</span>
                        <span v-if="authBindTime" class="text-sm text-green-600"> 已绑定（{{ authBindTime }}） </span>
                        <span v-else class="text-sm text-red-500">未绑定</span>
                    </div>
                </div>

                <!-- 绑定视图 -->
                <div v-show="authView === 'bind'" class="space-y-4">
                    <div>
                        <div class="text-sm font-medium mb-1">步骤1：下载身份验证器</div>
                        <div class="text-sm text-gray-600">
                            点击
                            <a target="_blank" href="https://update-2.lygeport.com/AppSetup/%E8%B0%B7%E6%AD%8C%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81%E5%99%A8.apk" class="text-blue-500"> 此处下载 </a>
                            手机身份验证器APP
                        </div>
                    </div>

                    <div>
                        <div class="text-sm font-medium mb-1">步骤2：扫描二维码</div>
                        <div class="flex items-start gap-3">
                            <div class="border p-2 flex-shrink-0">
                                <ReQrcode v-if="bindQrCode" :text="bindQrCode" :size="140" />
                                <div v-else class="w-[140px] h-[140px] border flex items-center justify-center">
                                    <span class="text-xs text-gray-400">
                                        {{ bindQrCodeLoading ? '生成中...' : '请稍候...' }}
                                    </span>
                                </div>
                            </div>
                            <div class="text-sm text-gray-600 flex-1">使用手机验证器APP扫描此二维码，添加新的验证器。</div>
                        </div>
                    </div>

                    <div>
                        <div class="text-sm font-medium mb-1">步骤3：输入验证码</div>
                        <el-input v-model="bindCode" placeholder="请输入6位验证码" maxlength="6" class="w-[200px]" />
                    </div>

                    <div class="flex gap-3 pt-2">
                        <el-button type="primary" :disabled="!bindCode" @click="bindAuthenticator"> 绑定 </el-button>
                        <el-button @click="authView = 'view'">取消</el-button>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 头像裁剪弹窗 -->
        <el-dialog v-model="isShow" width="40%" title="编辑头像" destroy-on-close :close-on-click-modal="false" :before-close="handleClose">
            <ReCropperPreview ref="cropRef" :imgSrc="imgSrc" @cropper="onCropper" />
            <template #footer>
                <div class="dialog-footer">
                    <el-button bg text @click="handleClose">取消</el-button>
                    <el-button bg text type="primary" @click="handleSubmitImage"> 确定 </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoadingService } from 'element-plus'
import { http } from '@/utils/http'
import { useUserStore } from '@/store/modules/user'
import { createFormData } from '@pureadmin/utils'
import { AvatorUpload } from '@/api/user'
import uploadLine from '~icons/ri/upload-line'
import ReCropperPreview from '@/components/ReCropperPreview'
import ReQrcode from '@/components/ReQrcode'

defineOptions({
    name: 'Xprofileuserinfo',
})

// --- 状态管理 ---

// 头像相关
const uploadRef = ref()
const cropRef = ref()
const isShow = ref(false)
const imgSrc = ref('')
const cropperBlob = ref()

// 用户信息
const userInfoFormRef = ref<any>()
const userInfoForm = reactive({
    userCode: '',
    loginName: '',
    userName: '',
    phoneNo: '',
    email: '',
    sex: '男',
    enable: 'Y',
})

// 密码修改
const passwordFormRef = ref<any>()
const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
})

// 身份验证器
const authView = ref<'view' | 'bind'>('view')
const authBindTime = ref<string>('')
const bindQrCode = ref<string>('') // 存储otpauth链接，供ReQrcode使用
const bindQrCodeLoading = ref<boolean>(false)
const bindCode = ref<string>('')

const userStore = useUserStore()
const avatar = computed(() => userStore.Avatar)

// --- 生命周期 ---
onMounted(() => {
    loadUserInfo()
    getBindState()
})

// --- 用户信息相关函数 ---

/** 加载用户信息 */
const loadUserInfo = async () => {
    const loading = ElLoadingService({
        lock: true,
        text: '正在加载用户信息...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        const resp = await http.request<any>('get', 'api/MPA/sysuserinfo/userinfo')
        // 映射字段到表单
        Object.assign(userInfoForm, {
            userCode: resp.UserCode || '',
            loginName: resp.LoginName || '',
            userName: resp.UserName || '',
            phoneNo: resp.PhoneNo || '',
            email: resp.EMail || '',
            sex: resp.Sex || '男',
            enable: resp.Enable || 'Y',
        })
    } catch (err) {
        alertx('获取用户信息失败', err)
    } finally {
        loading.close()
    }
}

/** 保存用户信息 */
const saveUserInfo = async () => {
    const loading = ElLoadingService({
        lock: true,
        text: '正在保存用户信息...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        await http.request('put', 'api/MPA/sysuserinfo/userinfo', {
            data: userInfoForm,
        })

        await loadUserInfo() // 重新加载确保数据一致
    } catch (err) {
        alertx('保存用户信息失败', err)
    } finally {
        loading.close()
    }
}

// --- 头像修改相关函数 ---

const onChange = (uploadFile) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        imgSrc.value = e.target.result as string
        isShow.value = true
    }
    reader.readAsDataURL(uploadFile.raw)
}

const handleClose = () => {
    cropRef.value.hidePopover()
    uploadRef.value.clearFiles()
    isShow.value = false
}

const onCropper = ({ blob }) => (cropperBlob.value = blob)

const handleSubmitImage = () => {
    const formData = createFormData({
        files: new File([cropperBlob.value], 'avatar'),
    })
    AvatorUpload(formData)
        .then(() => {
            console.log('更新头像成功')
            useUserStore().SET_AVATAR()
            ElMessage.success('更新头像成功')
            handleClose()
        })
        .catch((error) => {
            ElMessage.error(`提交异常 ${error}`)
        })
}

// --- 密码修改相关函数 ---

/** 保存密码 */
const savePassword = async () => {
    // 验证输入
    if (!passwordForm.oldPassword) {
        ElMessage.warning('请输入原密码')
        return
    }

    if (!passwordForm.newPassword) {
        ElMessage.warning('请输入新密码')
        return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.warning('两次输入的新密码不一致')
        return
    }

    // 密码强度验证
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e])[\da-zA-Z\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]{8,30}$/
    if (!passwordRegex.test(passwordForm.newPassword)) {
        ElMessage.warning('新密码不符合安全要求，请使用8-30位，包含大小写字母、数字和特殊字符的组合')
        return
    }

    const loading = ElLoadingService({
        lock: true,
        text: '正在修改密码...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        await http.request('post', 'api/MPA/syschangeownpassword/UPDATEPWD', {
            data: {
                NewPassword: passwordForm.newPassword,
                OldPassword: passwordForm.oldPassword,
            },
        })

        ElMessage.success('密码修改成功')

        // 清空表单
        Object.assign(passwordForm, {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        })
    } catch (err) {
        alertx('修改密码失败', err)
    } finally {
        loading.close()
    }
}

// --- 身份验证器相关函数 ---

/** 获取绑定状态 */
const getBindState = async () => {
    try {
        const resp = await http.request<any>('get', 'api/MPA/systwofactor/bindtime')
        authBindTime.value = resp
    } catch (err) {
        console.error('获取绑定状态失败:', err)
    }
}

/** 显示绑定视图 */
const showBindView = async () => {
    authView.value = 'bind'
    bindCode.value = ''
    bindQrCode.value = ''
    await getBindQrCode()
}

/** 获取绑定二维码 */
const getBindQrCode = async () => {
    bindQrCodeLoading.value = true
    try {
        const resp = await http.request<any>('get', 'api/MPA/systwofactor/setupcode')

        bindQrCode.value = resp
    } catch (err) {
        alertx('获取二维码失败', err)
        authView.value = 'view'
    } finally {
        bindQrCodeLoading.value = false
    }
}

/** 绑定验证器 */
const bindAuthenticator = async () => {
    if (!bindCode.value) {
        ElMessage.warning('请输入验证码')
        return
    }

    const loading = ElLoadingService({
        lock: true,
        text: '正在绑定验证器...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        await http.request('post', 'api/MPA/systwofactor/bind', {
            params: {
                code: bindCode.value,
            },
        })

        ElMessage.success('验证器绑定成功')

        // 重置状态
        bindCode.value = ''
        bindQrCode.value = ''
        authView.value = 'view'

        await getBindState()
    } catch (err) {
        alertx('绑定验证器失败', err)
    } finally {
        loading.close()
    }
}

/** 删除验证器 */
const removeAuthenticator = async () => {
    const { value } = await ElMessageBox.prompt('请输入当前验证器中的验证码', '删除验证器', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '请输入有效的数字验证码',
    }).catch(() => ({ value: '' }))

    if (!value) return

    const loading = ElLoadingService({
        lock: true,
        text: '正在删除验证器...',
        spinner: 'el-icon-loading',
        background: 'rgba(0,0,0,0.7)',
    })

    try {
        await http.request('delete', 'api/MPA/systwofactor', {
            params: {
                code: value,
            },
        })

        ElMessage.success('验证器删除成功')
        await getBindState()
    } catch (err) {
        alertx('删除验证器失败', err)
    } finally {
        loading.close()
    }
}
</script>

<style scoped>
.profile-card {
    height: 100%;
}

.card-header {
    display: flex;
    align-items: center;
    font-weight: 500;
}

:deep(.el-form-item) {
    margin-bottom: 18px;
}

:deep(.el-card__header) {
    padding: 14px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card__body) {
    padding: 20px;
}
</style>
