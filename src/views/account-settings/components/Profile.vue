<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from '@/utils/message'
import { DtoSelfInfo, getMine, setMine, AvatorUpload } from '@/api/user'
import type { FormInstance, FormRules } from 'element-plus'
import ReCropperPreview from '@/components/ReCropperPreview'
import { createFormData, deviceDetection } from '@pureadmin/utils'
import uploadLine from '~icons/ri/upload-line'
import { useUserStore } from '@/store/modules/user'
const { VITE_BASE_URL } = import.meta.env
defineOptions({
    name: 'Profile',
})

const imgSrc = ref('')
const cropperBlob = ref()
const cropRef = ref()
const uploadRef = ref()
const isShow = ref(false)
const userInfoFormRef = ref<FormInstance>()

const userInfos = reactive({
    UserName: '',
    EMail: '',
    PhoneNo: '',
    Sex: '',
    LoginName: '',
} as DtoSelfInfo)

const rules = reactive<FormRules<DtoSelfInfo>>({
    LoginName: [{ required: true, message: '昵称必填', trigger: 'blur' }],
})

function queryEmail(queryString, callback) {
    const emailList = [{ value: '@qq.com' }, { value: '@126.com' }, { value: '@163.com' }, { value: '@lygeport.gov.cn' }]
    let results = []
    let queryList = []
    emailList.map((item) => queryList.push({ value: queryString.split('@')[0] + item.value }))
    results = queryString ? queryList.filter((item) => item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0) : queryList
    callback(results)
}

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
            message('更新头像成功', { type: 'success' })
            handleClose()
        })
        .catch((error) => {
            message(`提交异常 ${error}`, { type: 'error' })
        })
}
console.debug(userInfos.Avatar)
// 更新信息
const onSubmit = async (formEl: FormInstance) => {
    await formEl.validate((valid, fields) => {
        if (valid) {
            setMine(userInfos)
                .then((res) => {
                    useUserStore().User.UserName = userInfos.UserName
                    useUserStore().User.EMail = userInfos.EMail
                    useUserStore().User.PhoneNo = userInfos.PhoneNo
                    useUserStore().User.Sex = userInfos.Sex
                    useUserStore().User.LoginName = userInfos.LoginName
                    message('更新信息成功', { type: 'success' })
                })
                .catch((err) => {
                    message(`提交异常 ${err}`, { type: 'error' })
                })
        } else {
            console.log('error submit!', fields)
        }
    })
}

getMine().then((res) => {
    Object.assign(userInfos, res)
})
</script>

<template>
    <div :class="['min-w-[180px]', deviceDetection() ? 'max-w-[100%]' : 'max-w-[70%]']">
        <h3 class="my-8!">个人信息</h3>
        <el-form
            ref="userInfoFormRef"
            label-position="top"
            :rules="rules"
            :model="userInfos"
        >
            <el-form-item label="头像">
                <el-avatar
                    :size="80"
                    :src="useUserStore().Avatar"
                />
                <el-upload
                    ref="uploadRef"
                    accept="image/*"
                    action="#"
                    :limit="1"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="onChange"
                >
                    <el-button
                        plain
                        class="ml-4!"
                    >
                        <IconifyIconOffline :icon="uploadLine" />
                        <span class="ml-2">更新头像</span>
                    </el-button>
                </el-upload>
            </el-form-item>
            <el-form-item
                label="名称"
                prop="UserName"
            >
                <el-input
                    v-model="userInfos.UserName"
                    placeholder="请输入名称"
                />
            </el-form-item>
            <el-form-item
                label="登陆名"
                prop="LoginName"
            >
                <el-input
                    v-model="userInfos.LoginName"
                    placeholder="请输入登陆名"
                />
            </el-form-item>
            <el-form-item
                label="性别"
                prop="Sex"
            >
                <el-select
                    v-model="userInfos.Sex"
                    placeholder="请选择性别"
                >
                    <el-option
                        label="男"
                        value="男"
                    />
                    <el-option
                        label="女"
                        value="女"
                    />
                    <el-option
                        label="保密"
                        value="保密"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                label="邮箱"
                prop="EMail"
            >
                <el-autocomplete
                    v-model="userInfos.EMail"
                    :fetch-suggestions="queryEmail"
                    :trigger-on-focus="false"
                    placeholder="请输入邮箱"
                    clearable
                    class="w-full"
                />
            </el-form-item>
            <el-form-item label="手机号">
                <el-input
                    v-model="userInfos.PhoneNo"
                    placeholder="请输入联系电话"
                    clearable
                />
            </el-form-item>
            <el-form-item label="座机号">
                <el-input
                    v-model="userInfos.PhoneNo"
                    placeholder="请输入联系电话"
                    clearable
                />
            </el-form-item>
            <el-button
                type="primary"
                @click="onSubmit(userInfoFormRef)"
            >
                更新信息
            </el-button>
        </el-form>
        <el-dialog
            v-model="isShow"
            width="40%"
            title="编辑头像"
            destroy-on-close
            :closeOnClickModal="false"
            :before-close="handleClose"
            :fullscreen="deviceDetection()"
        >
            <ReCropperPreview
                ref="cropRef"
                :imgSrc="imgSrc"
                @cropper="onCropper"
            />
            <template #footer>
                <div class="dialog-footer">
                    <el-button
                        bg
                        text
                        @click="handleClose"
                        >取消</el-button
                    >
                    <el-button
                        bg
                        text
                        type="primary"
                        @click="handleSubmitImage"
                    >
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
