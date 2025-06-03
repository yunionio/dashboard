<template>
  <overview-card-layout :card_style="`${card_stype} ${showMonitor ? '' : ''}`">
    <template #header>
      <div v-if="!readOnly">
        <a-row type="flex" style="padding: 12px;border-bottom: 1px solid #e8e8e8">
          <a-col class="d-flex" style="flex: 1 1 auto">
            <!-- 折叠 -->
            <a class="font-weight-bold h-100 d-block" style="margin-right: 6px;" @click="toggleShowMonitor">
              <a-icon type="down" style="font-size: 12px;" v-if="showMonitor" />
              <a-icon type="right" style="font-size: 12px;" v-if="!showMonitor" />
            </a>
            <!-- 表格隐藏 -->
            <a-tooltip>
              <template slot="title">
                {{ $t('monitor.show_hide_legend_table') }}
              </template>
              <a class="font-weight-bold h-100 d-block" style="margin-right: 6px;" @click="toggleShowTableLegend">
                <a-icon type="line-chart" style="font-size: 14px;" v-if="showMonitor && showLegend" />
                <a-icon type="credit-card" style="font-size: 14px;" v-if="showMonitor && !showLegend" />
                <a-icon type="minus" style="font-size: 14px;" v-if="!showMonitor" />
              </a>
            </a-tooltip>
            <!-- 名称 -->
            <span>{{ panel.panel_name || (chart.metric && chart.metric.label) }}</span>
          </a-col>
          <a-col v-if="!useLocalPanels" class="flex: 0 0 24px">
            <a-dropdown style="float: right" :trigger="['click']" placement="bottomRight">
              <a class="ant-dropdown-link font-weight-bold h-100 d-block action-btn" @click="e => e.preventDefault()">
                <icon type="more" style="font-size: 18px; margin-left: 9px;" />
              </a>
              <a-menu slot="overlay" @click="handleActionClick">
                <a-menu-item key="handleEdit"><a-icon type="edit" />{{$t('dashboard.text_104')}}</a-menu-item>
                <a-menu-item key="handleClone"><a-icon type="copy" />{{$t('dashboard.text_107')}}</a-menu-item>
                <a-menu-item key="handleExport"><a-icon type="download" />{{$t('table.action.export')}}</a-menu-item>
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
    <monitor-line
      v-if="showMonitor"
      ref="monitorLine"
      :loading="loading"
      :description="description"
      :metricInfo="metricInfo"
      :series="series"
      :reducedResult="reducedResult"
      :reducedResultOrder="reducedResultOrder"
      :pager="pager"
      :showTableLegend="showLegend"
      :monitorLineCardStyle="{border:'none'}"
      @pageChange="pageChange"
      @chartInstance="setChartInstance"
      @exportTable="exportTable"
      @reducedResultOrderChange="reducedResultOrderChange" />
  </overview-card-layout>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import DialogMixin from '@/mixins/dialog'
import { metric_zh, tableColumnMaps } from '@Monitor/constants'
import { getSignature } from '@/utils/crypto'
import { getRequestT, transformUnit } from '@/utils/utils'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
// import { currencyUnitMap } from '@/constants/currency'
import MonitorLine from '@Monitor/sections/MonitorLine'
import OverviewCardLayout from '../layout'

export default {
  name: 'DashboardCard',
  components: {
    OverviewCardLayout,
    MonitorLine,
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
    time: {
      type: String,
    },
    timeGroup: {
      type: String,
    },
    customTime: {
      type: Object,
    },
    groupFunc: {
      type: String,
    },
    tablePageSize: {
      type: Number,
      default: 10,
    },
    useLocalPanels: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      chart: {},
      tableLoading: false,
      resizeStatus: false,
      pager: {
        page: 1,
        limit: this.tablePageSize,
        total: 0,
      },
      series: [],
      reducedResult: {},
      reducedResultOrder: '',
      showLegend: false,
      showMonitor: true,
    }
  },
  computed: {
    description () {
      if (this.useLocalPanels) {
        const { selectItem, unit, metric, label } = this.panel.constants
        return {
          display_name: `${label}${metric ? `(${metric})` : ''}`,
          name: selectItem,
          unit: unit,
        }
      }
      const { common_alert_metric_details = [] } = this.panel
      return common_alert_metric_details.length ? common_alert_metric_details[0].field_description || {} : {}
    },
    metric () {
      const detail = _.get(this.panel, 'common_alert_metric_details[0]')
      if (!detail) {
        if (this.useLocalPanels) {
          const { fromItem, seleteItem, unit, metric, label } = this.panel.constants
          return {
            label: `${label}${metric ? `(${metric})` : ''}`,
            measurement: fromItem,
            field: seleteItem,
            format: unit,
          }
        }
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
        case 'BRL':
          format = '0.00'
          break
        case 'EUR':
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
      let params = {}
      if (this.useLocalPanels) {
        params = this.panel.queryData
        delete params.signature
      } else {
        const conditions = _.get(this.panel, 'setting.conditions')
        if (!conditions || conditions.length <= 0 || !conditions[0].query || !conditions[0].query.model) {
          console.log('invaild chart query condition', this.panel)
          return
        }
        const query = conditions[0].query
        const model = { ...query.model }
        if (model.group_by) {
          model.group_by = model.group_by.filter(item => {
            if ((item.type === 'time' && item.params && item.params[0] === '$interval') || (item.type === 'fill' && item.params && item.params[0] === 'none')) {
              return false
            }
            return true
          })
        }
        delete model.interval
        const metric_query = [{ model }]
        if (query.result_reducer) {
          metric_query[0].result_reducer = query.result_reducer
        }
        if (this.reducedResultOrder) {
          metric_query[0].result_reducer_order = this.reducedResultOrder
        }
        params = {
          from: query.from,
          to: query.to,
          metric_query,
          slimit: this.pager.limit,
          soffset: (this.pager.page - 1) * this.pager.limit,
          ...this.extraParams,
        }
      }
      if (this.timeGroup) {
        params.interval = this.timeGroup
      }
      if (this.time === 'custom') { // 自定义时间
        if (this.customTime && this.customTime.from && this.customTime.to) {
          params.from = this.customTime.from
          params.to = this.customTime.to
        }
      } else {
        params.from = this.time
        delete params.to
      }
      // groupFunc 为该时间间隔内如何聚合数据，与原图表group_by不一样
      // if (this.groupFunc) {
      //   const { select = [] } = model
      //   if (select.length) {
      //     select.forEach(s => {
      //       const index = s.findIndex(item => ['mean', 'min', 'max', this.groupFunc].includes(item.type))
      //       if (index !== -1) {
      //         s[index].type = this.groupFunc
      //       } else {
      //         s.push({ type: this.groupFunc, params: [] })
      //       }
      //     })
      //   } else {
      //     select.push([{ type: this.groupFunc, params: [] }])
      //     model.select = select
      //   }
      // }
      return params
    },
    metricInfo () {
      const { metric_query = [] } = this.chartQueryData
      return metric_query.length ? metric_query[0] : {}
    },
    groupBy () {
      return _.get(this.metricInfo, 'model.group_by')
    },
    resultReducer () {
      return _.get(this.metricInfo, 'result_reducer')
    },
    isSelectFunction () {
      const select = _.get(this.metricInfo, 'model.select') || []
      let ret = ''
      select.map(item => {
        if (R.is(Array, item)) {
          item.map(l => {
            if (l.type === 'mean' || l.type === 'sum') {
              ret = l.type
            }
          })
        } else if (R.is(Object, item)) {
          if (item.type === 'mean' || item.type === 'sum') {
            ret = item.type
          }
        }
      })
      return ret
    },
    showTable () {
      if (!this.groupBy && !this.resultReducer && this.isSelectFunction) {
        return false
      }
      return true
    },
    chartSetting () {
      const ret = {}
      ret.tooltip = {
        trigger: 'axis',
        position: (point, params, dom, rect, size) => {
          const series = params.map((line, i) => {
            const unit = _.get(this.description, 'unit')
            const val = transformUnit(line.value[1], unit)
            const value = _.get(val, 'text') || line.value[1]
            // if (unit === 'currency') {
            //   let unit = ''
            //   if (currencys.length === 1) {
            //     unit = currencyUnitMap[currencys[0]]?.sign || ''
            //   }
            //   value = unit ? `${unit} ${_.get(val, 'value' || line.value[0])}` : _.get(val, 'value' || line.value[0])
            // }
            // const color = i === this.highlight.index ? this.highlight.color : '#616161'
            let name = line.seriesName
            if (!this.showTable) {
              name = this.isSelectFunction.toUpperCase()
            } else {
              if (name.startsWith('{') && name.endsWith('}')) {
                try {
                  const str = name.substring(1, name.length - 1)
                  const list = str.split(',')
                  const obj = {}
                  list.forEach(item => {
                    const [key, value] = item.split('=')
                    obj[key] = value
                  })
                  let field = ''
                  R.forEachObjIndexed((value, key) => {
                    if (list.length && obj[key] && !field) {
                      field = key
                    }
                  }, tableColumnMaps)
                  name = field ? obj[field] : name
                } catch (err) { }
              }
            }
            return `<div class="d-flex align-items-center"><span>${line.marker}</span> <span class="text-truncate" style="max-width: 500px;">${name || ' '}</span>:&nbsp;<span>${value}</span></div>`
          }).join('')
          const wrapper = `<div>
                        <div>${params[0].name}</div>
                        <div class="lines-wrapper">${series}</div>
                      </div>`
          dom.style.border = 'none'
          // dom.style.backgroundColor = 'transparent'
          dom.innerHTML = wrapper
        },
      }
      return ret
    },
  },
  watch: {
    updated_at: {
      deep: true,
      handler () {
        this.fetchChart()
      },
    },
    time () {
      this.fetchChart()
    },
    timeGroup () {
      this.fetchChart()
    },
    customTime () {
      this.fetchChart()
    },
    groupFunc () {
      this.fetchChart()
    },
    reducedResultOrder () {
      this.fetchChart()
    },
  },
  created () {
    this.fetchChart()
  },
  methods: {
    pageChange (pager) {
      this.pager = { ...this.pager, ...pager }
      this.$emit('pageChange', this.pager)
      this.fetchChart()
    },
    reducedResultOrderChange (order) {
      this.reducedResultOrder = order
    },
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
        panelName: this.panel.panel_name || (this.chart.metric && this.chart.metric.label),
        refresh: () => { this.$emit('delete') },
        columns: [getNameDescriptionTableColumn()],
      })
    },
    handleEdit () {
      this.editChart({ id: this.panel.panel_id })
    },
    handleExport () {
      this.$refs.monitorLine.exportTable()
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
        const { series, series_total = 0, reduced_result = {} } = await this.fetchData()
        if (series) {
          this.series = series
          this.pager = { ...this.pager, total: series_total }
          this.reducedResult = reduced_result
        }
        this.$emit('fetchDataSuccess')
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
        const { data: { series = [], series_total, reduced_result = {} } } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data, params: { $t: getRequestT() } })
        return { series, series_total, reduced_result }
      } catch (error) {
        throw error
      }
    },
    async exportTable (total) {
      try {
        const data = { ..._.cloneDeep(this.chartQueryData), slimit: total, soffset: 0 }
        data.signature = getSignature(this.chartQueryData)
        const { data: { series = [], series_total, reduced_result = {} } } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data, params: { $t: getRequestT() } })
        this.$refs.monitorLine.exportFullData(series, reduced_result, series_total)
      } catch (error) {
        throw error
      }
    },
    toggleShowTableLegend () {
      this.showMonitor = true
      this.showLegend = !this.showLegend
    },
    toggleShowMonitor () {
      this.showMonitor = !this.showMonitor
    },
  },
}
</script>

<style scoped>

</style>
