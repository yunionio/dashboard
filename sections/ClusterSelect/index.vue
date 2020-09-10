<template>
  <a-select :disabled="disabled" :value="value" @change="clusterChange" :placeholder="$t('k8s.text_30')">
    <a-select-option
      v-for="item in clusterOps"
      :key="item.id"
      :title="item.name"
      :value="item.id">
      {{ item.name }}
    </a-select-option>
  </a-select>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'K8SClusterSelect',
  props: {
    value: {
      required: true,
    },
    setDefault: { // 设置默认
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      clusterOps: [],
    }
  },
  computed: {
    ...mapState('common', {
      cluster: state => state.k8s.cluster,
    }),
  },
  created () {
    this.clusterM = new this.$Manager('kubeclusters', 'v1')
    this.fetchClusterOps()
  },
  methods: {
    syncCluster (id) {
      const obj = this.clusterOps.find(v => v.id === id)
      this.$emit('update:clusterObj', obj)
      this.$emit('change', id)
    },
    clusterChange (cluster) {
      this.$emit('input', cluster)
      this.syncCluster(cluster)
    },
    fetchClusterOps () {
      this.clusterM.list({
        params: {
          limit: 0,
          'filter.0': 'status.equals(running)',
          scope: this.$store.getters.scope,
        },
      }).then(({ data: { data = [] } }) => {
        data = data.sort((a, b) => b.update_version - a.update_version)
        if (data.length) {
          const systemItemIdx = data.findIndex(val => val.provider === 'system')
          if (systemItemIdx >= 0) { // 把 system 的集群放在最后，点击时并提升
            const [systemItem] = data.splice(systemItemIdx, 1)
            data.push(systemItem)
          }
          this.clusterOps = data
          if (this.setDefault) {
            if (!this.value) {
              const clusterObj = this.clusterOps[0]
              this.$emit('input', clusterObj.id)
              this.syncCluster(clusterObj.id)
            } else {
              this.syncCluster(this.value)
            }
          }
        }
      })
    },
  },
}
</script>
