<template>
  <overview-card-layout :card_style="card_style">
    <template #header>
      <div v-if="!readOnly">
        <a-row type="flex">
          <a-col :span="23">{{ panel.panel_name || (chart.metric && chart.metric.label) }}</a-col>
          <a-col>
            <a-dropdown style="float: right" :trigger="['click']" placement="bottomRight">
              <a class="ant-dropdown-link font-weight-bold h-100 d-block action-btn" @click="e => e.preventDefault()">
                <icon type="more" style="font-size: 18px;" />
              </a>
              <a-menu slot="overlay" @click="handleActionClick">
                <a-menu-item key="handleEdit"><a-icon type="edit" />{{$t('dashboard.text_104')}}</a-menu-item>
                <a-menu-item key="handleClone"><a-icon type="copy" />{{$t('dashboard.text_107')}}</a-menu-item>
                <a-menu-item key="handleDelete"><a-icon type="delete" />{{$t('scope.text_18')}}</a-menu-item>
              </a-menu>
            </a-dropdown>
          </a-col>
        </a-row>
      </div>
      <div v-if="selectable">
        <a-radio :checked="focusPanelId == panel.panel_id" @click="(e)=>{chose_panel(panel.panel_id,panel.panel_name)}">{{panel.panel_name}}</a-radio>
      </div>
    </template>
    <overview-line v-if="resizeStatus" :class="card_style" :chartHeigth="chartHeigth" style="padding-top: 10px;" :chartData="chart.chartData" :yAxisFormat="chart.metric && chart.metric.format ? chart.metric.format : '0.[00]'" :loading="loading" :exportName="panel.panel_name || (chart.metric && chart.metric.label)" />
    <template #footer>
      <overview-table :table-data="table" :loading="tableLoading" />
    </template>
  </overview-card-layout>
</template>

<script>
import _ from 'lodash'
import WindowsMixin from '@/mixins/windows'
import DialogMixin from '@/mixins/dialog'
import { metric_zh } from '@Monitor/constants'
import { getSignature } from '@/utils/crypto'
import { getRequestT } from '@/utils/utils'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import OverviewCardLayout from '../layout'
import OverviewLine from '../sections/chart/line'
import OverviewTable from '../sections/table'

export default {
  name: 'DashboardCard',
  components: {
    OverviewCardLayout,
    OverviewLine,
    OverviewTable,
  },
  mixins: [DialogMixin, WindowsMixin],
  props: {
    updated_at: {
      type: String,
    },
    dashboard_id: {
      type: String,
    },
    panel: {
      type: Object,
      required: true,
      default: () => {
        return {}
      },
    },
    extraParams: {
      type: Object,
      default: () => ({}),
    },
    editChart: {
      type: Function,
      required: true,
    },
    card_style: {
      type: String,
    },
    readOnly: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    selectable: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    focusPanelId: {
      type: String,
      default: () => {
        return ''
      },
    },
    chartHeigth: {
      type: String,
      default: '320px',
    },
  },
  data () {
    return {
      chart: {},
      tableLoading: false,
      resizeStatus: false,
    }
  },
  computed: {
    metric () {
      const detail = _.get(this.panel, 'common_alert_metric_details[0]')
      if (!detail) {
        return { label: '', measurement: '', field: '', format: '0.00' }
      }
      const measurement = detail.measurement
      const field = detail.field
      const display_name = _.get(detail, 'field_description.display_name')
      let label = metric_zh[detail.measurement_display_name] || '-'
      if (display_name) {
        label += `(${metric_zh[display_name] ? metric_zh[display_name] : display_name})`
      }
      const unit = _.get(detail, 'field_description.unit')
      let format = '0.00'
      switch (unit) {
        case '%':
          format = '0.00 %'
          break
        case 'bps':
          format = '0.00 Bps'
          break
        case 'Bps':
          format = '0.00 b'
          break
        case 'byte':
          format = '0.00 b'
          break
        case 'RMB':
          format = '0.00'
          break
        case 'USD':
          format = '0.00'
          break
        case 'ms':
          format = '0.00'
          break
        case 'count':
          format = '0'
          break
      }
      return { label: label, measurement: measurement, field: field, format: format }
    },
    chartQueryData () {
      const conditions = _.get(this.panel, 'setting.conditions')
      if (!conditions || conditions.length <= 0 || !conditions[0].query || !conditions[0].query.model) {
        console.log('invaild chart query condition', this.panel)
        return
      }
      const query = conditions[0].query
      const metric_query = [{ model: query.model }]
      if (query.result_reducer) {
        metric_query[0].result_reducer = query.result_reducer
      }
      return {
        from: query.from,
        to: query.to,
        metric_query,
        ...this.extraParams,
      }
    },
  },
  watch: {
    updated_at: {
      deep: true,
      handler () {
        this.fetchChart()
      },
    },
  },
  created () {
    this.fetchChart()
  },
  methods: {
    resize () {
      this.resizeStatus = false
      this.$nextTick(() => {
        this.resizeStatus = true
      })
    },
    chose_panel (id, name) {
      this.$emit('chose_panel', { id: id, name: name })
    },
    handleActionClick ({ key }) {
      if (this[key]) this[key]()
    },
    handleDelete () {
      this.createDialog('DeleteMonitorDashboardChart', {
        data: [{ id: this.panel.panel_id, name: this.metric.label }],
        refresh: () => { this.$emit('delete') },
        columns: [getNameDescriptionTableColumn()],
      })
    },
    handleClone () {
      this.createDialog('CloneMonitorDashboardChart', {
        data: [{ id: this.panel.panel_id, name: this.metric.label, dashboard_id: this.dashboard_id }],
        refresh: () => { this.$emit('delete') },
        columns: [getNameDescriptionTableColumn()],
      })
    },
    handleEdit () {
      this.editChart({ id: this.panel.panel_id })
    },
    toLineChartData (series) {
      const data = { columns: ['time'], rows: [] }
      const tv = {}
      series.map((s) => {
        const name = s.raw_name || s.name || ''
        const index = name.indexOf(':') + 1
        const column = index > 0 && name.slice(index).trim().length > 0 ? name.slice(index).trim() : name
        data.columns.push(column)
        s.points.map((p) => {
          const t = p[1]
          if (!tv[t]) {
            const padding = (n) => { return n > 9 ? `${n}` : '0' + n }
            const _t = new Date(t)
            const _h = padding(_t.getHours())
            const _m = padding(_t.getMinutes())
            tv[t] = { time: _t.toLocaleDateString() + ' ' + _h + ':' + _m }
          }
          tv[t][column] = p[0]
        })
      })
      // 时间排序
      const sortedKeys = Object.keys(tv).sort((a, b) => { return a - b })
      // 展开数据
      data.rows = sortedKeys.map((k) => {
        return tv[k]
      })
      return data
    },
    async fetchChart () {
      this.loading = true
      try {
        const series = await this.fetchData()
        if (series) {
          this.chart = {
            metric: this.metric,
            chartData: this.toLineChartData(series),
          }
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async fetchData (metric_query) {
      try {
        const data = _.cloneDeep(this.chartQueryData)
        if (!data) {
          this.resizeStatus = false
          return
        }
        this.resizeStatus = true
        data.signature = getSignature(this.chartQueryData)
        const { data: { series = [] } } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data, params: { $t: getRequestT() } })
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
