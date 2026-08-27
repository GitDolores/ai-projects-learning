import axios from 'axios'

const comreport = {}
// create an axios instance
const service = axios.create()

comreport.service = service
let option = {
    baseURL: 'http://localhost:9007',
    templateedit: 'templateedit',
    templateprint: 'templateprint',
    print: 'print',
    vue_app_base_api: null,
    loading_open: null,
    loading_close: null,
    msg: null,
}

const showmsg = (msg) => {
    if (option.msg == null) {
        alert(msg)
    } else {
        option.msg(msg)
    }
}

const loading_open = (msg) => {
    if (option.loading_open != null && option.loading_close != null) {
        return option.loading_open(msg)
    }
}

const loading_close = (msg) => {
    if (option.loading_open != null && option.loading_close != null) {
        option.loading_close(msg)
    }
}
// {baseurl:'http://localhost:9007'}
comreport.init = function (opt) {
    option = Object.assign(option, opt)
}
const runcmd = async (cmdid, cmdurl, templatecmd) => {
    if (option.vue_app_base_api == null) {
        showmsg('未在comreport.init()中配置业务api的基地址：vue_app_base_api')
        return
    }
    const load = loading_open('正在执行指令：' + templatecmd)
    const cmd = encodeURIComponent(option.vue_app_base_api.replace(/\/*$/gi, '') + cmdurl + cmdid)
    try {
        await service({
            url: option.baseURL + '/' + templatecmd + '?cmdurl=' + cmd,
            method: 'get',
        })
        console.log('指令发送成功')
    } catch {
        const msg = '未能连接到您本地的ComReport通用打印工具，请选择安装或打开？\n\n确定：打开已经安装的程序。 取消：则进行下载。'
        if (confirm(msg) === true) {
            window.open('comreport://webstart/' + templatecmd + '?cmdurl=' + encodeURIComponent(option.vue_app_base_api.replace(/\/*$/gi, '') + cmdurl + cmdid))
        } else {
            window.open('https://update-2.lygeport.com/AppSetup/ComReport_0.0.1_Setup.exe')
        }
    } finally {
        loading_close(load)
    }
}
comreport.templateedit = async (cmdid) => {
    await runcmd(cmdid, '/api/mpa/comreport/cmd/cmd-edit?cmdid=', option.templateedit)
}
comreport.templateprint = async (cmdid) => {
    await runcmd(cmdid, '/api/mpa/comreport/cmd/cmd-print?cmdid=', option.templateprint)
}
comreport.print = async (cmdid) => {
    await runcmd(cmdid, '/api/mpa/comreport/cmd/cmd-print?cmdid=', option.print)
}

export default comreport
