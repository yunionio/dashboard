import { mapState, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapState('common', {
      cluster: state => state.k8s.cluster,
      namespace: state => state.k8s.namespace,
    }),
  },
  methods: {
    ...mapMutations('common', {
      setCluster: 'SET_K8S_CLUSTER',
      setNamespace: 'SET_K8S_NAMESPACE',
    }),
  },
}
