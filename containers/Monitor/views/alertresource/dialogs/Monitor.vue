<template>
  <base-dialog @cancel="cancelDialog" :width="1200">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-card class="mb-3" size="small" :title="metricData.metric">
        <div class="Rheader"><span>{{ $t('dashboard.text_20') }}： </span><span>{{metricData.metric}}</span></div>
        <div class="Rheader"><span>{{ $t('common.current_value') }}： </span><span>{{metricData.value_str}}</span></div>
        <monitor-header
          class="mt-4 mb-4"
          :timeOpts="timeOpts"
          :time.sync="time"
          :showTimegroup="false"
          :showGroupFunc="false"
          @refresh="fetchAllData">
          <template v-slot:radio-button-append>
            <custom-date :time.sync="time" :customTime.sync="customTime" :showCustomTimeText="time==='custom'" />
          </template>
        </monitor-header>
        <a-card v-if="isEmpty && isLoading" :title="seriesDescription[0]?.title" size="small">
          <loader :loading="true" />
        </a-card>
        <div v-for="(item, i) in seriesList" :key="i">
          <monitor-line :loading="loadingList[i]" :description="seriesDescription[i]" :metricInfo="metricList[i][0]" class="mb-3" @chartInstance="setChartInstance" :series="item" :timeFormatStr="timeFormatStr" :pager="seriesListPager[i]" @pageChange="pageChange" />
        </div>
      </a-card>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import get from 'lodash/get'
import echarts from 'echarts'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { getRequestT } from '@/utils/utils'
import { getSignature } from '@/utils/crypto'
import { timeOpts } from '@/constants/monitor'
import MonitorLine from '@Monitor/sections/MonitorLine'
import { MONITOR_MAX_POINTERS, metric_zh } from '@Monitor/constants'
import CustomDate from '@/sections/CustomDate'
import MonitorHeader from '@/sections/Monitor/Header'

export default {
  name: 'ViewMonitorDialog',
  components: {
    MonitorLine,
    MonitorHeader,
    CustomDate,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const metricQuery = this.params.data.map(item => {
      const alert_detail = item.data.alert_details
      const tag = item.data.tags
      const originTags = [{
        key: 'vm_id',
        operator: '=',
        value: tag.vm_id,
      }]
      if (alert_detail.measurement === 'agent_cpu') {
        originTags.push({
          key: 'cpu',
          operator: '=',
          value: 'cpu-total',
        })
      }

      return {
        model: {
          database: alert_detail.db,
          measurement: alert_detail.measurement,
          select: [
            [
              {
                type: 'field',
                params: [
                  alert_detail.field,
                ],
              },
            ],
          ],
          tags: originTags,
        },
      }
    })
    const seriesDesc = this.params.data.map(item => {
      const alert_detail = item.data.alert_details || {}

      return {
        description: alert_detail.field_description,
        title: `${this.$t(`dictionary.${alert_detail.res_type}`)}${metric_zh[alert_detail.measurement_display_name]}(${metric_zh[alert_detail.field_description?.display_name]})`,
      }
    })
    return {
      time: '1h',
      timeGroup: '2m',
      customTime: null,
      timeOpts,
      metricList: [metricQuery],
      seriesList: [],
      seriesListPager: [],
      chartInstanceList: [], // e-chart 实例
      loadingList: [],
      seriesDescription: seriesDesc,
      get,
    }
  },
  computed: {
    isEmpty () {
      return this.seriesList.length === 0
    },
    isLoading () {
      return this.loadingList.some(v => v)
    },
    timeFormatStr () {
      return this.timeOpts[this.time].timeFormat
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
    curItem () {
      return this.params.data[0] || {}
    },
    metricData () {
      return this.curItem.data || {}
    },
  },
  watch: {
    time () {
      this.smartFetchAllData()
    },
    customTime () {
      this.smartFetchAllData()
    },
  },
  created () {
    this.smartFetchAllData()
  },
  methods: {
    smartFetchAllData () { // 根据选择的时间范围智能的赋值时间间隔进行查询
      let diffHour = 1
      const noNumberReg = /\D+/g
      if (this.time === 'custom') {
        diffHour = this.customTime.from.replace(noNumberReg, '') - this.customTime.to.replace(noNumberReg, '')
      } else {
        diffHour = this.time.replace(noNumberReg, '')
      }
      const diff = diffHour * 60 // 变分钟
      this.timeGroup = `${diff / MONITOR_MAX_POINTERS}m`
      this.$nextTick(this.fetchAllData)
    },
    remove (i) {
      this.metricList.splice(i, 1)
      this.chartInstanceList.splice(i, 1)
      this.seriesList.splice(i, 1)
      this.loadingList.splice(i, 1)
    },
    setChartInstance (val, i) {
      this.chartInstanceList.push(val)
      echarts.connect(this.chartInstanceList)
    },
    resetChart (i) {
      if (this.seriesList && this.seriesList.length && this.seriesList[i]) {
        this.$set(this.seriesList, i, [])
        this.$set(this.metricList, i, [])
        this.$set(this.seriesDescription[i], 'title', '')
      }
    },
    mertricItemChange (item, i) {
      const t = +this.time.replace(/\D+/, '')
      const existBalance = this.seriesDescription.find(val => val.id === 'balance')
      if (!existBalance && item.id === 'balance' && ~this.time.indexOf('h') && t < 3) { // 时间都是转换成h了，这里仅需要对比h即可
        this.time = '72h'
        this.$message.warning(this.$t('common_562', [item.label]))
      }
      this.$set(this.seriesDescription, i, item)
    },
    async fetchAllData () {
      const jobs = []
      this.loadingList = []
      for (let i = 0; i < this.metricList.length; i++) {
        const metric_query = this.metricList[i]
        this.loadingList.push(true)
        jobs.push(this.fetchData(metric_query, 10, 0))
      }
      try {
        const res = await Promise.all(jobs)
        this.seriesList = res.map(val => get(val, 'series') || [])
        this.seriesListPager = res.map((val, index) => ({ seriesIndex: index, total: get(val, 'series_total') || 0, page: 1, limit: 10 }))
        this.loadingList = this.loadingList.map(v => false)
      } catch (error) {
        this.loadingList = this.loadingList.map(v => false)
        throw error
      }
    },
    async _refresh (i, limit, offset) {
      try {
        this.$set(this.loadingList, i, true)
        const { series = [], series_total = 0 } = await this.fetchData(this.metricList[i], limit, offset)
        this.$set(this.seriesList, i, series)
        this.$set(this.seriesListPager, i, { seriesIndex: i, total: series_total, page: 1 + offset / limit, limit: limit })
        this.loadingList[i] = false
      } catch (error) {
        this.$set(this.seriesList, i, [])
        this.$set(this.loadingList, i, false)
        throw error
      }
    },
    async refresh (params, i) { // 将多个查询 分开调用
      const metric_query = [{ model: params }]
      this.$set(this.metricList, i, metric_query)
      await this._refresh(i, 10, 0)
    },
    async pageChange (pager) {
      await this._refresh(pager.seriesIndex, pager.limit, (pager.page - 1) * pager.limit)
    },
    async fetchData (metric_query, limit, offset) {
      try {
        const data = {
          metric_query,
          interval: this.timeGroup,
          scope: this.$store.getters.scope,
          slimit: limit,
          soffset: offset,
          ...this.timeRangeParams,
        }
        if (!data.metric_query || !data.metric_query.length) return
        data.signature = getSignature(data)
        const { data: resdata } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data, params: { $t: getRequestT() } })
        return resdata
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.Rheader {
  font-size: 20px;
  font-weight: 600;
}
</style>
