import * as R from 'ramda'

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
  },
  watch: {
    'list.params': {
      handler: function (val) {
        if (val) {
          !this.isOperateInSidepage && this.$bus.$emit('ListParamsChange', val)
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
      !this.isOperateInSidepage && this.$bus.$emit('ListParamsChange', { ...arguments })
      return this.list.refresh(...arguments)
    },
    singleRefresh () {
      return this.list.singleRefresh(...arguments)
    },
  },
}
