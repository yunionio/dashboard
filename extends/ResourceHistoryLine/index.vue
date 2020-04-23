<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">历史资源总览<a-icon class="ml-2" type="loading" v-if="loading" /></div>
      </div>
      <div class="dashboard-card-body align-items-center justify-content-center">
        <line-chart :columns="lineChartColumns" :rows="lineChartRows" width="100%" height="100%" />
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'
import LineChart from '@/sections/Charts/Line'

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
  components: {
    LineChart,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
  },
  data () {
    return {
      data: [],
      loading: false,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode']),
    lineChartColumns () {
      return ['time', '裸金属服务器(台)', 'CPU(核)', '磁盘(GB)', 'GPU(卡)', '内存(G)']
    },
    lineChartRows () {
      const rows = []
      R.forEach(item => {
        rows.push({
          time: this.$moment(item[0]).format('MM月DD日'),
          '裸金属服务器(台)': (+item[5] || 0).toFixed(2),
          '磁盘(GB)': (+item[1] || 0).toFixed(2),
          '虚拟资源': (+item[3] || 0).toFixed(2),
          'GPU(卡)': (+item[4] || 0).toFixed(2),
          '内存(G)': (+item[2] || 0).toFixed(2),
        })
      }, (this.data[0] && this.data[0].values) || [])
      return rows
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
        this.data = data || []
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
  },
}
</script>
