<template>
  <div class="overview-index">
    <a-row>
      <a-col :span="8" :style="{'min-height': '120px', 'line-height': '120px', 'color': '#fff', 'background': 'rgb(233,172,16)'}">饼图</a-col>
      <a-col :span="16">
        柱状图
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <div class="float-left">
          <a-radio-group v-model="activeTab" @change="radioChange">
            <a-radio-button :value="item.key" v-for="item in tabs" :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </div>
        <div>
          <overview-line :loading="chartLoading"  :isHistogram="false" :chartData="series" />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import OverviewLine from '@Monitor/components/OverviewLine'
import { getSignature } from '@/utils/crypto'
import i18n from '@/locales'

const allTabs = {
  'cpu-usage': {
    label: i18n.t('monitor.metrics_vm_cpu_usage_active'),
    key: 'cpu-usage',
    index: 1,
  },
  'network-recv': {
    label: i18n.t('monitor_metric_36'),
    key: 'network-recv',
    index: 2,
  },
  'network-send': {
    label: i18n.t('monitor_metric_35'),
    key: 'network-send',
    index: 3,
  },
  'disk-read': {
    label: i18n.t('monitor_metric_79'),
    key: 'disk-read',
    index: 4,
  },
  'disk-write': {
    label: i18n.t('monitor_metric_80'),
    key: 'disk-write',
    index: 5,
  },
}

// 属性: 无
// 数据:
// 计算数据: scopeParams、alertSumSeries、alertTrendSeries、cpuUsageSeries、networkIngressSeries、networkEgressSeries、diskReadSeries、diskWriteSeries
// 组建: MonitorLineChart、MonitorBarChart
export default {
  name: 'OverviewIndex',
  comments: { OverviewLine },
  components: { OverviewLine },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const tabs = Object.values(allTabs).sort((a, b) => {
      return allTabs[a.key].index - allTabs[b.key].index
    })

    return {
      chartLoading: false,
      scope: this.$store.getters.scope,
      tabs: tabs,
      activeTab: tabs[0].key,
      tabsSeries: {},
      series: [],
    }
  },
  watch: {
    scope () {
      this.fetchChartDatas()
    },
    tabsSeries () {
      debugger
      this.activeTab = this.tabs[0].key
      this.series = this.tabsSeries[this.activeTab] || []
    },
  },
  created () {
    this.fetchChartDatas()
  },
  methods: {
    radioChange: function (e) {
      this.series = this.tabsSeries[e.target.value] || []
    },
    chartQueryData (measurement, field) {
      var from = '168h'
      let group = 'tenant'
      let interval = from
      if (this.scope === 'system') {
        group = 'project_domain'
      }

      if (this.scope === 'project') {
        interval = '1h'
      }

      return {
        from: from,
        interval: interval,
        scope: this.scope,
        metric_query: [
          {
            model: {
              database: 'telegraf',
              measurement: measurement,
              select: [
                [{ params: [field], type: 'field' }],
              ],
            },
          },
        ],
        group_by: [{ type: 'field', params: [group] }],
      }
    },
    async fetchChartDatas () {
      // // alertSumSeries 告警总数
      // const as = this.chartQueryData('{0}h'.format(24 * 7), '1h', 'vm_cpu', 'usage_active')
      // // alertTrendSeries 近30天告警趋势图
      // const at = this.chartQueryData('{0}h'.format(24 * 7 * 30), '24h', 'vm_cpu', 'usage_active')
      // cpuUsageSeries 近7日cpu使用率
      const cu = this.chartQueryData('vm_cpu', 'usage_active')
      // networkRecvSeries 近7日网络入流量
      const nr = this.chartQueryData('vm_netio', 'bps_recv')
      // networkSentSeries 近7日网络出流量
      const ns = this.chartQueryData('vm_netio', 'bps_sent')
      // diskReadSeries 近7日硬盘读速率
      const dr = this.chartQueryData('vm_diskio', 'read_bps')
      // diskWriteSeries 近7日硬盘写速率
      const dw = this.chartQueryData('vm_diskio', 'write_bps')

      try {
        this.chartLoading = true
        var cud = await this.fetchData(cu)
        var nrd = await this.fetchData(nr)
        var nsd = await this.fetchData(ns)
        var drd = await this.fetchData(dr)
        var dwd = await this.fetchData(dw)
        this.tabsSeries = {}

        this.$nextTick(_ => {
          this.tabsSeries['cpu-usage'] = cud
          this.tabsSeries['network-recv'] = nrd
          this.tabsSeries['network-send'] = nsd
          this.tabsSeries['disk-read'] = drd
          this.tabsSeries['disk-wirte'] = dwd
          this.chartLoading = false
        })
      } catch (error) {
        this.chartLoading = false
        throw error
      }
    },
    async fetchData (data) {
      try {
        data.signature = getSignature(data)
        const { data: { series = [] } } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data })
        return series
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style scoped>

</style>
