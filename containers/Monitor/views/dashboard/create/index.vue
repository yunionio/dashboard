<template>
  <div>
    <page-header :title="this.panelId ? $t('monitor.dashboard.dialog.project.update') : $t('monitor.dashboard.dialog.project.create')" />
    <page-body needMarginBottom v-if="initFinished">
      <a-row>
        <a-col :md="{ span: 24 }" :lg="{ span: 22 }" :xl="{ span: 16 }"  :xxl="{ span: 11 }" class="mb-5">
          <monitor-forms
            :panel="panel"
            :queryOnly="false"
            :multiQuery="false"
            :timeRangeParams="timeRangeParams"
            :extraParams="extraParams"
            @nameChange="nameChange"
            @refresh="refresh"
            @remove="remove"
            @resetChart="resetChart"
            @mertricItemChange="mertricItemChange" />
        </a-col>
        <a-col class="line mb-5"
               :md="{ span: 24 }"
               :lg="{ span: 22 }"
               :xl="{ span: 16 }"
               :xxl="{ span: 12, offset: 1 }">
          <monitor-header
              class="mb-4"
              :time.sync="time"
              :timeGroup.sync="timeGroup"
              :showTimegroup="true"
              :showGroupFunc="true"
              :customTime.sync="customTime"
              :showCustomTimeText="time==='custom'"
              customTimeUseTimeStamp
              @refresh="fetchAllData" />
          <div v-for="(item, i) in seriesList" :key="i">
            <monitor-line
              :ref="`monitorLine${i}`"
              class="mb-3"
              :pager="seriesListPager[i]"
              :loading="loadingList[i]"
              :description="seriesDescription[i]"
              :metricInfo="metricList[i][0]"
              :series="item"
              :reducedResult="resultList[i]"
              :reducedResultOrder="resultOrderList[i]"
              showTableExport
              @pageChange="pageChange"
              @chartInstance="setChartInstance"
              @reducedResultOrderChange="(order) => reducedResultOrderChange(i, order)"
              @exportTable="(total) => exportTable(i, total)" />
          </div>
          <a-card v-if="!seriesList.length && loadingList[0]"
                  class="explorer-monitor-line d-flex align-items-center justify-content-center">
            <loader :loading="true" />
          </a-card>
        </a-col>
      </a-row>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary"
                  :loading="loading"
                  :disabled="metricList.length === 0"
                  @click="handleConfirm">
          {{ $t('common.save') }}
        </a-button>
        <a-button @click="goback">{{ $t('common.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import get from 'lodash/get'
import echarts from 'echarts'
import MonitorForms from '@Monitor/sections/ExplorerForm'
import MonitorLine from '@Monitor/sections/MonitorLine'
// import { MONITOR_MAX_POINTERS } from '@Monitor/constants'
import MonitorHeader from '@/sections/Monitor/Header'
import { getRequestT, uuid } from '@/utils/utils'
import { getSignature } from '@/utils/crypto'
import MonitorTimeMixin from '@/mixins/monitorTime'

export default {
  name: 'MonitorDashboardChartCreate',
  components: {
    MonitorForms,
    MonitorLine,
    MonitorHeader,
  },
  mixins: [MonitorTimeMixin],
  data () {
    const extraParams = {}
    if (this.$route.params.scope) {
      extraParams.scope = this.$route.params.scope
    }
    if (this.$route.params.domain_id) {
      extraParams.domain_id = this.$route.params.domain_id
    }
    if (this.$route.params.project_id) {
      extraParams.project_id = this.$route.params.project_id
    }
    return {
      initFinished: !this.$route.params.id,
      panelId: this.$route.params.id || '',
      panel: {},
      time: '1h',
      // groupFunc: 'mean',
      timeGroup: '1m',
      customTime: null,
      metricList: [],
      seriesList: [],
      resultList: [],
      resultOrderList: [],
      seriesListPager: [],
      chartInstanceList: [], // e-chart 实例
      loadingList: [],
      seriesDescription: [],
      extraParams: extraParams,
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
      this.fetchAllData()
    },
    customTime () {
      this.fetchAllData()
    },
    // groupFunc (val) {
    //   this.fetchAllData()
    // },
  },
  // created () {
  //   if (this.panelId) {
  //     this.fetchPanel()
  //   }
  // },
  mounted () {
    if (this.panelId) {
      this.fetchPanel()
    }
  },
  methods: {
    initTablePageSize (size) {
      this.tablePageSize = size
    },
    fetchPanel () {
      this.loading = true
      try {
        const params = {
          details: true,
          ...this.extraParams,
        }
        new this.$Manager('alertpanels', 'v1').get({ id: this.panelId, params }).then((res) => {
          this.loading = false
          this.panel = Object.assign({}, this.panel, res.data)
          const { time, timeGroup, customTime, groupFunc } = this.$route.params
          this.time = time
          this.timeGroup = timeGroup
          this.customTime = customTime
          this.groupFunc = groupFunc
          this.initFinished = true
        })
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
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
        this.$set(this.resultOrderList, i, [])
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
        // groupFunc 为该时间间隔内如何聚合数据，与原图表group_by不一样
        // metric_query.forEach((query, index) => {
        //   const { model = {} } = query
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
        //     metric_query[index].model.select = select
        //   }
        // })
        this.loadingList.push(true)
        jobs.push(this.fetchData(metric_query, this.tablePageSize, 0))
      }
      try {
        const res = await Promise.all(jobs)
        this.seriesList = res.map(val => get(val, 'series') || [])
        this.resultList = res.map(val => get(val, 'reduced_result') || [])
        this.resultOrderList = res.map(val => '')
        this.seriesListPager = res.map((val, index) => ({ seriesIndex: index, total: get(val, 'series_total') || 0, page: 1, limit: this.tablePageSize }))
        this.loadingList = this.loadingList.map(v => false)
        this.saveMonitorConfig()
      } catch (error) {
        this.loadingList = this.loadingList.map(v => false)
        throw error
      }
    },
    reducedResultOrderChange (i, order) {
      this.resultOrderList[i] = order
      this.metricList[i][0].result_reducer_order = order
      this._refresh(i, this.seriesListPager[i].limit, 0, true)
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
          ...this.extraParams,
        }
        if (!data.metric_query || !data.metric_query.length || !data.from) return
        // groupFunc 为该时间间隔内如何聚合数据，与原图表group_by不一样
        // data.metric_query.forEach((query, index) => {
        //   const { model = {} } = query
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
        //     data.metric_query[index].model.select = select
        //   }
        // })
        data.signature = getSignature(data)
        const { data: resdata } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data, params: { $t: getRequestT() } })
        return resdata
      } catch (error) {
        throw error
      }
    },
    goback () {
      this.$router.push({ path: '/monitor-dashboard', query: { dashboard_id: this.$route.params.dashboard } })
    },
    async handleConfirm () {
      this.loading = true
      const mq = this.metricList[0]
      const name = mq[0].model.name
      delete mq[0].model.name
      try {
        const data = {
          name: name || uuid(32),
          dashboard_id: this.$route.params.dashboard,
          metric_query: mq,
          interval: this.timeGroup,
          scope: this.$store.getters.scope,
          ...this.timeRangeParams,
        }
        if (!data.metric_query || !data.metric_query.length || !data.from || !data.dashboard_id) return
        if (this.panelId) {
          // update
          await new this.$Manager('alertpanels', 'v1').update({ id: this.panelId, data })
        } else {
          await new this.$Manager('alertpanels', 'v1').create({ data })
        }
        this.loading = false
        this.goback()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    nameChange (name, index) {
      if (this.metricList[index] && this.metricList[index][0] && this.metricList[index][0].model) {
        this.$set(this.metricList[index][0].model, 'name', name)
      }
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
  },
}
</script>
