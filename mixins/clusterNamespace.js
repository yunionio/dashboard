import ClusterNamespace from '@K8S/sections/ClusterNamespace'

export default {
  components: {
    ClusterNamespace,
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      if (this.list.getParams.cluster) {
        if (this.list.getParams.all_namespace || this.list.getParams.namespace) {
          if (this.list.getParams.all_namespace) delete this.list.getParams.namespace
          if (this.list.getParams.namespace) delete this.list.getParams.all_namespace
          this.list.fetchData()
        }
      }
    },
  },
}
