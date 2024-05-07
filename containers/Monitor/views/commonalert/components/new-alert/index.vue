<template>
  <a-row v-loading="loading">
    <a-col :span="{ span: 24 }" class="mb-5">
      <alert-form
        v-if="!isUpdate || (loaded && !loading)"
        ref="alertFormRef"
        :alertData="alertData"
        :threshold.sync="threshold"
        :timeRangeParams="timeRangeParams"
        :isUpdate="isUpdate"
        @scopeChange="scopeChange" />
    </a-col>
  </a-row>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { getSignature } from '@/utils/crypto'
import { timeOpts } from '@/constants/monitor'
import { MONITOR_MAX_POINTERS } from '@Monitor/constants'
import AlertForm from './form'

export default {
  name: 'Commonalert',
  components: {
    AlertForm,
  },
  props: {
    isUpdate: {
      type: Boolean,
      default: false,
    },
    commonalertId: {
      type: String,
    },
  },
  data () {
    return {
      series: [],
      timeOpts,
      time: '1h',
      customTime: null,
      formmMetric: null,
      threshold: undefined,
      alertData: null,
      loading: false,
      loaded: false,
      chartLoading: false,
      pager: { seriesIndex: 0, total: 0, page: 1, limit: 10 },
      lineDescription: {},
      scopeParams: {},
    }
  },
  computed: {
    timeFormatStr () {
      const defaultTimeFormat = 'YYYY-MM-DD HH:mm'
      return _.get(this.timeOpts, '[this.time].timeFormat') || defaultTimeFormat
    },
    lineChartOptions () {
      if (!this.threshold) {
        return {
          legend: {
            show: false,
          },
        }
      }
      return {
        sampling: 'average',
        animation: false,
        legend: {
          show: false,
        },
        series: [{
          markLine: {
            lineStyle: {
              color: '#f5222d',
            },
            data: [{
              name: this.$t('monitor.text00014'),
              yAxis: this.threshold,
              label: {
                position: 'insideEndBottom',
              },
            }],
          },
        }],
      }
    },
    timeRangeParams () {
      const params = {}
      if (this.time === 'custom') { // 自定义时间
        if (this.customTime && this.customTime.from && this.customTime.to) {
          params.from = this.customTime.from
          params.to = this.customTime.to
        }
      } else {
        params.from = this.time
      }
      return params
    },
    timeGroup () {
      let tg = '1m'
      let diffHour = 1
      const noNumberReg = /\D+/g
      if (this.time === 'custom') {
        diffHour = this.customTime.from.replace(noNumberReg, '') - this.customTime.to.replace(noNumberReg, '')
      } else {
        diffHour = this.time.replace(noNumberReg, '')
      }
      const diff = diffHour * 60 // 变分钟
      tg = `${diff / MONITOR_MAX_POINTERS}m`
      return tg
    },
  },
  watch: {
    time () {
      this.fetchData()
    },
    customTime () {
      this.fetchData()
    },
    scopeParams () {
      this.fetchData()
    },
  },
  created () {
    if (this.isUpdate) {
      this.fetchCommonalert().then((res) => {
        if (this.alertData && this.alertData.common_alert_metric_details && this.alertData.common_alert_metric_details.length > 0) {
          const desc = this.alertData.common_alert_metric_details[0].field_description
          this.lineDescription.isUpdate = true
          this.lineDescription.metric_res_type = this.alertData.common_alert_metric_details[0].res_type
          if (this.alertData.common_alert_metric_details[0].measurement === 'cloudaccount_balance') {
            desc.unit = 'currency'
          }
          this.$set(this.lineDescription, 'description', desc || {})
        }
      })
    }
  },
  methods: {
    async fetchCommonalert () {
      try {
        this.loading = true
        const { data } = await new this.$Manager('commonalerts', 'v1')
          .get({
            id: this.commonalertId,
            params: { scope: this.$store.getters.scope },
          })
        this.alertData = data
        const time = _.get(this.alertData, 'settings.conditions[0].query.from')
        if (~time.indexOf('now-')) {
          this.time = 'custom'
          this.customTime = {
            from: time,
            to: _.get(this.alertData, 'settings.conditions[0].query.to') || 'now',
          }
        } else {
          this.time = this.timeOpts[time] ? time : '1h'
        }
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      } finally {
        this.loaded = true
      }
    },
    cancel () {
      this.$router.push('/commonalerts')
    },
    reset () {
      this.$refs.alertFormRef.form.fc.resetFields()
    },
    resetChart () {
      this.series = []
    },
    scopeChange (scopeParams) {
      this.scopeParams = scopeParams
    },
    async submit () {
      try {
        const { fd, metric_query } = await this.$refs.alertFormRef.validate()
        const data = {
          scope: fd.scope,
          // interval: this.timeGroup,
          alert_duration: fd.alert_duration,
          generate_name: fd.name,
          description: fd.description,
          period: fd.period,
          channel: fd.channel,
          recipients: fd.recipients,
          alert_type: 'normal', // normal(自定义) system(系统内置)
          level: fd.level,
          metric_query,
        }

        if (fd.silent_period) {
          data.silent_period = fd.silent_period
        }

        if (fd.comparator === 'nodata') {
          data.metric_query[0].condition_type = 'nodata_query'
        }
        if (fd.channel) {
          data.channel = fd.channel
        } else {
          data.channel = []
        }
        if (fd.robot_ids) {
          data.robot_ids = fd.robot_ids
        } else {
          data.robot_ids = []
        }
        if (fd.enabled_contact_types) {
          data.channel.push(...fd.enabled_contact_types)
        }
        if (fd.roles) {
          data.roles = fd.roles
        }
        if (fd.domain || fd.domain_id) data.domain_id = (fd.domain || fd.domain_id)
        if (fd.project) data.project_id = fd.project
        const periodNum = parseInt(fd.period)
        const unit = fd.period.split('').pop()
        if (unit === 'm' && periodNum * fd.alert_duration < 10) {
          data.from = '10m'
        } else {
          data.from = (periodNum * fd.alert_duration) + unit
        }
        if (data.metric_query && data.metric_query.length > 1) {
          data.metric_query.map(item => {
            item.operator = 'or'
          })
        }
        this.$emit('update:loading', true)
        if (this.isUpdate) {
          await new this.$Manager('commonalerts', 'v1').update({ id: this.commonalertId, data })
        } else {
          await new this.$Manager('commonalerts', 'v1').create({ data })
        }
        this.$emit('update:loading', false)
        this.$message.success(this.$t('common.success'))
        this.cancel()
      } catch (error) {
        this.$emit('update:loading', false)
        throw error
      }
    },
    async pageChange (pager) {
      await this._refresh(pager.limit, (pager.page - 1) * pager.limit)
    },
    async _refresh (limit, offset) {
      try {
        await this.fetchData(limit, offset)
      } catch (error) {
        this.formmMetric = { model: {} }
        throw error
      }
    },
    async refresh (params) {
      this.formmMetric = R.is(Object, params) ? [{ model: params }] : null
      await this._refresh(10, 0)
    },
    async fetchData (limit = this.pager.limit, offset = 0) {
      try {
        const data = {
          metric_query: this.formmMetric,
          interval: this.timeGroup,
          slimit: limit,
          soffset: offset,
          ...this.scopeParams,
        }
        if (this.time === 'custom') { // 自定义时间
          if (this.customTime && this.customTime.from && this.customTime.to) {
            data.from = this.customTime.from
            data.to = this.customTime.to
          }
        } else {
          data.from = this.time
        }
        if (!data.metric_query || !data.from || !_.get(data.metric_query, '[0].model.measurement') || !_.get(data.metric_query, '[0].model.select')) return
        this.chartLoading = true
        data.signature = getSignature(data)
        const { data: { series = [], series_total = 0 } } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data })
        this.series = []
        this.$nextTick(_ => {
          if (this.lineDescription.id === 'balance' && this.lineDescription.metric_res_type === 'cloudaccount') {
            const currencyList = []
            series.map(item => {
              const { tags = {} } = item
              const { currency = 'CNY' } = tags
              if (!currencyList.includes(currency)) {
                currencyList.push(currency)
              }
            })
            if (currencyList.length !== 1 && this.lineDescription.description) {
              this.lineDescription.description.unit = ''
            }
            if (currencyList.length === 1 && this.lineDescription.description) {
              this.lineDescription.description.unit = 'currency'
            }
          }
          this.series = series
          this.pager = { seriesIndex: 0, total: series_total, page: 1 + offset / limit, limit: limit }
          this.chartLoading = false
        })
      } catch (error) {
        this.chartLoading = false
        throw error
      }
    },
  },
}
</script>
