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
      statusModule: 'common',
      statusNormalList: ['running', 'ready'],
      statusHiddenList: [],
    }
  },
  created () {
  },
  methods: {
    getText (statusModule, key) {
      if (this.$te(`scopeStatus.${statusModule}.${key}`)) {
        return this.$t(`scopeStatus.${statusModule}.${key}`)
      }
      if (this.$te(`status.${statusModule}.${key}`)) {
        return this.$t(`status.${statusModule}.${key}`)
      }
      return key
    },
    resStatisticsChange (res) {
      const statusObj = arrayToObj(res.status_info || [], 'status')
      this.statusOpts = this.getStatusOpts(statusObj)
      this.statusArr = Object.keys(statusObj)
      this.generateTableOverviewIndexs(res)
    },
    getStatusOpts (data) {
      const obj = {}
      const errorObj = {}
      const otherObj = {}
      this.statusNormalList.forEach(k => {
        obj[k] = 0
      })
      // 统计
      let total = 0
      let error = 0
      let other = 0

      for (const k in data) {
        total += data[k].total_count
        if (new RegExp('fail').test(k)) {
          this.errorFilterStatus.push(k)
          error += data[k].total_count
          errorObj[k] = data[k].total_count
        } else {
          if (!this.statusNormalList.includes(k)) {
            this.otherFilterStatus.push(k)
            other += data[k].total_count
            otherObj[k] = data[k].total_count
          } else {
            obj[k] = (obj[k] || 0) + data[k].total_count
          }
        }
      }
      const normalStatusTabs = this.statusNormalList.map(k => {
        return {
          type: k,
          num: obj[k] || 0,
          title: this.getText(this.statusModule, k),
        }
      })

      const statusOpts = [
        { title: this.$t('compute.text_576'), type: 'total', num: total },
        ...normalStatusTabs,
        { title: this.$t('common_623', [this.$t('scope.text_61')]), type: 'error', num: error, list: Object.keys(errorObj).map(k => ({ type: k, title: this.getText(this.statusModule, k), num: errorObj[k] })) },
        { title: this.$t('compute.text_674'), type: 'other', num: other, list: Object.keys(otherObj).map(k => ({ type: k, title: this.getText(this.statusModule, k), num: otherObj[k] })) },
      ].filter(item => !this.statusHiddenList.includes(item.type))
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
          case 'cpu_count':
            tableOverviewIndexs.push({ key: 'CPU', value: `${resData[v]}${this.$t('common_60')}`, order: 1 })
            break
          case 'mem_mb':
            tableOverviewIndexs.push({ key: this.$t('compute.text_369'), value: `${sizestr(resData[v], 'M', 1024)}`, order: 2 })
            break
          case 'disk_mb':
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
