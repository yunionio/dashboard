import * as R from 'ramda'
import ClusterNamespace from '@K8S/sections/ClusterNamespace'

export default {
  components: {
    ClusterNamespace,
  },
  inject: {
    // 是否处于SidePage中
    inBaseSidePage: {
      default: false,
    },
  },
  computed: {
    noDataText () {
      const { cluster, namespace } = this.list.getParams
      if (!cluster && !namespace) return this.$t('common_461')
      return this.$t('common.notData')
    },
  },
  data () {
    return {
      namespaceMap: {},
    }
  },
  methods: {
    async fetchAllNamespaceData () {
      if (this.inBaseSidePage) return
      const params = R.clone(this.list.getParams)
      delete params.namespace
      this.namespaceMap = {}
      try {
        const { data: { data = [] } } = await this.list.manager.list({
          params,
          ctx: this.list.ctx,
        })
        const map = {}
        data.forEach(val => {
          if (!map[val.namespace_id]) {
            map[val.namespace_id] = []
          }
          map[val.namespace_id].push(val)
        })
        this.namespaceMap = map
      } catch (error) {
        throw error
      }
    },
    async fetchData () {
      if (this.list.getParams.cluster) {
        await this.list.fetchData()
        this.fetchAllNamespaceData()
      }
    },
  },
}
