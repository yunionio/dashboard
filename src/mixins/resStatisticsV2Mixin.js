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
      this.errorFilterStatus = []
      this.otherFilterStatus = []
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
          case 'size_mb':
            tableOverviewIndexs.push({ key: this.$t('common_234'), value: sizestr(resData[v], 'M', 1024), order: 4 })
            break
          case 'backup_size_mb':
            tableOverviewIndexs.push({ key: this.$t('common.backup') + this.$t('common_234'), value: sizestr(resData[v], 'M', 1024), order: 5 })
            break
          case 'volume_size_mb':
            tableOverviewIndexs.push({ key: this.$t('common_237') + this.$t('common_234'), value: sizestr(resData[v], 'M', 1024), order: 6 })
            break
          // host：概览：[CPU] 物理总量 62 · 已分配/虚拟 14/514；[内存] 已使用/物理 65G/118G · 已分配/虚拟 30G/107G
          case 'cpu_total': {
            let value = `${this.$t('compute.actual_total')} ${resData[v]}`
            if (resData.hasOwnProperty('cpu_allocated') && resData.hasOwnProperty('cpu_virtual')) {
              value += ` · ${this.$t('common.allocated_virtual')} ${resData.cpu_allocated}/${resData.cpu_virtual}`
            }
            tableOverviewIndexs.push({ key: 'CPU', value, order: 7, tag: true })
            break
          }
          case 'memory_used':
            if (resData.hasOwnProperty('memory_total')) {
              let value = `${this.$t('common.used_physical')} ${sizestr(resData[v], 'M', 1024)}/${sizestr(resData.memory_total, 'M', 1024)}`
              if (resData.hasOwnProperty('memory_allocated') && resData.hasOwnProperty('memory_virtual')) {
                value += ` · ${this.$t('common.allocated_virtual')} ${sizestr(resData.memory_allocated, 'M', 1024)}/${sizestr(resData.memory_virtual, 'M', 1024)}`
              }
              tableOverviewIndexs.push({ key: this.$t('compute.text_369'), value, order: 8, tag: true })
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
