<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <router-link v-if="!edit" to="/monitoroverview" class="ml-2">
            <icon type="arrow-right" style="font-size:18px" />
          </router-link>
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="chartOptions.xAxis.data.length">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap">
              <e-chart :options="chartOptions" style="height: 100%; width: 100%;" autoresize />
            </div>
          </div>
        </template>
        <template v-else>
          <a-empty />
        </template>
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
// import i18n from 'vue-i18n'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { chartColors } from '@/constants'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { resolveValueChangeField } from '@/utils/common/ant'
import { getCurrency } from '@/utils/common/cookie'
import { currencyUnitMap } from '@/constants/currency'
import { getSignature } from '@/utils/crypto'
// import OverviewLine from '@Monitor/components/MonitorCard/sections/chart/line'

export default {
  name: 'AlertsTrend',
  components: {
    BaseDrawer,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    edit: Boolean,
  },
  data () {
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.alerts_trend')
    return {
      data: [],
      visible: false,
      loading: false,
      seriesData: [],
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            const newField = resolveValueChangeField(values)
            R.forEachObjIndexed((item, key) => {
              this.$set(this.form.fd, key, item)
            }, newField)
          },
        }),
        fd: {
          name: initialNameValue,
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: initialNameValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_8') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      chartOptions: {
        tooltip: {
          show: true,
          trigger: 'axis',
          axisPointer: {
            type: 'none',
          },
        },
        grid: {
          left: 50,
          bottom: 30,
          top: 30,
          right: 20,
          width: 'auto',
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [],
        color: chartColors,
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'capability', 'isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
    newCurrencys () {
      return this.CURRENCYS.filter(v => {
        return this.currencyOpts.find(obj => obj.item_id === v.key)
      })
    },
    currencySign () {
      return currencyUnitMap[this.form.fd.currency]?.sign || '¥'
    },
    extraParams () {
      const ret = {}
      if (this.scope === 'domain') ret.domain_id = this.userInfo?.projectDomainId
      if (this.scope === 'project') ret.project_id = this.userInfo?.projectId
      return ret
    },
  },
  watch: {
    'form.fd' (val) {
      this.fetchData()
      for (const key in this.decorators) {
        let config = this.decorators[key][1] || {}
        config = {
          ...config,
          initialValue: val[key],
        }
        if (key === 'currency' && !config.initialValue) {
          config.initialValue = (this.params && this.params.currency) || getCurrency()
        }
        this.decorators[key][1] = config
      }
    },
  },
  created () {
    const values = { ...this.form.fd }
    this.$emit('update', this.options.i, values)
    this.fetchData()
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    getDate () {
      const end = this.$moment()
      const start = this.$moment().subtract(30, 'days')
      return {
        start_date: start.format('YYYY-MM-DD') + 'TZ',
        end_date: end.format('YYYY-MM-DD') + 'TZ',
        // start_date: '2021-05-01TZ',
        // end_date: '2021-05-31TZ',
        data_type: 'day',
      }
    },
    commonParams () {
      const extendParams = {
        scope: this.scope,
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
              group_by: [{
                type: 'tag',
                params: ['res_type'],
              }],
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
      const list = []
      const dateList = []
      if (rawDatas && rawDatas.length > 0) {
        chartData.columns = []
        const _temp = {}
        rawDatas.map((item) => {
          const points = item.points
          if (!item.points) {
            return
          }
          const columnName = item.raw_name ? this.$t(`dictionary.${item.raw_name}`) : this.$t('monitor.overview_alert.undefined')
          chartData.columns.push(columnName)
          let series = points.map((item) => {
            return { name: item[1], value: item[0] }
          })
          series = series.sort((a, b) => {
            return a.name - b.name
          })
          for (const i in series) {
            const d = new Date(series[i].name)
            const rn = `${d.getMonth() + 1}-${d.getDate()}`
            if (_temp.hasOwnProperty(rn)) {
              _temp[rn][columnName] = series[i].value
            } else {
              _temp[rn] = { name: rn }
              _temp[rn][columnName] = series[i].value
            }
          }
        })
        // base data
        const initData = {}
        chartData.columns.map((item) => { initData[item] = 0 })
        // fill data
        const rows = []
        const now = new Date()
        for (let i = 30; i > 0; i--) {
          const cur = new Date(now - i * 24 * 60 * 60 * 1000)
          const rn = `${cur.getMonth() + 1}-${cur.getDate()}`
          dateList.push(rn)
          if (_temp.hasOwnProperty(rn)) {
            rows.push(Object.assign({}, initData, _temp[rn]))
          } else {
            rows.push(Object.assign({}, { name: rn }, initData))
          }
        }
        // 拼接数据
        chartData.columns.map((item, index) => {
          list.push({
            type: 'bar',
            name: item,
            stack: 'total',
            data: [],
          })
          rows.map(item2 => {
            list[index].data.push(item2[item])
          })
        })
      }
      return { dateList, list }
    },
    async fetchData () {
      this.loading = true
      try {
        var queryData = this.chartQueryData()
        queryData.signature = getSignature(queryData)
        const { data = {} } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data: queryData, params: { $t: new Date().getSeconds() } })
        const { series = [] } = data
        const newData = this.tabChartData(series)
        this.chartOptions.xAxis.data = newData.dateList
        this.chartOptions.series = newData.list
      } finally {
        this.loading = false
      }
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        const updateValues = { ...values }
        this.$emit('update', this.options.i, updateValues)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
