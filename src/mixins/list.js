import * as R from 'ramda'

export default {
  computed: {
    cloudEnvEmpty () {
      return R.isEmpty(this.cloudEnvOptions && this.cloudEnvOptions.filter(v => !!v.key))
    },
    isPreLoad () {
      return this.list.isPreLoad
    },
  },
  methods: {
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
