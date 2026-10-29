<template>
  <base-monitor
    v-if="ready"
    :data="data"
    :idKey="idKey"
    :constants="constants" />
</template>

<script>
import { MonitorHelper } from '@/utils/monitor'
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import { AGENT_TEMPERATURE_MONITOR } from '@Compute/views/vminstance/constants'

// agent_sensors 指标后端不一定采集，先用近 3 个月（2160h）的数据探测是否存在数据点
const AGENT_SENSORS_MEASUREMENT = 'agent_sensors'
const CHECK_FROM = '2160h'
const CHECK_INTERVAL = '2160h'

export default {
  name: 'AgentTemperatureMonitor',
  components: {
    BaseMonitor,
  },
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
    idKey: {
      type: String,
    },
  },
  data () {
    return {
      // 探测完成后才渲染面板，避免面板数组变化导致图表组件复用错误
      ready: false,
      // 有数据点的 agent_sensors 指标
      agentSensorsItems: [],
      helper: new MonitorHelper(this.$Manager, this.$store.getters.scope),
    }
  },
  computed: {
    serverId () {
      return this.data ? this.data.id : ''
    },
    constants () {
      return AGENT_TEMPERATURE_MONITOR.filter(item => {
        if (item.fromItem !== AGENT_SENSORS_MEASUREMENT) return true
        return this.agentSensorsItems.includes(item)
      })
    },
  },
  watch: {
    serverId: {
      handler (val) {
        if (!val) return
        this.ready = false
        this.checkAgentSensorsData()
      },
      immediate: true,
    },
  },
  methods: {
    async checkAgentSensorsData () {
      const items = AGENT_TEMPERATURE_MONITOR.filter(item => item.fromItem === AGENT_SENSORS_MEASUREMENT)
      try {
        const results = await Promise.all(items.map(item => {
          return this.helper.fetchData(this.serverId, item, CHECK_FROM, CHECK_INTERVAL, this.idKey, null, true)
        }))
        this.agentSensorsItems = items.filter((item, index) => {
          const series = (results[index] && results[index].series) || []
          return series.some(serie => serie.points && serie.points.length)
        })
      } catch (e) {
        this.agentSensorsItems = []
      } finally {
        this.ready = true
      }
    },
  },
}
</script>
