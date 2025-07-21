<template>
  <a-form :form="form" layout="inline">
      <a-form-item style="margin-right: 8px;">
        <refresh  @refresh="handleRefresh" :loading="loading" />
      </a-form-item>
      <a-form-item style="margin-right: 8px;">
        <basic-select  v-model="res" :options="resOptions" @change="handleResChange" />
      </a-form-item>
      <a-form-item style="margin-right: 8px;">
        <metric-select  v-decorator="decorators.metric" :options="metricOptions" @change="handleMetricChange" />
      </a-form-item>
      <a-form-item style="margin-right: 8px;">
        <time-select v-decorator="decorators.from" @change="handleFromChange" />
      </a-form-item>
      <a-form-item v-if="!isLineChart" style="margin-right: 8px;">
        <top-n-select v-decorator="decorators.limit" @change="handleLimitChange" />
      </a-form-item>
      <a-form-item style="margin-right: 8px;" class="ml-2" :label="$t('monitor.overview.aggregate')">
        <basic-select v-model="dimentionId" :options="dimentions"  style="min-width: 90px" />
      </a-form-item>
  </a-form>
</template>

<script>
import { getSignature } from '@/utils/crypto'
import { sizestr, mathRoundFix } from '@/utils/utils'
import setting from '@/config/setting'
import numerify from '../sections/chart/formatters'
import BasicSelect from '../sections/select/basic'
import MetricSelect from '../sections/select/metric'
import TimeSelect from '../sections/select/timeselect'
import TopNSelect from '../sections/select/topN'
import refresh from '../sections/select/refresh'
import MetricOptions from './metrics'

function newChart (metircOption) {
  const chart = {
    metric: metircOption,
    loading: false,
    chartType: '',
    chartData: {
      columns: [],
      rows: [],
    },
  }
  return chart
}

export default {
  name: 'filterForm',
  components: {
    BasicSelect,
    TimeSelect,
    TopNSelect,
    MetricSelect,
    refresh,
  },
  props: {
    scope: {
      type: String,
      default: 'project',
    },
    extraParams: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  data () {
    return {
      curScope: this.scope,
      dimentionId: 'vm_id',
      res: 'server',
      loading: false,
      loadingCtx: { lastLoadAt: new Date(), lastIndex: 0, canceledDelay: true },
      form: this.$form.createForm(this),
      decorators: {
        metric: ['metric', { initialValue: MetricOptions.server[0] || {} }],
        from: ['from', { initialValue: 7 * 24 * 60 }],
        limit: ['limit', { initialValue: 10 }],
      },
    }
  },
  computed: {
    resOptions () {
      if (this.curScope === 'project') {
        return [{ label: this.$t('dictionary.server'), id: 'server' }, { label: 'RDS', id: 'rds' }]
      } else {
        return [{ label: this.$t('dictionary.server'), id: 'server' }, { label: this.$t('dictionary.host'), id: 'host' }, { label: 'RDS', id: 'rds' }]
      }
    },
    dimentions () {
      const curScope = this.curScope
      const scopeLevel = Math.max(['project', 'domain', 'system'].indexOf(this.curScope) + 1, 0)
      const ret = []
      if (this.res === 'server') {
        ret.push({ scope: curScope, id: 'vm_id', name: 'vm_name', label: this.$t('cloudenv.text_99') })
      } else if (this.res === 'host') {
        ret.push({ scope: curScope, id: 'host_id', name: 'host', label: this.$t('cloudenv.text_101') })
      } else if (this.res === 'rds') {
        ret.push({ scope: curScope, id: 'rds_id', name: 'rds_name', label: 'RDS' })
      }
      scopeLevel > 2 && ret.push({
        scope: curScope,
        id: 'system',
        name: 'system',
        label: this.$t('monitor.view_system'),
      })
      scopeLevel > 1 && ret.push({
        scope: curScope,
        id: 'domain_id',
        name: 'project_domain',
        label: this.$t('dictionary.domain'),
      })
      scopeLevel > 0 && (this.res === 'server' || this.res === 'rds') && ret.push({
        scope: curScope,
        id: 'tenant_id',
        name: 'tenant',
        label: this.$t('dictionary.project'),
      })
      ret.push({ scope: curScope, id: 'brand', name: 'brand', label: this.$t('common.brands') })
      ret.push({ scope: curScope, id: 'cloudregion_id', name: 'cloudregion', label: this.$t('cloudenv.text_10') })
      ret.push({ scope: curScope, id: 'zone_id', name: 'zone', label: this.$t('cloudenv.text_11') })
      return ret
    },
    metricOptions () {
      return MetricOptions[this.res]
    },
    charts () {
      const charts = {}
      MetricOptions[this.res].map((m) => {
        charts[m.value] = newChart(m)
      })
      return charts
    },
    isLineChart () {
      const dimension = this.dimentions.filter((d) => { return d.id === this.dimentionId })[0]
      if (dimension.scope !== this.scope) {
        return false
      }
      switch (dimension.scope) {
        case 'system':
          return dimension.id === 'system'
        case 'domain':
          return dimension.id === 'domain_id'
        case 'project':
          return dimension.id === 'tenant_id'
        default:
          return false
      }
    },
    dimension () {
      return this.dimentions.filter((d) => { return d.id === this.dimentionId })[0]
    },
    showIp () {
      return (this.res === 'server' && this.dimentionId === 'vm_id') || (this.res === 'rds' && this.dimentionId === 'rds_id')
    },
  },
  watch: {
    scope (val, oldval) {
      if (val !== oldval) {
        this.curScope = val
        this.handleRefreshAll()
      }
    },
    dimentionId (val, oldval) {
      if (val !== oldval) {
        this.handleRefreshAll()
      }
    },
    res (val, oldval) {
      if (val !== oldval) {
        this.dimentionId = val === 'server' ? 'vm_id' : (val === 'host' ? 'host_id' : 'rds_id')
      }
    },
  },
  created () {
    this.$uM = new this.$Manager('unifiedmonitors', 'v1')
  },
  mounted () {
    this.handleRefreshAll()
  },
  methods: {
    groupBy (metric) {
      const ret = []
      if (this.dimension.scope === 'system') {
        if (this.isLineChart) { return [{ type: 'tag', params: [metric.field] }] }
      }

      if ((this.dimension.scope === 'system' || this.dimension.scope === 'domain') && this.dimension.name === 'tenant') {
        ret.push({ type: 'field', params: ['project_domain'] })
      } else if (this.dimension.scope === 'project' && this.dimension.name !== 'tenant') {
        ret.push({ type: 'field', params: ['tenant'] })
      } else {
        ret.push({ type: 'field', params: [this.dimension.name] })
        ret.push({ type: 'field', params: [this.dimension.id] })
      }
      return ret
    },
    groupInput () {
      if (this.res === 'host') {
        return 'project_domain'
      }
      switch (this.dimension.scope) {
        case 'system':
          return 'project_domain'
        default:
          return 'tenant'
      }
    },
    intervalInput (from) {
      // 168 points
      const interval = Math.max(Math.round(from / 168), 1)
      return this.isLineChart ? `${interval}m` : `${from}m`
    },
    changeNav (row) {
      this.$emit('changeNav', row)
    },
    queryParams (metric, formValues) {
      const query = {
        scope: this.scope,
      }
      query.from = `${formValues.from}m` || '168h'
      query.interval = this.intervalInput(formValues.from)
      if (['tenant_id', 'domain_id'].includes(this.dimentionId)) {
        query.skip_check_series = true
      }
      query.metric_query = [
        {
          model: {
            database: 'telegraf',
            measurement: metric.measurement,
            select: [
              [{ params: [metric.field], type: 'field' },
                { type: 'mean' },
                { type: 'abs' },
              ],
            ],
            tags: [
              {
                key: this.groupInput(),
                operator: '!=',
                value: '',
              }],
            group_by: this.groupBy(metric),
          },
        },
      ]
      Object.assign(query, this.extraParams)
      query.signature = getSignature(query)
      return query
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    getTableNameColumn () {
      const namecolumn = {
        edit: false,
        field: this.dimension.name,
        title: this.dimension.label,
        sortable: true,
      }

      const self = this
      if (['system', 'project_domain', 'tenant'].indexOf(this.dimension.name) >= 0) {
        namecolumn.slots = {
          default: ({ row }, h) => {
            return [h('a', {
              domProps: {
                innerHTML: row[this.dimension.name] || '-',
              },
              props: {
                value: row[this.dimension.id] || '-',
              },
              on: {
                click: () => {
                  self.changeNav(row)
                },
              },
            })]
          },
        }
      }
      return namecolumn
    },
    toTableData () {
      const curMetric = this.form.getFieldValue('metric')
      // 取当前活动监控指标为数据集
      let cRows = this.charts[curMetric?.value]?.chartData?.rows || []
      // 没有值时，依次取新的指标为数据集
      if (!cRows.length) {
        for (const k in this.charts) {
          const rows = this.charts[k]?.chartData?.rows || []
          if (rows.length) {
            cRows = rows
            break
          }
        }
      }
      const ids = cRows.map((row) => { return row.id })

      const data = { columns: [], rows: [] }
      const namecolumn = this.getTableNameColumn()
      data.columns.push(namecolumn)
      if (this.showIp) {
        data.columns.push({
          field: 'external_id',
          title: this.$t('table.title.external_id'),
          formatter: ({ row }) => {
            return row.tags?.external_id || row.cloud_tags?.external_id || ''
          },
          onlyExport: true,
        })
        data.columns.push({
          field: 'id',
          title: 'ID',
          formatter: ({ row }) => {
            if (this.res === 'server') {
              return row.tags?.vm_id || row.cloud_tags?.vm_id || ''
            }
            if (this.res === 'rds') {
              return row.tags?.rds_id || ''
            }
            return ''
          },
          onlyExport: true,
        })
        if (this.res === 'rds') {
          data.columns.push({
            field: 'internal_connection_str',
            title: this.$t('monitor.inside_addr'),
            formatter: ({ row }) => {
              const { tags = {} } = row
              return tags.internal_connection_str || '-'
            },
            onlyExport: true,
          })
          data.columns.push({
            field: 'connection_str',
            title: this.$t('monitor.outside_addr'),
            formatter: ({ row }) => {
              const { tags = {} } = row
              return tags.connection_str || '-'
            },
            onlyExport: true,
          })
          data.columns.push({
            field: 'all_ip',
            title: this.$t('monitor.address'),
            formatter: ({ row }) => {
              const { tags = {} } = row
              const ret = []
              if (tags.connection_str) {
                ret.push(`${tags.connection_str}(${this.$t('monitor.outside_addr')})`)
              }
              if (tags.internal_connection_str) {
                ret.push(`${tags.internal_connection_str}(${this.$t('monitor.inside_addr')})`)
              }
              return ret.length ? ret.join(',') : '-'
            },
            noExport: true,
          })
        }
        if (this.res === 'server') {
          data.columns.push({
            field: 'elastic_ip',
            title: this.$t('common.eip'),
            formatter: ({ row }) => {
              const { tags = {} } = row
              if (tags.eip && tags.eip_mode === 'elastic_ip') {
                return `${tags.eip}(${this.$t('common_290')})`
              }
              return '-'
            },
            onlyExport: true,
          })
          data.columns.push({
            field: 'ip',
            title: 'IP',
            formatter: ({ row }) => {
              const { tags = {}, cloud_tags = {} } = row
              const ret = []
              if (tags.eip && tags.eip_mode !== 'elastic_ip') {
                ret.push(`${tags.eip}(${this.$t('common_291')})`)
              }
              if (tags.vm_ip) {
                const iparr = tags.vm_ip.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('common.intranet')})`)
                })
              } else if (cloud_tags.vm_ip) {
                const iparr = cloud_tags.vm_ip.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('common.intranet')})`)
                })
              }
              if (tags.vips) {
                tags.vips.map(ip => {
                  ret.push(`${ip}(${this.$t('common_vip')})`)
                })
              }
              if (tags.vip) {
                const iparr = tags.vip.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('common_vip')})`)
                })
              }
              if (tags.vip_eip) {
                const iparr = tags.vip_eip.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('common_evip')})`)
                })
              }
              if (tags.metadata && tags.metadata.sync_ips) {
                const iparr = tags.metadata.sync_ips.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('compute.esxi.sync_ips_outofrange')})`)
                })
              }
              return ret.length ? ret.join(', ') : '-'
            },
            onlyExport: true,
          })
          data.columns.push({
            field: 'all_ip',
            title: 'IP',
            formatter: ({ row }) => {
              const { tags = {}, cloud_tags = {} } = row
              const ret = []
              if (tags.eip) {
                ret.push(`${tags.eip}(${tags.eip_mode === 'elastic_ip' ? this.$t('common_290') : this.$t('common_291')})`)
              }
              if (tags.vm_ip) {
                const iparr = tags.vm_ip.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('common.intranet')})`)
                })
              } else if (cloud_tags.vm_ip) {
                const iparr = cloud_tags.vm_ip.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('common.intranet')})`)
                })
              }
              if (tags.vips) {
                tags.vips.map(ip => {
                  ret.push(`${ip}(${this.$t('common_vip')})`)
                })
              }
              if (tags.vip) {
                const iparr = tags.vip.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('common_vip')})`)
                })
              }
              if (tags.vip_eip) {
                const iparr = tags.vip_eip.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('common_evip')})`)
                })
              }
              if (tags.metadata && tags.metadata.sync_ips) {
                const iparr = tags.metadata.sync_ips.split(',')
                iparr.map(ip => {
                  ret.push(`${ip}(${this.$t('compute.esxi.sync_ips_outofrange')})`)
                })
              }
              return ret.length ? ret.join(', ') : '-'
            },
            noExport: true,
          })
        }
      }
      const tr = {}
      for (const k in this.charts) {
        const chart = this.charts[k]
        const column = chart.metric.label
        const col = { field: column, title: column, sortable: true, sortType: 'number', sortBy: (row) => { const v = row && row[column] ? row[column] : '-'; return v } }
        if (chart.metric.format) {
          if (chart.metric.format === '0.00 b') {
            col.formatter = ({ cellValue }) => {
              if (typeof (cellValue) === 'undefined' || cellValue === '-') {
                return '-'
              }
              return cellValue < 1024 ? mathRoundFix(cellValue, 1, true) + 'B' : sizestr(cellValue, 'B', 1024)
            }
          } else {
            col.formatter = ({ cellValue }) => {
              if (typeof (cellValue) === 'undefined' || cellValue === '-') {
                return '-'
              }
              return numerify(cellValue, chart.metric.format)
            }
          }
        }
        data.columns.push(col);
        (chart.$chartData?.rows || []).map((row) => {
          if (ids.indexOf(row.id) < 0) {
            return
          }

          if (!tr[row.id]) {
            tr[row.id] = {}
            tr[row.id][namecolumn.field] = row.name
            tr[row.id].tags = row.tags
            tr[row.id].cloud_tags = row.cloud_tags
          }
          tr[row.id][column] = row.value
        })
      }
      for (const r in tr) {
        data.rows.push(tr[r])
      }
      data.rows.sort((a, b) => { return b[curMetric.label] - a[curMetric.label] })
      return data
    },
    toChartData (series) {
      if (this.isLineChart) {
        return this.toLineChartData(series)
      } else {
        return this.toHistogramChartData(series)
      }
    },
    toLineChartData (series) {
      const data = { columns: ['time'], rows: [] }
      const tv = {}
      series.map((s) => {
        const column = s.tags[this.dimension.name] || this.dimension.name
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
    toHistogramChartData (series) {
      const data = { columns: ['name', 'value'], rows: [] }
      const rows = series.map((item) => {
        const lastPoint = item.points ? item.points[item.points.length - 1] : undefined
        if (lastPoint) {
          return {
            name: this.filterNameByOem(item.tags[this.dimension.name]),
            id: item.tags[this.dimension.id],
            value: lastPoint[0],
            timestamp: lastPoint[1],
            tags: item.tags,
            cloud_tags: item.cloud_tags,
          }
        }
      })
      data.rows = rows.sort((a, b) => { return a.value - b.value })
      return data
    },
    async fetchChartData (field, formValues) {
      return new Promise((resolve, reject) => {
        const chart = this.charts[field]
        try {
          chart.loading = true
          chart.chartData = {
            columns: [],
            rows: [],
          }
          const data = this.queryParams(chart.metric, formValues)
          this.$uM.performAction({ id: 'query', action: '', data }).then(res => {
            const { data: { series = [] } } = res
            chart.chartType = this.isLineChart ? 'OverviewLine' : 'OverviewHistogram'
            chart.chartData = this.toChartData(series)
            chart.$chartData = Object.assign({}, chart.chartData)
            if (formValues.limit && typeof formValues.limit === 'number' && formValues.limit > 0) {
              if (chart.chartData.rows.length > formValues.limit) {
                chart.chartData.rows = chart.chartData.rows.slice(chart.chartData.rows.length - formValues.limit)
              }
            }
            chart.loading = false
            resolve(true)
          }).catch(() => {
            chart.loading = false
            resolve(true)
          })
        } catch (error) {
          chart.loading = false
          resolve(true)
          throw error
        }
      })
    },
    emitChart (chart) {
      this.$emit('updateChart', chart)
    },
    emitTable () {
      if (this.isLineChart || !this.charts) {
        this.$emit('updateTable', undefined)
      } else {
        this.$emit('updateTable', this.toTableData())
      }
    },
    setLoading (v) {
      this.loading = v
      this.$emit('showTable', !this.isLineChart)
      this.$emit('dataLoading', v)
    },
    startLoading () {
      this.loadingCtx.lastIndex += 1
      this.loadingCtx.canceledDelay = true
      this.loadingCtx.lastLoadAt = new Date()
      const index = this.loadingCtx.lastIndex
      this.setLoading(true)
      return {
        stop: () => {
          if (this.loadingCtx.lastIndex === index) {
            this.setLoading(false)
          }
        },
      }
    },
    async handleMetricChange (metric) {
      this.form.setFieldsValue({ metric: metric })
      await this.handleRefresh()
      this.emitTable()
    },
    handleFromChange (from) {
      this.form.setFieldsValue({ from: from })
      this.handleRefreshAll()
    },
    handleLimitChange (limit) {
      this.form.setFieldsValue({ limit: limit })
      this.$emit('changeLimit', limit)
      this.handleRefreshAll()
    },
    handleResChange (res) {
      this.res = res
    },
    async handleRefresh () {
      const loading = this.startLoading()
      try {
        const values = await this.validateForm()
        await this.fetchChartData(values.metric.value, values)
        this.emitChart(this.charts[values.metric.value])
      } catch (error) {
        throw error
      } finally {
        loading.stop()
      }
    },
    async handleRefreshAll () {
      const loading = this.startLoading()
      try {
        const values = await this.validateForm()
        const vs = Object.keys(this.charts)
        for (const v of vs) {
          await this.fetchChartData(v, values)
        }

        this.emitChart(this.charts[values.metric.value])
        this.emitTable()
      } catch (error) {
        throw error
      } finally {
        loading.stop()
      }
    },
    filterNameByOem (name) {
      if (this.dimension.id === 'brand') {
        if (name === 'OneCloud') {
          return setting.brand[setting.language] || name
        } else if (name === 'Cloudpods') {
          const { companyInfo = {} } = this.$store.state.app
          return setting.language === 'en' ? (companyInfo.inner_copyright_en || name) : (companyInfo.inner_copyright || name)
        }
      }
      return name
    },
  },
}
</script>
