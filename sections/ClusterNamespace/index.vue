<template>
  <div class="d-flex">
    <div>
      <span>集群&nbsp;</span>
      <cluster-select
        :clusterObj.sync="clusterObj"
        v-model="cluster"
        style="width: 140px;" />
    </div>
    <div class="ml-2" v-if="!ignoreNamespace">
      <span>命名空间&nbsp;</span>
      <namespace-select
        v-model="namespace"
        :cluster="clusterObj.id"
        :support-all-namespace="true"
        size="small"
        style="width: 140px;" />
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'

export default {
  name: 'K8SClusterNamespace',
  components: {
    ClusterSelect,
    NamespaceSelect,
  },
  props: {
    getParams: {
      type: Object,
      default: () => ({}),
    },
    ignoreNamespace: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      clusterObj: {},
      cluster: '',
      namespace: '',
    }
  },
  watch: {
    cluster () {
      this.paramsChange()
    },
    namespace () {
      this.paramsChange()
    },
  },
  methods: {
    paramsChange () {
      const params = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
        cluster: this.cluster,
      }
      if (this.namespace) {
        if (this.namespace === 'all_namespace') {
          params.all_namespace = true
          delete params.namespace
        } else {
          params.namespace = this.namespace
          delete params.all_namespace
        }
      }
      this.$emit('update:getParams', params)
      this.$emit('refresh')
    },
  },
}
</script>
