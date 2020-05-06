<template>
  <div class="d-flex">
    <div>
      <span>集群&nbsp;</span>
      <cluster-select
        :value="cluster"
        @input="setCluster"
        style="width: 140px;" />
    </div>
    <div class="ml-2" v-if="!ignoreNamespace">
      <span>命名空间&nbsp;</span>
      <namespace-select
        :value="namespace"
        @input="setNamespace"
        :cluster="cluster"
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
import { mapState, mapMutations } from 'vuex'

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
      // cluster: '',
      // namespace: '',
    }
  },
  computed: {
    ...mapState('common', {
      cluster: state => state.k8s.cluster,
      namespace: state => state.k8s.namespace,
    }),
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
    ...mapMutations('common', {
      setCluster: 'SET_K8S_CLUSTER',
      setNamespace: 'SET_K8S_NAMESPACE',
    }),
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
