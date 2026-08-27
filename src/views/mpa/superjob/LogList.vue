<template>
  <div class="main main-content">
    <el-card shadow="never">
      <div class="mb-4">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item label="任务名称">
            <el-select v-model="searchForm.jobCode" placeholder="全部" clearable filterable style="width: 280px">
              <el-option
                v-for="item in taskOptions"
                :key="item.JobCode"
                :label="`${item.JobName} (${item.JobCode})`"
                :value="item.JobCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px">
              <el-option label="成功" value="DONE" />
              <el-option label="失败" value="FAILED" />
              <el-option label="重试中" value="RETRYING" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">搜索</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" border stripe v-loading="loading" height="calc(100vh - 320px)">
        <el-table-column prop="JobCode" label="任务代码" width="150" />
        <el-table-column prop="JobName" label="任务名称" width="160" />
        <el-table-column prop="ScheduledAt" label="计划执行" width="160" />
        <el-table-column prop="StartTime" label="开始时间" width="160" />
        <el-table-column label="耗时(ms)" width="90">
          <template #default="{ row }">{{ row.DurationMs }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.Status === 'DONE' ? 'success' : row.Status === 'FAILED' ? 'danger' : 'warning'">
              {{ row.Status === 'DONE' ? '成功' : row.Status === 'FAILED' ? '失败' : '重试' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ResultMsg" label="结果" min-width="200" show-overflow-tooltip />
        <el-table-column prop="InstanceId" label="执行实例" width="180" show-overflow-tooltip />
        <el-table-column prop="CreateAt" label="记录时间" width="160" />
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 30, 50]"
          size="small"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { getLogPage, getActiveConfigList, SuperJobLogItem, SuperJobConfigItem } from '@/api/superjob'
import { ElMessage } from 'element-plus'

const route = useRoute()

const searchForm = reactive({
  timeRange: null as [string, string] | null,
  jobCode: '',
  status: ''
})

const taskOptions = ref<SuperJobConfigItem[]>([])
const tableData = ref<SuperJobLogItem[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, limit: 20, total: 0 })

onMounted(async () => {
  taskOptions.value = await getActiveConfigList() || []

  const qJobCode = route.query.jobCode as string
  const qJobName = route.query.jobName as string
  if (qJobCode) {
    const exists = taskOptions.value.find(t => t.JobCode === qJobCode)
    if (exists) {
      searchForm.jobCode = qJobCode
    } else {
      ElMessage.warning(`没有此名称的任务：${qJobName || qJobCode}`)
    }
  }

  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, limit: pagination.limit }
    if (searchForm.jobCode) params.jobCode = searchForm.jobCode
    if (searchForm.status) params.status = searchForm.status
    if (searchForm.timeRange) {
      params.startTime = searchForm.timeRange[0]
      params.endTime = searchForm.timeRange[1]
    }
    const res = await getLogPage(params)
    tableData.value = res.List || []
    pagination.total = res.Total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  pagination.page = 1
  loadData()
}

function onReset() {
  searchForm.timeRange = null
  searchForm.jobCode = ''
  searchForm.status = ''
  onSearch()
}
</script>
