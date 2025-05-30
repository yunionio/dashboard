import * as R from 'ramda'

export default {
  inject: ['inBaseSidePage'],
  props: {
    filterParams: {
      type: Object,
      default: () => ({}),
    },
    tableOverviewIndexs: {
      type: Array,
    },
    statusResKey: {
      type: String,
      default: '',
    },
  },
  computed: {
    cloudEnvEmpty () {
      return R.isEmpty(this.cloudEnvOptions && this.cloudEnvOptions.filter(v => !!v.key))
    },
    isPreLoad () {
      return this.list?.isPreLoad
    },
    isOperateInSidepage () {
      return this.inBaseSidePage
    },
  },
  watch: {
    filterParams: {
      handler: function (val) {
        if (!val.isFirstLoad) {
          const filterStatus = this.list.filter.status || []
          const statusCheckArr = Array.from(new Set(val.statusCheckArr || []))
          statusCheckArr.forEach((item) => {
            if (!filterStatus.includes(item)) {
              filterStatus.push(item)
            }
          })
          if (statusCheckArr.length > 0) {
            this.list.changeFilter({ ...this.list.filter, status: statusCheckArr })
            this.list.filterOptions.status.items = []
            const statusArrTem = this.list.filterOptions.status.items || []
            val.statusArr.forEach((item) => {
              const isExist = statusArrTem.some((obj) => { return obj.key === item })
              if (!isExist) {
                statusArrTem.push({
                  key: item,
                  label: this.$te(`status.${this.getStatusResKey()}.${item}`) ? this.$t(`status.${this.getStatusResKey()}.${item}`) : item,
                })
              }
            })
            this.list.filterOptions.status.items = statusArrTem
          } else {
            delete this.list.filter.status
            this.list.changeFilter({ ...this.list.filter })
          }
        }
      },
      deep: true,
    },
    'list.totals': {
      handler: function (val) {
        this.$emit('resStatisticsChange', val)
      },
      deep: true,
    },
  },
  methods: {
    getStatusResKey () {
      if (this.list.statusResKey || this.statusResKey) {
        return this.list.statusResKey || this.statusResKey
      }
      if (this.list.resource) {
        return this.list.resource.substring(0, this.list.resource.length - 1)
      }
      console.error('There is no statusResKey or resource in list')
      return 'common'
    },
    onManager () {
      return this.list.onManager(...arguments)
    },
    refresh () {
      return this.list.refresh(...arguments)
    },
    singleRefresh () {
      return this.list.singleRefresh(...arguments)
    },
  },
}
