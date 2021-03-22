<template>
  <div class="overview-index">
    <a-row v-if="scope !=='project'">
      <overview-nav :items="navs" @change="changeNav" />
    </a-row>
    <a-row>
      <a-col :span="8">
        <div class="monitor-overview-chart mb-2">
          <div class="title-wrapper float-left">
            <div class="title">{{ $t('monitor.overview_alert_sum') }}</div>
          </div>
          <overview-ring
            yAxisFormat="0"
            :chartData="ringChart.chartData"
            :chartEvents="ringChartEvent()"
            :title="$t('monitor.overview_alert_sum_pie')"
            :subtitle="ringChart.subtitle"
            :loading="ringChart.loading" />
        </div>
      </a-col>
      <a-col :span="16">
        <div class="monitor-overview-chart mb-2">
          <div class="title-wrapper">
            <div class="title">{{  $t('monitor.overview_alert_trend') }}</div>
          </div>
          <overview-line
            yAxisFormat="0.00"
            chartHeigth="299px"
            :chartData="lineChart.chartData"
            :loading="lineChart.loading"  />
        </div>
      </a-col>
    </a-row>
    <a-row>
      <a-col style="padding-left: 6px; padding-right: 6px; padding-bottom: 6px" :span="24">
        <a-radio-group v-model="dimentionId">
          <a-radio-button :value="item.id" v-for="item in dimentions" :key="item.label">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row>
      <overview-card :scope="curNav.scope" :dimension="dimention" :extraParams="extraParams" @changeNav="updateNavs" />
    </a-row>
  </div>
</template>

<script>
import { measurementsUnits } from '../util/util'
import OverviewRing from '@Monitor/components/MonitorCard/sections/chart/ring'
import OverviewLine from '@Monitor/components/MonitorCard/sections/chart/line'
import OverviewCard from '@Monitor/components/MonitorCard/OverviewCard'
import OverviewNav from '@Monitor/components/MonitorCard/sections/nav'
import { getSignature } from '@/utils/crypto'

export default {
  name: 'OverviewIndex',
  components: {
    OverviewRing,
    OverviewLine,
    OverviewCard,
    OverviewNav,
  },
  data () {
    const scope = this.$store.getters.scope
    let navs = []
    if (scope === 'system') {
      navs = [{ id: 'system', location: this.$t('cloudenv.text_457'), title: this.$t('cloudenv.text_457'), scope: scope }]
    } else if (scope === 'domain') {
      navs = [{
        id: this.$store.getters.userInfo.projectDomainId,
        location: this.$t('dictionary.domain'),
        title: this.$store.getters.userInfo.projectDomain,
        scope: scope,
      }]
    }
    return {
      scope: scope,
      navs: navs,
      curNav: navs[0],
      dimentionId: '',
      ringChart: { loading: true },
      lineChart: { loading: true },
      loading: false,
    }
  },
  computed: {
    dimentions () {
      const curScope = this.curNav.scope
      const ret = []
      this.scopeLevel > 2 && ret.push({ scope: curScope, id: 'system', name: 'system', label: this.$t('system.text_15') })
      this.scopeLevel > 1 && ret.push({ scope: curScope, id: 'domain_id', name: 'project_domain', label: this.$t('dictionary.domain') })
      this.scopeLevel > 0 && ret.push({ scope: curScope, id: 'tenant_id', name: 'tenant', label: this.$t('dictionary.project') })
      ret.push({ scope: curScope, id: 'vm_id', name: 'vm_name', label: this.$t('dictionary.server') })
      ret.push({ scope: curScope, id: 'brand', name: 'brand', label: this.$t('common.brand') })
      ret.push({ scope: curScope, id: 'cloudregion_id', name: 'cloudregion', label: this.$t('dictionary.cloudregion') })
      ret.push({ scope: curScope, id: 'zone_id', name: 'zone', label: this.$t('dictionary.zone') })
      return ret
    },
    dimention () {
      let cid = this.dimentionId
      if (!cid || cid === '') cid = this.dimentions[0].id
      const ret = this.dimentions.filter((d) => { return d.id === cid })
      return ret.length > 0 ? ret[0] : {}
    },
    scopeLevel () {
      return Math.max(['project', 'domain', 'system'].indexOf(this.curNav.scope) + 1, 0)
    },
    extraParams () {
      const ret = {}
      if (this.curNav.scope === 'domain') ret.domain_id = this.curNav.id
      if (this.curNav.scope === 'project') ret.project_id = this.curNav.id
      return ret
    },
  },
  watch: {
    'curNav.scope' () {
      this.$nextTick(() => {
        this.fetchAllCharts()
      })
    },
  },
  created () {
    this.dimentionId = this.dimentions[0].id
    this.fetchAllCharts()
  },
  methods: {
    updateNavs (row) {
      if (!row || !row.tags) {
        console.log(`toNav ${row}`)
        return
      }
      const tags = row.tags
      console.log(tags)
      // system -> domain
      if (this.scopeLevel > 2 && tags.domain_id) {
        this.navs = this.navs.slice(0, 1)
        this.navs.push({ id: tags.domain_id, location: this.$t('dictionary.domain'), name: tags.project_domain, scope: 'domain' })
      }
      // domain -> project
      if (this.scopeLevel > 1 && tags.tenant_id) {
        const end = this.navs[0].scope === 'system' ? 2 : 1
        this.navs = this.navs.slice(0, end)
        this.navs.push({ id: tags.tenant_id, location: this.$t('dictionary.project'), name: tags.tenant, scope: 'project' })
      }
      this.changeNav(this.navs[this.navs.length - 1])
    },
    changeNav: function (e) {
      this.curNav = e
      this.$nextTick(() => { this.dimentionId = this.dimentions[0].id })
    },
    ringChartEvent: function () {
      const self = this
      return {
        click: function (e) {
          self.toHistory(e)
        },
      }
    },
    toHistory: function (e) {
      const rn = this.ringChart.chartData.rows[e.dataIndex].raw_name
      this.$router.push({ path: '/alertrecord', query: { res_type: rn } })
    },
    async fetchAllCharts () {
      await this.fetchPieChartData()
      // 近30日告警趋势图
      await this.fetchTabChartData()
    },
    fetchMeasurementsData () {
      try {
        const data = {
          from: '168h',
          scope: this.curNav.scope,
        }
        data.signature = getSignature(data)
        this.units = {}
        const self = this
        return new this.$Manager('unifiedmonitors', 'v1').get({ id: 'measurements', params: data }).then((res) => {
          self.units = measurementsUnits(res)
        })
      } catch (error) {
        throw error
      }
    },
    commonParams () {
      const extendParams = {
        scope: this.curNav.scope,
      }
      Object.assign(extendParams, this.extraParams)
      return extendParams
    },
    chartQueryData () {
      const extendParams = this.commonParams()
      return {
        from: '720h',
        interval: '24h',
        metric_query: [
          {
            model: {
              database: 'monitor',
              measurement: 'alert_record_history',
              select: [
                [{ params: ['res_num'], type: 'field' }, { type: 'sum' }],
              ],
            },
          },
        ],
        unit: true,
        ...extendParams,
      }
    },
    tabChartData (rawDatas) {
      const chartData = {
        columns: [],
        rows: [],
      }
      if (rawDatas) {
        const points = rawDatas[0].points
        let series = points.map((item) => {
          return { name: item[1], value: item[0] }
        })
        series = series.sort((a, b) => {
          return a.name - b.name
        })
        chartData.columns = ['name', 'alerts']
        const _temp = {}
        for (const i in series) {
          const d = new Date(series[i].name)
          const rn = `${d.getMonth() + 1}/${d.getDate()}`
          _temp[rn] = { name: rn, alerts: series[i].value }
        }

        // fill data
        const rows = []
        if (Object.keys(_temp).length < 30) {
          const now = new Date()
          for (let i = 30; i > 0; i--) {
            const cur = new Date(now - i * 24 * 60 * 60 * 1000)
            const rn = `${cur.getMonth() + 1}/${cur.getDate()}`
            if (_temp.hasOwnProperty(rn)) {
              rows.push(_temp[rn])
            } else {
              rows.push({ name: rn, alerts: 0 })
            }
          }
        }
        chartData.rows = rows
      }
      return chartData
    },
    async fetchTabChartData (measurement, field) {
      try {
        this.lineChart.loading = true
        this.lineChart.chartData = {
          columns: [],
          rows: [],
        }
        var data = this.chartQueryData()
        data.signature = getSignature(data)
        const { data: { series = [] } } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data, params: { $t: new Date().getSeconds() } })

        const self = this
        this.$nextTick(_ => {
          this.lineChart.rawDatas = series
          this.lineChart.chartData = self.tabChartData(series)
          this.lineChart.loading = false
        })
      } catch (error) {
        this.lineChart.loading = false
        throw error
      } finally {
        this.lineChart.loading = false
      }
    },
    async fetchPieChartData () {
      try {
        this.ringChart.loading = true
        this.ringChart.chartData = {
          columns: [],
          rows: [],
        }

        const params = this.commonParams()
        const { data: series = { } } = await new this.$Manager('alertrecords', 'v1').get({ id: 'total-alert', params: params })

        this.$nextTick(_ => {
          const chartData = {
            columns: ['name', 'count', 'raw_name'],
            rows: [],
          }

          let count = 0
          if (Object.keys(series).length > 0) {
            for (const item in series) {
              count += series[item]
              chartData.rows.push({ raw_name: item, name: this.$t(`dictionary.${item}`), count: series[item] })
            }
          } else {
            chartData.rows.push({ raw_name: '', name: '', count: 0 })
          }
          this.ringChart.subtitle = String(count)
          this.ringChart.chartData = chartData
          this.ringChart.loading = false
        })
      } catch (error) {
        this.ringChart.loading = false
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../../src/styles/less/theme';

.monitor-overview-chart {
  border: 1px solid #F1F1F1;
  padding: 6px 24px 12px 6px;
  margin-left: 6px;
  margin-right: 6px;

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
