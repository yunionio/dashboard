<template>
  <a-row v-loading="loading">
    <a-col :md="{ span: 24 }" :lg="{ span: 22 }" :xl="{ span: 16 }" :xxl="{ span: 11 }" class="mb-5">
      <alert-form ref="alertFormRef" v-if="!isUpdate || (loaded && !loading)" @refresh="refresh" :threshold.sync="threshold" :alertData="alertData" @resetChart="resetChart" @mertricItemChange="mertricItemChange" :timeRangeParams="timeRangeParams" />
    </a-col>
    <a-col class="line mb-5" :md="{ span: 24 }" :lg="{ span: 22 }" :xl="{ span: 16 }" :xxl="{ span: 12, offset: 1 }">
      <monitor-header
        class="mb-4"
        :timeOpts="timeOpts"
        :time.sync="time"
        :timeGroup.sync="timeGroup"
        @refresh="fetchData">
        <template v-slot:radio-button-append>
          <custom-date :time.sync="time" :customTime.sync="customTime" />
        </template>
      </monitor-header>
      <div>
        <template v-if="chartLoading"><loader loading /></template>
        <monitor-line v-else class="mb-3" :series="series" :timeFormatStr="timeFormatStr" :lineChartOptions="lineChartOptions" :description="lineDescription" />
      </div>
    </a-col>
  </a-row>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import AlertForm from './form'
import MonitorLine from '@Monitor/sections/MonitorLine'
import CustomDate from '@Monitor/sections/MonitorLine/CustomDate'
import { timeOpts } from '@Monitor/constants'
import MonitorHeader from '@/sections/Monitor/Header'

export default {
  name: 'Commonalert',
  components: {
    MonitorHeader,
    MonitorLine,
    AlertForm,
    CustomDate,
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
      timeGroup: '1m',
      customTime: null,
      formmMetric: null,
      threshold: undefined,
      alertData: null,
      loading: false,
      loaded: false,
      chartLoading: false,
      lineDescription: {},
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
  },
  watch: {
    time () {
      this.fetchData()
    },
    timeGroup () {
      this.fetchData()
    },
    customTime () {
      this.fetchData()
    },
  },
  created () {
    if (this.isUpdate) {
      this.fetchCommonalert()
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
        this.timeGroup = _.get(this.alertData, 'settings.conditions[0].query.model.interval')
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
    async submit () {
      try {
        const { fd, monitorParams } = await this.$refs.alertFormRef.validate()
        const data = {
          interval: this.timeGroup,
          generate_name: fd.name,
          period: fd.period,
          channel: fd.channel,
          recipients: fd.recipients,
          alert_type: 'normal', // normal(自定义) system(系统内置)
          level: fd.level,
          metric_query: [{
            model: monitorParams,
            reduce: 'avg',
            comparator: fd.comparator,
            threshold: fd.threshold,
          }],
        }
        if (fd.domain || fd.domain_id) data.domain_id = (fd.domain || fd.domain_id)
        if (fd.project) data.project_id = fd.project
        if (fd.scope === 'domain' || fd.scope === 'project') {
          if (!data.domain_id && !data.project_id) {
            data.scope = fd.scope
          }
        }
        if (this.time === 'custom') { // 自定义时间
          if (this.customTime && this.customTime.from && this.customTime.to) {
            data.from = this.customTime.from
            data.to = this.customTime.to
          }
        } else {
          data.from = this.time
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
    async refresh (params) { // 将多个查询 分开调用
      try {
        this.formmMetric = R.is(Object, params) ? [{ model: params }] : null
        await this.fetchData()
      } catch (error) {
        this.formmMetric = { model: {} }
        throw error
      }
    },
    async fetchData () {
      try {
        const data = {
          metric_query: this.formmMetric,
          interval: this.timeGroup,
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
        const { data: { series = [] } } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data })
        this.series = series
        this.chartLoading = false
      } catch (error) {
        this.chartLoading = false
        throw error
      }
    },
    mertricItemChange (val) {
      const t = +this.time.replace(/\D+/, '')
      const existBalance = this.lineDescription.id === 'balance'
      if (!existBalance && val.id === 'balance' && ~this.time.indexOf('h') && t < 3) { // 时间都是转换成h了，这里仅需要对比h即可
        this.time = '72h'
        this.$message.warning(this.$t('common_562', [val.label]))
      }
      this.lineDescription = val
    },
  },
}
</script>
