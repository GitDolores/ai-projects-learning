<template>
    <div class="main main-content">
        <div class="stat-cards grid grid-cols-4 gap-4 mb-4">
            <el-card shadow="hover">
                <div class="text-center">
                    <div class="text-gray-500 text-sm">激活任务数</div>
                    <div class="text-3xl font-bold text-blue-500 mt-2">{{ dashboard.ActiveTasksCount }}</div>
                </div>
            </el-card>
            <el-card shadow="hover">
                <div class="text-center">
                    <div class="text-gray-500 text-sm">今日执行总次数</div>
                    <div class="text-3xl font-bold mt-2">{{ dashboard.TodayTotalExecutions }}</div>
                </div>
            </el-card>
            <el-card shadow="hover">
                <div class="text-center">
                    <div class="text-gray-500 text-sm">今日成功</div>
                    <div class="text-3xl font-bold text-green-500 mt-2">{{ dashboard.TodaySuccessExecutions }}</div>
                </div>
            </el-card>
            <el-card shadow="hover">
                <div class="text-center">
                    <div class="text-gray-500 text-sm">今日失败</div>
                    <div class="text-3xl font-bold text-red-500 mt-2">{{ dashboard.TodayFailedExecutions }}</div>
                </div>
            </el-card>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <el-card shadow="never" header="今日每分钟执行次数">
                <div ref="perMinuteChart" style="height: 350px" />
            </el-card>
            <el-card shadow="never" header="执行结果分布（今日）">
                <div ref="pieChart" style="height: 350px" />
            </el-card>
        </div>

        <div class="grid grid-cols-1 gap-4 mt-4">
            <el-card shadow="never" header="近24小时成功/失败趋势">
                <div ref="hourlyLineChart" style="height: 350px" />
            </el-card>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
            <el-card shadow="never" header="每种任务今日执行次数">
                <div ref="todayPerTaskChart" style="height: 350px" />
            </el-card>
            <el-card shadow="never" header="每种任务昨日成功次数">
                <div ref="yesterdayPerTaskChart" style="height: 350px" />
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getDashboard, SuperJobDashboardData } from '@/api/superjob'

const dashboard = ref<SuperJobDashboardData>({
    ActiveTasksCount: 0,
    TodayTotalExecutions: 0,
    TodaySuccessExecutions: 0,
    TodayFailedExecutions: 0,
    PerMinuteExecutions: [],
    TodayPerTaskExecutions: [],
    YesterdayPerTaskSuccessCount: [],
    HourlySuccessFail: [],
})

const perMinuteChart = ref<HTMLElement>()
const pieChart = ref<HTMLElement>()
const todayPerTaskChart = ref<HTMLElement>()
const yesterdayPerTaskChart = ref<HTMLElement>()
const hourlyLineChart = ref<HTMLElement>()

function renderCharts() {
    if (perMinuteChart.value) {
        const chart1 = echarts.init(perMinuteChart.value)
        chart1.setOption({
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category' as const,
                data: dashboard.value.PerMinuteExecutions.map((x) => x.Label),
            },
            yAxis: { type: 'value' as const, name: '执行次数' },
            series: [
                {
                    type: 'bar' as const,
                    data: dashboard.value.PerMinuteExecutions.map((x) => x.Value),
                    itemStyle: { color: '#409eff' },
                },
            ],
        })
    }

    if (pieChart.value) {
        const chart2 = echarts.init(pieChart.value)
        chart2.setOption({
            tooltip: { trigger: 'item' as const },
            legend: { bottom: 0 },
            series: [
                {
                    type: 'pie' as const,
                    radius: ['40%', '70%'],
                    data: [
                        { name: '成功', value: dashboard.value.TodaySuccessExecutions, itemStyle: { color: '#67c23a' } },
                        { name: '失败', value: dashboard.value.TodayFailedExecutions, itemStyle: { color: '#f56c6c' } },
                    ],
                },
            ],
        })
    }

    if (todayPerTaskChart.value) {
        const chart3 = echarts.init(todayPerTaskChart.value)
        chart3.setOption({
            tooltip: { trigger: 'axis' as const },
            xAxis: { type: 'value' as const, name: '次数' },
            yAxis: {
                type: 'category' as const,
                data: dashboard.value.TodayPerTaskExecutions.map((x) => x.Label).reverse(),
                inverse: true,
            },
            series: [
                {
                    type: 'bar' as const,
                    data: dashboard.value.TodayPerTaskExecutions.map((x) => x.Value).reverse(),
                    itemStyle: { color: '#409eff' },
                    label: { show: true, position: 'right' as const },
                },
            ],
        })
    }

    if (yesterdayPerTaskChart.value) {
        const chart4 = echarts.init(yesterdayPerTaskChart.value)
        chart4.setOption({
            tooltip: { trigger: 'axis' as const },
            xAxis: { type: 'value' as const, name: '次数' },
            yAxis: {
                type: 'category' as const,
                data: dashboard.value.YesterdayPerTaskSuccessCount.map((x) => x.Label).reverse(),
                inverse: true,
            },
            series: [
                {
                    type: 'bar' as const,
                    data: dashboard.value.YesterdayPerTaskSuccessCount.map((x) => x.Value).reverse(),
                    itemStyle: { color: '#67c23a' },
                    label: { show: true, position: 'right' as const },
                },
            ],
        })
    }

    if (hourlyLineChart.value) {
        const chart5 = echarts.init(hourlyLineChart.value)
        chart5.setOption({
            tooltip: { trigger: 'axis' as const },
            legend: { data: ['成功', '失败'], orient: 'vertical', right: 0, top: 'center' },
            xAxis: {
                type: 'category' as const,
                data: dashboard.value.HourlySuccessFail.map((x) => x.Hour),
                axisLabel: { rotate: 45 },
            },
            yAxis: [
                { type: 'value' as const, name: '成功次数' },
                { type: 'value' as const, name: '失败次数' },
            ],
            series: [
                {
                    name: '成功',
                    type: 'line' as const,
                    data: dashboard.value.HourlySuccessFail.map((x) => x.SuccessCount),
                    itemStyle: { color: '#67c23a' },
                    smooth: true,
                },
                {
                    name: '失败',
                    type: 'line' as const,
                    yAxisIndex: 1,
                    data: dashboard.value.HourlySuccessFail.map((x) => x.FailCount),
                    itemStyle: { color: '#f56c6c' },
                    smooth: true,
                },
            ],
        })
    }
}

onMounted(async () => {
    dashboard.value = (await getDashboard()) || dashboard.value
    await nextTick()
    renderCharts()
})
</script>
