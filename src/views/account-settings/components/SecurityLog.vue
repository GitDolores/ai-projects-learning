<script setup lang="ts">
import dayjs from 'dayjs'
import { DtoLoginLog, getMineLogs } from '@/api/user'
import { reactive, ref, onMounted } from 'vue'
import { deviceDetection } from '@pureadmin/utils'
import { type VxeGridPropTypes } from 'vxe-table'

defineOptions({
    name: 'SecurityLog',
})

const loading = ref(true)
const dataList = ref([])
const pagination = reactive<VxeGridPropTypes.PagerConfig>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true,
    pageSizes: [5, 10, 15, 20],
})

const pagerConfig = reactive({
    total: 0,
    currentPage: 1,
    pageSize: 10,
    pageSizes: [5, 10, 15, 20],
})

const columns: VxeGridPropTypes.Columns<DtoLoginLog> = [
    {
        title: '本次Token',
        field: 'Token',
        minWidth: 140,
    },
    {
        title: '时间',
        field: 'MsgTime',
        minWidth: 180,
        formatter: (data) => dayjs(data.row.MsgTime).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        title: 'IP 地址',
        field: 'UserIP',
        minWidth: 100,
    },
    {
        title: '地点',
        field: 'Location',
        minWidth: 100,
    },
    {
        title: '动作',
        minWidth: 100,
        formatter: (x) => {
            if (x.row.PreToken != null && x.row.PreToken !== '') {
                return '保持在线'
            } else {
                return '新登陆'
            }
        },
    },
    {
        title: '上次Token',
        field: 'PreToken',
        minWidth: 140,
    },
]
async function handlePageChange({ currentPage, pageSize }) {
    pagination.currentPage = currentPage
    pagination.pageSize = pageSize
    onSearch()
}
async function onSearch() {
    loading.value = true
    const data = await getMineLogs(pagination.currentPage, pagination.pageSize)
    dataList.value = data.List
    pagination.total = data.Total

    setTimeout(() => {
        loading.value = false
    }, 200)
}

onMounted(() => {
    onSearch()
})
</script>

<template>
    <div :class="['min-w-[180px]', deviceDetection() ? 'max-w-[100%]' : 'max-w-[70%]']">
        <vxe-grid
            ref="vxeTableRef"
            v-loading="loading"
            show-overflow
            :column-config="{ resizable: true }"
            :columns="columns"
            :pagerConfig="pagination"
            :data="dataList"
            @page-change="handlePageChange"
        />
    </div>
</template>
