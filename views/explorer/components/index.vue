<template>
  <a-row>
    <a-col :xs="{ span: 24 }" :xxl="{ span: 11 }" class="mb-5">
      <monitor-forms @refresh="refresh" @remove="remove" />
    </a-col>
    <a-col class="line mb-5" :xs="{ span: 24 }" :xxl="{ span: 12, offset: 1 }">
      <monitor-header
        class="mb-4"
        :timeOpts="timeOpts"
        :time.sync="time"
        :timeGroup.sync="timeGroup"
        @refresh="fetchAllData">
        <template v-slot:radio-button-append>
          <custom-date :time.sync="time" :customTime.sync="customTime" />
        </template>
      </monitor-header>
      <div>
        <monitor-line v-for="(item, i) in seriesList" class="mb-3" @chartInstance="setChartInstance" :series="item" :key="i" :timeFormatStr="timeFormatStr" />
      </div>
    </a-col>
  </a-row>
</template>

<script>
import echarts from 'echarts'
import MonitorForms from './forms'
import MonitorLine from './monitor-line'
import CustomDate from './monitor-line/CustomDate'
import { timeOpts } from '@Monitor/constants'
import MonitorHeader from '@/sections/Monitor/Header'

export default {
  name: 'ExplorerIndex',
  components: {
    MonitorForms,
    MonitorLine,
    MonitorHeader,
    CustomDate,
  },
  data () {
    return {
      time: '1h',
      timeGroup: '1m',
      customTime: null,
      timeOpts,
      metricList: [],
      seriesList: [],
      chartInstanceList: [], // e-chart 实例
      loading: false,
    }
  },
  computed: {
    timeFormatStr () {
      return this.timeOpts[this.time].timeFormat
    },
  },
  watch: {
    time () {
      this.fetchAllData()
    },
    timeGroup () {
      this.fetchAllData()
    },
  },
  methods: {
    remove (i) {
      this.metricList.splice(i, 1)
      this.chartInstanceList.splice(i, 1)
      this.seriesList.splice(i, 1)
    },
    setChartInstance (val, i) {
      this.chartInstanceList.push(val)
      echarts.connect(this.chartInstanceList)
    },
    async fetchAllData () {
      const seriesList = []
      for (let i = 0; i < this.metricList.length; i++) {
        const metric_query = this.metricList[i]
        const { series = [] } = await this.fetchData(metric_query)
        seriesList.push(series)
      }
      this.seriesList = seriesList
    },
    async refresh (params, i) { // 将多个查询 分开调用
      try {
        const metric_query = [{ model: params }]
        this.$set(this.metricList, i, metric_query)
        const { series = [] } = await this.fetchData(metric_query)
        this.$set(this.seriesList, i, series)
      } catch (error) {
        this.$set(this.seriesList, i, [])
        throw error
      }
    },
    async fetchData (metric_query) {
      try {
        const data = {
          metric_query,
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
        if (!data.metric_query || !data.metric_query.length || !data.from) return
        // this.loading = true
        const { data: resdata } = await new this.$Manager('unifiedmonitors', 'v1').performAction({ id: 'query', action: '', data })
        // this.loading = false
        return resdata
      } catch (error) {
        // this.loading = false
        throw error
      }
    },
  },
}
</script>
