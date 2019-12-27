<template>
  <a-spin :spinning="loading">
    <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
      <a-col class="mb-3" :lg="12" :xl="6" v-for="item in progressList" :key="item.label">
        <progress-card :progress="item" />
      </a-col>
    </a-row>
    <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
      <a-col class="mb-3" :lg="12" :xl="8" v-for="item in ringCardsList" :key="item.title">
        <ring-card :options="item" height="150px" />
      </a-col>
    </a-row>
  </a-spin>
</template>

<script>
import ProgressCard from '@/sections/ProgressCard'
import RingCard from '@/sections/RingCard'
import { Manager } from '@/utils/manager'
import { usageMap, getUsageData } from '@/constants/generalUsage'

const f = v => v || 0

export default {
  name: 'CommonDashboard',
  components: {
    ProgressCard,
    RingCard,
  },
  props: {
    rangeId: {
      type: String,
      required: true,
    },
    rangeType: {
      type: String,
      required: true,
    },
  },
  data: function () {
    return {
      scope: this.$store.getters.scope,
      isDomainMode: this.$store.getters.isDomainMode,
      loading: false,
      resData: {},
      progress: {
        percent: 110,
        title: 'CPU',
        msg: {
          current: 11,
          total: 55,
        },
      },
      chartData: {
        columns: ['日期', '访问用户', '下单用户', '下单率'],
        rows: [
          { '日期': '1/1', '访问用户': 1393, '下单用户': 1093, '下单率': 0.32 },
          { '日期': '1/2', '访问用户': 3530, '下单用户': 3230, '下单率': 0.26 },
          { '日期': '1/3', '访问用户': 2923, '下单用户': 2623, '下单率': 0.76 },
          { '日期': '1/4', '访问用户': 1723, '下单用户': 1423, '下单率': 0.49 },
          { '日期': '1/5', '访问用户': 3792, '下单用户': 3492, '下单率': 0.323 },
          { '日期': '1/6', '访问用户': 4593, '下单用户': 4293, '下单率': 0.78 },
        ],
      },
    }
  },
  computed: {
    progressList () {
      const cpu = getUsageData('cpu', this.resData, usageMap, this.scope)
      const memory = getUsageData('memory', this.resData, usageMap, this.scope)
      const disk = getUsageData('disk', this.resData, usageMap, this.scope)
      const ip = getUsageData('ip', this.resData, usageMap, this.scope)
      console.log(cpu, memory, disk, ip)

      return [
        {
          title: 'CPU',
          percent: cpu.used.value / (cpu.total.value || 1),
          msg: {
            current: cpu.used.formatValue,
            total: cpu.total.formatValue,
          },
        },
        {
          title: '内存',
          percent: memory.used.value / (memory.total.value || 1),
          msg: {
            current: memory.used.formatValue,
            total: memory.total.formatValue,
          },
        },
        {
          title: '磁盘',
          percent: disk.used.value / (disk.total.value || 1),
          msg: {
            current: disk.used.formatValue,
            total: disk.total.formatValue,
          },
        },
        {
          title: '私有IP',
          percent: ip.used.value / (ip.total.value || 1),
          msg: {
            current: ip.used.formatValue,
            total: ip.total.formatValue,
          },
        },
      ]
    },
    ringCardsList () {
      const serverMsg = getUsageData('server', this.resData, usageMap, this.scope)
      const gpuMsg = getUsageData('gpu', this.resData, usageMap, this.scope)
      const hostMsg = getUsageData('host', this.resData, usageMap, this.scope)
      const server = {
        pieData: [{
          name: `运行: ${f(serverMsg.running.value)}`,
          value: f(serverMsg.running.value),
        }, {
          name: `关机: ${f(serverMsg.ready.value)}`,
          value: f(serverMsg.ready.value),
        }, {
          name: `回收站: ${f(serverMsg.delete.value)}`,
          value: f(serverMsg.delete.value),
        }, {
          name: `其他: ${f(serverMsg.other.value)}`,
          value: f(serverMsg.other.value),
        }],
        title: '虚拟主机',
        total: f(serverMsg.total.value),
      }
      const gpu = {
        pieData: [{
          name: `使用: ${gpuMsg.used.value}`,
          value: f(gpuMsg.used.value),
        }, {
          name: `未使用: ${gpuMsg.total.value - gpuMsg.used.value}`,
          value: f(gpuMsg.total.value - gpuMsg.used.value),
        }],
        title: '透传设备（GPU）',
        total: f(gpuMsg.total.value),
      }
      const host = {
        pieData: [{
          name: `启用: ${hostMsg.used.value}`,
          value: f(hostMsg.used.value),
        }, {
          name: `未启用: ${hostMsg.total.value - hostMsg.used.value}`,
          value: f(hostMsg.total.value - hostMsg.used.value),
        }],
        title: '宿主机',
        total: f(hostMsg.total.value),
      }
      let dataList = [host, server, gpu]
      if (this.isDomainMode) {
        dataList = [server, gpu]
      }
      return dataList
    },
  },
  watch: {
    rangeId () {
      this.fetchData()
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      let manager = new Manager('usages')
      this.loading = true
      let params = { scope: this.scope }
      manager.getSpecific({
        id: this.rangeType,
        spec: this.rangeId,
        params,
      }).then(res => {
        this.loading = false
        this.resData = res.data
      }).catch(() => {
        this.loading = false
      })
    },
  },
}
</script>
