<template>
  <div class="overview-index">
    <a-row>
      <a-col style="padding-left: 6px; padding-right: 6px;" :span="8">
        <overview-pie class="monitor-overview-card mb-2" :loading="charts.alert_sum.chartLoading" :chartData="charts.alert_sum.chartData" showLegend="true" :legendData="charts.alert_sum.legendData" :pieTitle="charts.alert_sum.title" :pieSubtext="charts.alert_sum.subtitle" />
      </a-col>
      <a-col style="padding-left: 6px; padding-right: 6px;" :span="16">
        <overview-line :header="{ title: charts.res_num.title }" class="monitor-overview-card mb-2" height="279px" :loading="charts.res_num.chartLoading"  :isHistogram="true" :chartData="charts.res_num.chartData" />
      </a-col>
    </a-row>
    <a-row>
      <a-col  style="padding-left: 6px; padding-right: 6px;" :span="24">
        <div class="monitor-overview-card mb-2">
          <div class="float-left">
            <a-radio-group v-model="activeTab" @change="radioChange">
              <a-radio-button :value="item.key" v-for="item in tabs" :key="item.key">{{ item.label }}</a-radio-button>
            </a-radio-group>
          </div>
          <div :style="{'margin-top': '30px'}" v-if="scope!=='project'">
            <overview-line :header="{ title: charts[activeTab].title }" :loading="charts[activeTab].chartLoading"  :isHistogram="false" :chartData="charts[activeTab].chartData" :unit="charts[activeTab].unit" />
          </div>
          <div :style="{'margin-top': '30px'}" v-else>
            <overview-line :header="{ title: charts[activeTab].title }" :loading="charts[activeTab].chartLoading"  :isHistogram="true" height="320px" :chartData="charts[activeTab].chartData" :chartSettings="{ showLine: charts[activeTab].chartData.columns}" :unit="charts[activeTab].unit" />
          </div>
        </div>
      </a-col>
    </a-row>
    <a-row  v-if="tableData.showtable">
      <a-col>
        <div class="table">
          <vxe-grid
            class="mt-4"
            size="mini"
            border
            :columns="tableData.columns"
            max-height="400"
            :data="tableData.rows" />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import OverviewLine from '@Monitor/components/OverviewLine'
import OverviewPie from '@Monitor/components/OverviewPie'
import { getSignature } from '@/utils/crypto'
import i18n from '@/locales'

const allTabs = {
  usage_active: {
    label: i18n.t('monitor.metrics_vm_cpu_usage_active'),
    measurement: 'vm_cpu',
    key: 'usage_active',
    index: 1,
  },
  bps_recv: {
    label: i18n.t('monitor_metric_36'),
    measurement: 'vm_netio',
    key: 'bps_recv',
    index: 2,
  },
  bps_sent: {
    label: i18n.t('monitor_metric_35'),
    measurement: 'vm_netio',
    key: 'bps_sent',
    index: 3,
  },
  read_bps: {
    label: i18n.t('monitor_metric_79'),
    measurement: 'vm_diskio',
    key: 'read_bps',
    index: 4,
  },
  write_bps: {
    label: i18n.t('monitor_metric_80'),
    measurement: 'vm_diskio',
    key: 'write_bps',
    index: 5,
  },
}

function newChart (title, subtitle, label) {
  const chart = {
    label: label,
    title: '',
    subtitle: '',
    rawDatas: {},
    chartLoading: false,
    chartUint: {},
    chartData: {
      columns: [],
      rows: [],
    },
  }
  if (title) {
    chart.title = i18n.t(title)
  }
  if (subtitle) {
    chart.subtitle = i18n.t(subtitle)
  }

  return chart
}

export default {
  name: 'OverviewIndex',
  components: {
    OverviewPie,
    OverviewLine,
  },
  data () {
    const tabs = Object.values(allTabs).sort((a, b) => {
      return allTabs[a.key].index - allTabs[b.key].index
    })

    const charts = {}
    for (const k in allTabs) {
      charts[k] = newChart(`monitor.overview_${k}`, '', allTabs[k].labal)
    }

    charts.alert_sum = newChart('monitor.overview_alert_sum', '', '')
    charts.res_num = newChart('monitor.overview_alert_trend', '', '')
    return {
      scope: this.$store.getters.scope,
      tabs: tabs,
      activeTab: tabs[0].key,
      charts: charts,
      tableData: {
        showtable: (this.$store.getters.scope !== 'project'),
        columns: [],
        rows: [],
      },
      units: {}, // 度量单位
    }
  },
  watch: {
    scope () {
      this.fetchAllData()
    },
  },
  created () {
    this.fetchAllData()
  },
  methods: {
    radioChange: function (e) {
      const tab = allTabs[this.activeTab]
      this.fetchTabChartData(tab.measurement, tab.key)
    },
    async fetchAllData () {
      await this.fetchMeasurementsData()
      await this.fetchPieChartData()
      // 近30日告警趋势图
      await this.fetchTabChartData('alert_record_history', 'res_num')
      // 近7日图
      const tab = allTabs[this.activeTab]
      await this.fetchTabChartData(tab.measurement, tab.key)
      // table
      await this.fetchTableData()
    },
    fetchMeasurementsData () {
      try {
        const data = {
          from: '168h',
          scope: this.$store.getters.scope,
        }
        data.signature = getSignature(data)
        this.units = {}
        const self = this
        new this.$Manager('unifiedmonitors', 'v1').get({ id: 'measurements', data }).then((res) => {
          if (!res.data.res_type_measurements) {
            return
          }
          const ms = res.data.res_type_measurements
          for (const k in ms) {
            const m = ms[k]
            for (const mk in m) {
              if (m[mk].field_descriptions) {
                const fds = m[mk].field_descriptions
                for (const fdk in fds) {
                  const v = fds[fdk]
                  self.units[m[mk].measurement + '/' + v.name] = { labal: i18n.t(v.display_name), unit: v.unit }
                }
              }
            }
          }
        })
      } catch (error) {
        throw error
      }
    },
    chartQueryData (measurement, field) {
      if (measurement === 'alert_record_history' && field === 'res_num') {
        return {
          from: '720h',
          interval: '24h',
          metric_query: [
            {
              model: {
                database: 'telegraf',
                measurement: measurement,
                select: [
                  [{ params: [field], type: 'field' }, { type: 'sum' }],
                ],
              },
            },
          ],
          scope: this.scope,
          unit: true,
        }
      }

      const from = '168h'
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
              group_by: [{ type: 'field', params: [group] }],
            },
          },
        ],
      }
    },
    tabChartData (field, rawDatas, unit) {
      const chartData = {
        columns: [],
        rows: [],
      }

      if (rawDatas) {
        if (!allTabs[field]) {
          // 30天
          if (rawDatas[0] && rawDatas[0].points && rawDatas[0].points.length) {
            const points = rawDatas[0].points
            let series = points.map((item) => {
              return { name: item[1], value: item[0] }
            })
            series = series.sort((a, b) => {
              return a.name - b.name
            })
            chartData.columns = ['raw_name', 'value']
            chartData.rows = series.map((item) => {
              const v = new Date(item.name)
              return { raw_name: `${v.getMonth()}-${v.getDate()}`, value: item.value }
            })
          }
        } else if (this.scope === 'project') {
          // vm
          if (rawDatas.length) {
            chartData.columns = ['time']
            const datas = {}
            rawDatas.map((item) => {
              // cloumn
              const cloumnName = item.tags.tenant
              chartData.columns.push(cloumnName)
              item.points.map((point) => {
                if (datas[point[1]]) {
                  datas[point[1]][cloumnName] = parseFloat(point[0].toFixed(2))
                } else {
                  datas[point[1]] = {}
                  datas[point[1]].time = point[1]
                  datas[point[1]][cloumnName] = parseFloat(point[0].toFixed(2))
                }
              })
            })

            const dataKeys = Object.keys(datas).sort((a, b) => { return a - b })
            for (const k of dataKeys) {
              const d = new Date(datas[k].time)
              const darr = [String(d.getMonth() + 1), String(d.getDate()), String(d.getHours()), String(d.getMinutes())]
              for (const i in darr) {
                if (darr[i].length < 2) {
                  darr[i] = '0' + darr[i]
                }
              }
              datas[k].time = `${darr[0]}/${darr[1]} ${darr[2]}:${darr[3]}`
              chartData.rows.push(datas[k])
            }
          }
        } else {
          // 域/项目
          const series = rawDatas.map((item) => {
            return { name: item.tags.tenant || item.tags.project_domain, value: item.points[0][0] }
          })
          if (series.length) {
            chartData.columns = ['raw_name', 'value']
            chartData.rows = series.map((item) => {
              return { raw_name: item.name, value: parseFloat(item.value.toFixed(2)) }
            }).sort((a, b) => {
              return a.value - b.value
            })
          }
        }
      }
      return chartData
    },
    async fetchTabChartData (measurement, field) {
      try {
        if (Object.values(this.charts[field].chartData.rows).length) {
          return this.charts[field].chartData
        }
        this.charts[field].chartLoading = true
        var data = this.chartQueryData(measurement, field)
        data.signature = getSignature(data)
        const { data: { series = [] } } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data })
        this.charts[field].chartLoading = true
        this.charts[field].rawDatas = []
        this.charts[field].chartData = {}
        const self = this
        this.$nextTick(_ => {
          this.charts[field].rawDatas = series
          this.charts[field].unit = self.units[measurement + '/' + field] || []
          this.charts[field].chartData = self.tabChartData(field, series, this.charts[field].unit)
          this.charts[field].chartLoading = false
        })
      } catch (error) {
        this.charts[field].chartLoading = false
        throw error
      }
    },
    async fetchPieChartData () {
      try {
        const params = { scope: this.scope }
        const { data: series = { } } = await new this.$Manager('alertrecords', 'v1').get({ id: 'total-alert', params: params })
        this.charts.alert_sum.chartLoading = true
        this.charts.alert_sum.rawDatas = {}
        this.charts.alert_sum.chartData = {}

        this.$nextTick(_ => {
          const chartData = {
            columns: [],
            rows: [],
          }
          let count = 0
          if (Object.keys(series).length > 0) {
            chartData.columns = ['name', 'count']
            for (const item in series) {
              count += series[item]
              chartData.rows.push({ name: this.$t(`dictionary.${item}`), count: series[item] })
            }
          }
          this.charts.alert_sum.subtitle = String(count)
          this.charts.alert_sum.rawDatas = series
          this.charts.alert_sum.chartData = chartData
          this.charts.alert_sum.chartLoading = false
        })
      } catch (error) {
        this.charts.alert_sum.chartLoading = false
        throw error
      }
    },
    async fetchTableData () {
      this.tableData.showtable = false
      let scopeTitle = ''
      if (this.scope === 'project') {
        return
      } else if (this.scope === 'system') {
        scopeTitle = this.$t('dictionary.domain')
      } else if (this.scope === 'domain') {
        scopeTitle = this.$t('dictionary.project')
      }
      for (const t in allTabs) {
        const tab = allTabs[t]
        await this.fetchTabChartData(tab.measurement, tab.key)
      }
      this.tableData.columns = [{ field: 'scope', title: scopeTitle }]
      this.tableData.rows = []
      this.$nextTick(_ => {
        this.tableData.showtable = true
        var datas = {}
        for (const k in allTabs) {
          const chart = this.charts[k].chartData
          this.tableData.columns.push({ field: k, title: this.charts[k].title })
          for (let i = 0; i < chart.rows.length; i++) {
            const name = chart.rows[i].raw_name
            if (datas[name]) {
              datas[name][k] = chart.rows[i].value
            } else {
              const item = { scope: name }
              item[k] = chart.rows[i].value
              datas[name] = item
            }
          }
        }
        for (const k in datas) {
          this.tableData.rows.push(datas[k])
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.monitor-overview-card {
  border: 1px solid #F1F1F1;
  padding: 12px 24px;
  .header {
    font-weight: 500;
    .title-wrapper {
      .subtitle {
        font-size: 12px;
        color: #ccc;
      }
    }
  }
}
</style>
