<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">历史资源总览<a-icon class="ml-2" type="loading" v-if="loading" /></div>
      </div>
      <div class="dashboard-card-body align-items-center">
        <template v-if="chartData.xAxisData && chartData.xAxisData.length > 0">
          <e-chart style="width: 100%; height: 100%;" :options="chartOptions" autoresize />
        </template>
        <template v-else>
          <div class="w-100 text-center">
            <a-empty />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'

export const options = {
  label: '总览',
  desc: '历史资源总览',
  thumb: require('./assets/thumb.svg'),
  h: 3,
  w: 5,
  sort: 7,
  galleryHidden: true,
}

export default {
  name: 'ResourceHistoryLine',
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
  },
  data () {
    return {
      data: {},
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode']),
    chartData () {
      const data = this.data[0] || {}
      const series = [
        this.genSerie('裸金属服务器(台)', '#1a9bfc'),
        this.genSerie('CPU(核)', '#99da69'),
        this.genSerie('磁盘(GB)', '#fa704d'),
        this.genSerie('GPU(卡)', '#34bfa3'),
        this.genSerie('内存(G)', '#E3E36A'),
      ]
      const xAxisData = []
      R.forEach(item => {
        xAxisData.push(this.$moment(item[0]).format('MM月DD日'))
        series[0].data.push((+item[5] || 0).toFixed(2))
        series[1].data.push((+item[1] || 0).toFixed(2))
        series[2].data.push((+item[3] || 0).toFixed(2))
        series[3].data.push((+item[4] || 0).toFixed(2))
        series[4].data.push((+item[2] || 0).toFixed(2))
      }, data.values || [])
      return { series, xAxisData }
    },
    chartOptions () {
      return {
        grid: {
          left: 10,
          top: 30,
          right: 10,
          bottom: 0,
          containLabel: true,
        },
        legend: {
          right: 5,
          data: ['裸金属服务器(台)', 'CPU(核)', '磁盘(GB)', 'GPU(卡)', '内存(G)'],
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#ddd',
            },
          },
          backgroundColor: 'rgba(255,255,255,1)',
          padding: [5, 10],
          textStyle: {
            color: '#7588E4',
          },
          extraCssText: 'box-shadow: 0 0 5px rgba(0,0,0,0.3)',
        },
        xAxis: {
          type: 'category',
          data: this.chartData.xAxisData,
          splitLine: {
            show: true,
            interval: 'auto',
            lineStyle: {
              color: ['#D4DFF5'],
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#999',
            },
          },
          axisLabel: {
            showMaxLabel: false,
            margin: 10,
            align: 'left',
            textStyle: {
              fontSize: 12,
            },
          },
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: ['#D4DFF5'],
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#999',
            },
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 12,
            },
          },
        },
        series: this.chartData.series,
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const data = await load({
          res: 'query',
          actionArgs: {
            baseURL: '',
            url: '/query',
            method: 'GET',
            params: {
              $t: getRequestT(),
              db: 'meter_db',
              q: this.genSQLQuery(),
              epoch: 'ms',
            },
          },
          useManager: false,
          resPath: 'data.results[0].series',
        })
        this.data = data || {}
      } finally {
        this.loading = false
      }
    },
    genSQLQuery () {
      if (this.isAdminMode) {
        return `SELECT sum(cpuCount) AS "cpuCount", sum(memCount) AS "memCount", sum(diskCount) AS "diskCount", sum(gpuCount) AS "gpuCount", sum(baremetalCount) AS "baremetalCount" FROM meter_res_usage where time > now() - ${30 * 24}h and time <= now() - 24h GROUP BY time(24h)`
      }
      return `SELECT sum(cpuCount) AS "cpuCount", sum(memCount) AS "memCount", sum(diskCount) AS "diskCount", sum(gpuCount) AS "gpuCount", sum(baremetalCount) AS "baremetalCount" FROM meter_res_usage where time > now() - ${30 * 24}h and time <= now() - 24h AND projectId='${this.userInfo.projectId}' GROUP BY time(24h)`
    },
    genSerie (name, color) {
      return {
        name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        data: [],
        itemStyle: {
          normal: {
            color,
          },
        },
        lineStyle: {
          normal: {
            width: 1,
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, .12)',
            shadowOffsetX: 4,
            shadowOffsetY: 4,
          },
        },
      }
    },
  },
}
</script>
