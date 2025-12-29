// import debounce from 'lodash/debounce'
import ResStatusTab from '@/sections/ResStatusTab'
import { arrayToObj, sizestr } from '@/utils/utils'

export default {
  components: {
    ResStatusTab,
  },
  data () {
    return {
      filterParams: {},
      statusOpts: [],
      statusArr: [],
      errorFilterStatus: [],
      otherFilterStatus: [],
      tableOverviewIndexs: [],
    }
  },
  created () {
  },
  methods: {
    resStatisticsChange (res) {
      const statusObj = arrayToObj(res.status_info || [], 'status')
      this.statusOpts = this.getStatusOpts(statusObj)
      this.statusArr = Object.keys(statusObj)
      this.generateTableOverviewIndexs(res)
    },
    getStatusOpts (data) {
      const { ready = {}, running = {} } = data

      // 统计
      let total = 0
      let error = 0
      let other = 0

      for (const k in data) {
        total += data[k].total_count
        if (new RegExp('fail').test(k)) {
          this.errorFilterStatus.push(k)
          error += data[k].total_count
        } else {
          if (!['running', 'ready'].includes(k)) {
            this.otherFilterStatus.push(k)
            other += data[k].total_count
          }
        }
      }

      const statusOpts = [
        { title: this.$t('compute.text_576'), type: 'total', num: total },
        { title: this.$t('compute.text_574'), type: 'running', num: running?.total_count || 0 },
        { title: this.$t('compute.text_273'), type: 'ready', num: ready?.total_count || 0 },
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error },
        { title: this.$t('compute.text_674'), type: 'other', num: other },
      ]
      return statusOpts
    },
    statusClickHandle (obj) {
      let statusCheckArr = []
      if (obj.num > 0) {
        switch (obj.type) {
          case 'total':
            statusCheckArr = []
            break
          case 'error':
            statusCheckArr = [...this.errorFilterStatus]
            break
          case 'other':
            statusCheckArr = [...this.otherFilterStatus]
            break
          default:
            statusCheckArr = [obj.type]
        }
        const statusArr = [...new Set([...this.statusArr, ...statusCheckArr])]
        this.filterParams = {
          statusCheckArr,
          statusArr,
        }
      }
    },
    generateTableOverviewIndexs (resData) {
      const tableOverviewIndexs = []

      Object.keys(resData).forEach(v => {
        switch (v) {
          case 'cpu_count':
            tableOverviewIndexs.push({ key: 'CPU', value: `${resData[v]}${this.$t('common_60')}`, order: 1 })
            break
          case 'mem_mb':
            tableOverviewIndexs.push({ key: this.$t('compute.text_369'), value: `${sizestr(resData[v], 'M', 1024)}`, order: 2 })
            break
          case 'disk_mb':
            tableOverviewIndexs.push({ key: this.$t('compute.text_99'), value: sizestr(resData[v], 'M', 1024), order: 3 })
            break
          // host
          case 'cpu_used':
            if (resData.hasOwnProperty('cpu_total')) {
              tableOverviewIndexs.push({ key: this.$t('common.cpu_used_total'), value: `${resData[v]}/${resData.cpu_total}`, order: 7 })
            }
            break
          case 'memory_used':
            if (resData.hasOwnProperty('memory_total')) {
              tableOverviewIndexs.push({ key: this.$t('common.memory_used_total'), value: `${sizestr(resData[v], 'M', 1024)}/${sizestr(resData.memory_total, 'M', 1024)}`, order: 8 })
            }
            break
        }
      })

      this.tableOverviewIndexs = tableOverviewIndexs.sort((a, b) => a.order - b.order)
    },
    resetStatusOpts () {
      if (this.statusOpts) {
        this.statusOpts.forEach(item => {
          item.num = 0
        })
      }
    },
  },
}
