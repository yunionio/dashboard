import * as R from 'ramda'
// import { statisticsRes } from '@/constants/statisticsRes'

export default {
  inject: ['inBaseSidePage'],
  props: {
    filterParams: {
      type: Object,
      default: () => ({}),
    },
    statusResKey: {
      type: String,
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
    // isStatisticsRes () {
    //   return statisticsRes.includes(this.list.resource)
    // },
  },
  watch: {
    filterParams: {
      handler: function (val) {
        if (!val.isFirstLoad) {
          const filterStatus = this.list.filter.status || []
          val.statusCheckArr.forEach((item) => {
            if (!filterStatus.includes(item)) {
              filterStatus.push(item)
            }
          })
          if (val.statusCheckArr && val.statusCheckArr.length > 0) {
            this.list.changeFilter({ ...this.list.filter, status: val.statusCheckArr })
            this.list.filterOptions.status.items = []
            const statusArrTem = this.list.filterOptions.status.items || []
            val.statusArr.forEach((item) => {
              const isExist = statusArrTem.some((obj) => { return obj.key === item })
              if (!isExist) {
                statusArrTem.push({
                  key: item,
                  label: this.$t(`status.${this.statusResKey}.${item}`),
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
    // 'list.params': {
    //   handler: function (val) {
    //     if (val) {
    //       this.isStatisticsRes &&
    //         !this.isOperateInSidepage &&
    //         this.$bus.$emit('ListParamsChange', val)
    //     }
    //   },
    //   deep: true,
    // },
  },
  methods: {
    onManager () {
      return this.list.onManager(...arguments)
    },
    refresh () {
      // this.isStatisticsRes &&
      //   !this.isOperateInSidepage &&
      //   this.$bus.$emit('ListParamsChange', { ...arguments })
      return this.list.refresh(...arguments)
    },
    singleRefresh () {
      return this.list.singleRefresh(...arguments)
    },
  },
}
