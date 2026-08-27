<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { defaultProps } from 'element-plus'
import { getGoogleBindTime, getGoogleBindCode, setGoogleBindCode, removeGoogleKey } from '@/api/user'
import { ref } from 'vue'
import dayjs from 'dayjs'
import ReQrcode from '@/components/ReQrcode'
import { ElMessageBox } from 'element-plus'
export type PwdModelType = {
    OldPwd: string
    NewPwd1: string
    NewPwd2: string
}
export type GoogleKey = {
    bindtime: string
    bind: {
        code: string
        qrcode: string
        old_code: string
    }
}
const gk = ref<GoogleKey>({
    bindtime: null,
    bind: {
        code: '',
        qrcode: '',
        old_code: '',
    },
})

const onRemove = () => {
    ElMessageBox.prompt('请输入你密钥器中的最新密码', '删除密钥器', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputPattern: /\d+/,
        inputErrorMessage: '口令密码必须是数字',
    }).then(({ value }) => {
        removeGoogleKey(value)
            .then(() => {
                alertx('删除成功')
                onLoadData()
            })
            .catch((ex) => {
                alertx('删除密钥器失败', ex)
            })
    })
}
const onBind = () => {
    setGoogleBindCode(gk.value.bind.code)
        .then((res) => {
            alertx('绑定成功')
            onLoadData()
        })
        .catch((ex) => {
            alertx('绑定失败', ex)
        })
}
const onLoadData = () => {
    getGoogleBindTime()
        .then((res) => {
            gk.value.bindtime = res
            console.log('res', res)
            if (res == null || res === '') {
                onReloadQrCode()
            }
        })
        .catch((ex) => {
            alertx('获取上次绑定时间失败', ex)
        })
}
const onReloadQrCode = () => {
    getGoogleBindCode()
        .then((res) => {
            gk.value.bind.qrcode = res
        })
        .catch((ex) => {
            alertx('获取二维码失败', ex)
        })
}
onLoadData()
</script>

<template>
    <el-form :label-width="130">
        <div v-if="gk.bindtime != null && gk.bindtime !== ''">
            <el-form-item label="验证器绑定状态">
                <span> 已绑定，绑定时间：{{ gk.bindtime }} </span>
            </el-form-item>
            <el-form-item>
                <div style="text-align: center">
                    <el-button
                        type="danger"
                        @click="onRemove"
                        >删除验证器</el-button
                    >
                </div>
            </el-form-item>
        </div>
        <div v-else>
            <div>
                1、用手机上<a
                    target="_blank"
                    style="text-decoration: blink; color: blue"
                    href="https://update-2.lygeport.com/AppSetup/%E8%B0%B7%E6%AD%8C%E8%BA%AB%E4%BB%BD%E9%AA%8C%E8%AF%81%E5%99%A8.apk"
                    >身份验证器(点击下载)</a
                >扫此二维码，添加新的验证器。
                <br />
                <div style="text-align: center">
                    <ReQrcode :text="gk.bind.qrcode" />
                    <br />
                    <el-button
                        type="primary"
                        @click="onReloadQrCode"
                        >生成绑定二维码</el-button
                    >
                </div>
                <el-divider />
            </div>
            <p>
                2、将手机上新加的验证器中的校验码填写至录入框。
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;校验码：<el-input
                    v-model="gk.bind.code"
                    style="display: inline"
                    type="text"
                />
            </p>
            <p>
                3、点击下面的【绑定】按钮进行绑定，如果想取消，请点【取消】按钮。
                <br />
            </p>
            <div style="padding-left: 57px">
                <el-button
                    type="primary"
                    @click="onBind"
                    >绑定</el-button
                >
            </div>
        </div>
    </el-form>
</template>
