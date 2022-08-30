import * as R from 'ramda'
import { statisticsRes } from '@/constants/statisticsRes'

export default {
  computed: {
    cloudEnvEmpty () {
      return R.isEmpty(this.cloudEnvOptions && this.cloudEnvOptions.filter(v => !!v.key))
    },
    isPreLoad () {
      return this.list?.isPreLoad
    },
    isOperateInSidepage () {
      const listId = this.list?.id
      return listId && listId.endsWith('Sidepage')
    },
    isStatisticsRes () {
      return statisticsRes.includes(this.list.resource)
    },
  },
  watch: {
    'list.params': {
      handler: function (val) {
        if (val) {
          this.isStatisticsRes &&
            !this.isOperateInSidepage &&
            this.$bus.$emit('ListParamsChange', val)
        }
      },
      deep: true,
    },
  },
  methods: {
    onManager () {
      return this.list.onManager(...arguments)
    },
    refresh () {
      this.isStatisticsRes &&
        !this.isOperateInSidepage &&
        this.$bus.$emit('ListParamsChange', { ...arguments })
      return this.list.refresh(...arguments)
    },
    singleRefresh () {
      return this.list.singleRefresh(...arguments)
    },
  },
}
