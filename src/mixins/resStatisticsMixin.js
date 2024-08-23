import debounce from 'lodash/debounce'
import ResStatusTab from '@/sections/ResStatusTab'
import { arrayToObj, sizestr } from '@/utils/utils'

export default {
  components: {
    ResStatusTab,
  },
  data () {
    return {
      statisticsLoading: false,
      filterParams: {},
      statusOpts: [],
      statusArr: [],
      errorFilterStatus: [],
      otherFilterStatus: [],
      tableOverviewIndexs: [],
    }
  },
  created () {
    this.fetchResStatistics = debounce(this.fetchResStatisticsDebounce, 2000)
    this.$bus.$off('ListParamsChange')
    this.$bus.$on('ListParamsChange', (params) => {
      this.tableOverviewIndexs = []
      this.resetStatusOpts()
      if (params && params.details) {
        this.fetchResStatistics(params)
      }
    })
  },
  methods: {
    fetchResStatisticsDebounce (params = {}) {
      this.errorFilterStatus = []
      this.otherFilterStatus = []

      const m = new this.$Manager(`${this.resStaticsResource}/statistics`, this.apiVersion ? this.apiVersion : 'v2')
      this.statisticsLoading = true
      m.list({ params }).then(res => {
        const statusObj = arrayToObj(res.data.status_info || [], 'status')
        this.statusOpts = this.getStatusOpts(statusObj)
        this.statusArr = Object.keys(statusObj)
        this.generateTableOverviewIndexs(res.data)
      }).catch(() => {
        // console.error(err)
        this.statusOpts = []
      }).finally(() => {
        this.statisticsLoading = false
      })
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
        this.filterParams = {
          statusCheckArr,
          statusArr: this.statusArr,
        }
      }
    },
    generateTableOverviewIndexs (resData) {
      const tableOverviewIndexs = []

      Object.keys(resData).forEach(v => {
        switch (v) {
          case 'total_cpu_count':
            tableOverviewIndexs.push({ key: 'CPU', value: `${resData[v]}${this.$t('common_60')}`, order: 1 })
            break
          case 'total_mem_size_mb':
            tableOverviewIndexs.push({ key: this.$t('compute.text_369'), value: `${sizestr(resData[v], 'M', 1024)}`, order: 2 })
            break
          case 'total_disk_size_mb':
            tableOverviewIndexs.push({ key: this.$t('compute.text_99'), value: sizestr(resData[v], 'M', 1024), order: 3 })
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
