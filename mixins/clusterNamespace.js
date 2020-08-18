import * as R from 'ramda'
import ClusterNamespace from '@K8S/sections/ClusterNamespace'

export default {
  components: {
    ClusterNamespace,
  },
  created () {
    this.fetchData()
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
      params.all_namespace = true
      this.namespaceMap = {}
      try {
        const { data: { data = [] } } = await this.list.manager.list({
          params,
          ctx: this.list.ctx,
        })
        const map = {}
        data.forEach(val => {
          if (!map[val.namespace]) {
            map[val.namespace] = []
          }
          map[val.namespace].push(val)
        })
        this.namespaceMap = map
      } catch (error) {
        throw error
      }
    },
    async fetchData () {
      if (this.list.getParams.cluster) {
        if (this.list.getParams.all_namespace || this.list.getParams.namespace) {
          if (this.list.getParams.all_namespace) delete this.list.getParams.namespace
          if (this.list.getParams.namespace) delete this.list.getParams.all_namespace
          await this.list.fetchData()
          this.fetchAllNamespaceData()
        }
      }
    },
  },
}
