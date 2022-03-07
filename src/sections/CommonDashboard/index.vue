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
    }
  },
  computed: {
    progressList () {
      const cpu = getUsageData('cpu', this.resData, usageMap, this.scope)
      const memory = getUsageData('memory', this.resData, usageMap, this.scope)
      const disk = getUsageData('disk', this.resData, usageMap, this.scope)
      const ip = getUsageData('ip', this.resData, usageMap, this.scope)
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
          title: this.$t('common.text00048'),
          percent: memory.used.value / (memory.total.value || 1),
          msg: {
            current: memory.used.formatValue,
            total: memory.total.formatValue,
          },
        },
        {
          title: this.$t('dictionary.storage'),
          percent: disk.used.value / (disk.total.value || 1),
          msg: {
            current: disk.used.formatValue,
            total: disk.total.formatValue,
          },
        },
        {
          title: this.$t('common.text00050'),
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
          name: `${this.$t('common.text00051')}: ${f(serverMsg.running.value)}`,
          value: f(serverMsg.running.value),
        }, {
          name: `${this.$t('status.server.ready')}: ${f(serverMsg.ready.value)}`,
          value: f(serverMsg.ready.value),
        }, {
          name: `${this.$t('common.text00052')}: ${f(serverMsg.delete.value)}`,
          value: f(serverMsg.delete.value),
        }, {
          name: `${this.$t('common.text00053')}: ${f(serverMsg.other.value)}`,
          value: f(serverMsg.other.value),
        }],
        title: this.$t('common.text00054'),
        total: f(serverMsg.total.value),
      }
      const gpu = {
        pieData: [{
          name: `${this.$t('common.text00055')}: ${gpuMsg.used.value}`,
          value: f(gpuMsg.used.value),
        }, {
          name: `${this.$t('common.text00056')}: ${gpuMsg.total.value - gpuMsg.used.value}`,
          value: f(gpuMsg.total.value - gpuMsg.used.value),
        }],
        title: this.$t('common.text00057'),
        total: f(gpuMsg.total.value),
      }
      const host = {
        pieData: [{
          name: `${this.$t('status.enabled.true')}: ${hostMsg.used.value}`,
          value: f(hostMsg.used.value),
        }, {
          name: `${this.$t('common.text00058')}: ${hostMsg.total.value - hostMsg.used.value}`,
          value: f(hostMsg.total.value - hostMsg.used.value),
        }],
        title: this.$t('dictionary.host'),
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
      const manager = new Manager('usages')
      this.loading = true
      const params = { scope: this.scope }
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
