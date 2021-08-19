<template>
  <div>
    <page-header :title="this.panelId ? $t('monitor.dashboard.dialog.project.update') : $t('monitor.dashboard.dialog.project.create')" />
    <page-body v-if="initFinished">
      <a-row>
        <a-col :md="{ span: 24 }" :lg="{ span: 22 }" :xl="{ span: 16 }"  :xxl="{ span: 11 }" class="mb-5">
          <monitor-forms
            :panel="panel"
            :queryOnly="false"
            :multiQuery="false"
            :timeRangeParams="timeRangeParams"
            :extraParams="extraParams"
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
              :timeOpts="timeOpts"
              :time.sync="time"
              :showTimegroup="false"
              @refresh="fetchAllData">
            <template v-slot:radio-button-append>
              <custom-date :time.sync="time" :customTime.sync="customTime" />
            </template>
          </monitor-header>
          <div v-for="(item, i) in seriesList" :key="i">
            <monitor-line
              class="mb-3"
              :pager="seriesListPager[i]"
              :loading="loadingList[i]"
              :description="seriesDescription[i]"
              :metricInfo="metricList[i][0]"
              :series="item"
              :timeFormatStr="timeFormatStr"
              @pageChange="pageChange"
              @chartInstance="setChartInstance" />
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
import { MONITOR_MAX_POINTERS } from '@Monitor/constants'
import CustomDate from '@/sections/CustomDate'
import MonitorHeader from '@/sections/Monitor/Header'
import { getRequestT, uuid } from '@/utils/utils'
import { getSignature } from '@/utils/crypto'
import { timeOpts } from '@/constants/monitor'

export default {
  name: 'MonitorDashboardChartCreate',
  components: {
    MonitorForms,
    MonitorLine,
    MonitorHeader,
    CustomDate,
  },
  data () {
    const extraParams = {}
    if (this.$route.query.scope) {
      extraParams.scope = this.$route.query.scope
    }
    if (this.$route.query.domain_id) {
      extraParams.domain_id = this.$route.query.domain_id
    }
    if (this.$route.query.project_id) {
      extraParams.project_id = this.$route.query.project_id
    }

    return {
      initFinished: !this.$route.params.id,
      panelId: this.$route.params.id || '',
      panel: {},
      time: '1h',
      timeGroup: '2m',
      customTime: null,
      timeOpts,
      metricList: [],
      seriesList: [],
      seriesListPager: [],
      chartInstanceList: [], // e-chart 实例
      loadingList: [],
      seriesDescription: [],
      extraParams: extraParams,
      get,
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
    time () {
      this.smartFetchAllData()
    },
    customTime () {
      this.smartFetchAllData()
    },
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
          this.initFinished = true
        })
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
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
          ...this.extraParams,
        }
        if (!data.metric_query || !data.metric_query.length || !data.from) return
        data.signature = getSignature(data)
        const { data: resdata } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data, params: { $t: getRequestT() } })
        return resdata
      } catch (error) {
        throw error
      }
    },
    goback () {
      this.$router.push({ path: '/monitor-dashboard', query: { dashboard_id: this.$route.query.dashboard } })
    },
    async handleConfirm () {
      this.loading = true
      const mq = this.metricList[0]
      const name = mq[0].model.name
      delete mq[0].model.name
      try {
        const data = {
          name: name || uuid(32),
          dashboard_id: this.$route.query.dashboard,
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
  },
}
</script>
