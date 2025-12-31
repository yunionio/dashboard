<template>
  <a-row>
    <a-col :span="isTemplate ? 24 : undefined" :md="isTemplate ? 24 : 24" :lg="isTemplate ? 24 : 22" :xl="isTemplate ? 24 : 16" :xxl="isTemplate ? 24 : 10" class="mb-5">
      <monitor-forms
       @refresh="refresh"
        @remove="remove"
        @resetChart="resetChart"
        :timeRangeParams="timeRangeParams"
        @mertricItemChange="mertricItemChange"
        :extraParams="extraParams"
        :multiQuery="!isTemplate"
        :panel="templateParams?.panel" />
    </a-col>
    <a-col :span="isTemplate ? 24 : undefined" class="line mb-5" :md="isTemplate ? 24 : 24" :lg="isTemplate ? 24 : 22" :xl="isTemplate ? 24 : 16" :xxl="isTemplate ? { span: 24 } : { span: 13, offset: 1 }">
      <monitor-header
        class="mb-3"
        :time.sync="time"
        :timeGroup.sync="timeGroup"
        :showTimegroup="true"
        :showGroupFunc="true"
        :customTime.sync="customTime"
        :showCustomTimeText="time==='custom'"
        :showCustomTime="!isTemplate"
        customTimeUseTimeStamp
        @refresh="fetchAllData" />
      <div v-for="(item, i) in seriesList" :key="i">
        <monitor-line
          :ref="`monitorLine${i}`"
          :loading="loadingList[i]"
          :description="seriesDescription[i]"
          :metricInfo="metricList[i][0]"
          class="mb-3"
          :isTemplate="isTemplate"
          @chartInstance="setChartInstance"
          :series="item"
          :reducedResult="resultList[i]"
          :timeFormatStr="timeFormatStr"
          :pager="seriesListPager[i]"
          :reducedResultOrder="resultOrderList[i]"
          showTableExport
          @pageChange="pageChange"
          @exportTable="(total) => exportTable(i, total)"
          @reducedResultOrderChange="(order) => reducedResultOrderChange(i, order)">
          <template #extra>
            <a-button class="mr-3" type="link" @click="handleSave(metricList[i], seriesDescription[i])">{{ $t('common.save') }}</a-button>
          </template>
        </monitor-line>
      </div>
      <a-card v-if="!seriesList.length && loadingList[0]" class="explorer-monitor-line d-flex align-items-center justify-content-center">
        <loader :loading="true" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import get from 'lodash/get'
import echarts from 'echarts'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import MonitorForms from '@Monitor/sections/ExplorerForm'
import MonitorLine from '@Monitor/sections/MonitorLine'
import MonitorHeader from '@/sections/Monitor/Header'
import { getRequestT } from '@/utils/utils'
import { getSignature } from '@/utils/crypto'
import { timeOpts } from '@/constants/monitor'
import MonitorTimeMixin from '@/mixins/monitorTime'
import { addMissingSeries } from '@Monitor/utils'

export default {
  name: 'ExplorerIndex',
  components: {
    MonitorForms,
    MonitorLine,
    MonitorHeader,
  },
  mixins: [DialogMixin, WindowsMixin, MonitorTimeMixin],
  props: {
    isTemplate: {
      type: Boolean,
      default: false,
    },
    isTemplateEdit: {
      type: Boolean,
      default: false,
    },
    templateParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      time: this.templateParams?.queryParams?.time || '1h',
      timeGroup: this.templateParams?.queryParams?.timeGroup || '1m',
      // groupFunc: 'mean',
      customTime: null,
      timeOpts,
      metricList: [],
      seriesList: [],
      resultList: [],
      resultOrderList: [],
      seriesListPager: [],
      chartInstanceList: [], // e-chart 实例
      loadingList: [],
      seriesDescription: [],
      get,
      tablePageSize: 10,
    }
  },
  computed: {
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
  },
  watch: {
    timeGroup () {
      this.fetchAllData()
    },
    time () {
      this.smartFetchAllData()
    },
    customTime () {
      this.smartFetchAllData()
    },
    // groupFunc () {
    //   this.fetchAllData()
    // },
  },
  methods: {
    initTablePageSize (size) {
      this.tablePageSize = size
    },
    smartFetchAllData () { // 根据选择的时间范围智能的赋值时间间隔进行查询
      this.$nextTick(this.fetchAllData)
    },
    remove (i) {
      this.metricList.splice(i, 1)
      this.chartInstanceList.splice(i, 1)
      this.seriesList.splice(i, 1)
      this.resultList.splice(i, 1)
      this.resultOrderList.splice(i, 1)
      this.loadingList.splice(i, 1)
    },
    setChartInstance (val, i) {
      this.chartInstanceList.push(val)
      echarts.connect(this.chartInstanceList)
    },
    resetChart (i) {
      if (this.seriesList && this.seriesList.length && this.seriesList[i]) {
        this.$set(this.seriesList, i, [])
        this.$set(this.resultList, i, [])
        this.$set(this.resultOrderList, i, '')
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
      if (this.isTemplate && (!item.title || item.title === '-') && i === 0 && this.templateParams?.panel?.panel_name) {
        this.$set(this.seriesDescription, i, { ...item, title: this.templateParams?.panel?.panel_name })
      } else {
        this.$set(this.seriesDescription, i, item)
      }
    },
    async fetchAllData () {
      const jobs = []
      this.loadingList = []
      for (let i = 0; i < this.metricList.length; i++) {
        const metric_query = this.metricList[i]
        this.loadingList.push(true)
        jobs.push(this.fetchData(metric_query, this.tablePageSize, 0))
      }
      try {
        const moment = this.$moment()
        const res = await Promise.all(jobs)
        this.seriesList = res.map(val => addMissingSeries(get(val, 'series') || [], { ...this.timeRangeParams, interval: this.timeGroup }, moment))
        this.resultList = res.map(val => get(val, 'reduced_result') || [])
        this.resultOrderList = res.map(() => '')
        this.seriesListPager = res.map((val, index) => ({ seriesIndex: index, total: get(val, 'series_total') || 0, page: 1, limit: this.tablePageSize }))
        this.loadingList = this.loadingList.map(v => false)
        this.saveMonitorConfig()
      } catch (error) {
        this.loadingList = this.loadingList.map(v => false)
        throw error
      }
    },
    async _refresh (i, limit, offset, ignoreOrder) {
      try {
        this.$set(this.loadingList, i, true)
        const { series = [], reduced_result = [], series_total = 0 } = await this.fetchData(this.metricList[i], limit, offset)
        this.$set(this.seriesList, i, series)
        this.$set(this.resultList, i, reduced_result)
        if (!ignoreOrder) {
          this.$set(this.resultOrderList, i, '')
        }
        this.$set(this.seriesListPager, i, { seriesIndex: i, total: series_total, page: 1 + offset / limit, limit: limit })
        this.loadingList[i] = false
      } catch (error) {
        this.$set(this.seriesList, i, [])
        this.$set(this.resultList, i, [])
        if (!ignoreOrder) {
          this.$set(this.resultOrderList, i, '')
        }
        this.$set(this.loadingList, i, false)
        throw error
      }
    },
    async refresh (params, resParams, i) { // 将多个查询 分开调用
      const val = { model: params }
      if (resParams.type) {
        val.result_reducer = resParams
      }
      const metric_query = [val]
      this.$set(this.metricList, i, metric_query)
      await this._refresh(i, this.tablePageSize, 0)
    },
    reducedResultOrderChange (i, order) {
      this.resultOrderList[i] = order
      this.metricList[i][0].result_reducer_order = order
      this._refresh(i, this.seriesListPager[i].limit, 0, true)
    },
    async pageChange (pager) {
      await this._refresh(pager.seriesIndex, pager.limit, (pager.page - 1) * pager.limit)
      this.saveMonitorConfig({ tablePageSize: pager.limit })
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
        if (!data.metric_query || !data.metric_query.length || !data.from) return
        data.signature = getSignature(data)
        const { data: resdata } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data, params: { $t: getRequestT() } })
        return resdata
      } catch (error) {
        throw error
      }
    },
    handleSave (mq, desc) {
      this.createDialog('CreateMonitorDashboardChart', {
        name: desc.title,
        metric_query: mq,
        timeGroup: this.timeGroup,
        timeRangeParams: this.timeRangeParams,
      })
    },
    async exportTable (index, total) {
      try {
        const { series = [], reduced_result = [], series_total = 0 } = await this.fetchData(this.metricList[index], total, 0)
        if (this.$refs[`monitorLine${index}`] && this.$refs[`monitorLine${index}`][0] && this.$refs[`monitorLine${index}`][0].exportFullData) {
          this.$refs[`monitorLine${index}`][0].exportFullData(series, reduced_result, series_total)
        }
      } catch (error) {
        throw error
      }
    },
    getTemplateParams () {
      return {
        panel_name: this.seriesDescription[0].title || this.seriesDescription[0].label,
        time: this.time,
        timeGroup: this.timeGroup,
        model: this.metricList[0][0].model,
        result_reducer: this.metricList[0][0].result_reducer,
        common_alert_metric_details: [
          {
            res_type: this.seriesDescription[0].metric_res_type,
            measurement: this.seriesDescription[0].metricKeyItem?.measurement,
            field: this.seriesDescription[0].key,
          },
        ],
      }
    },
  },
}
</script>
