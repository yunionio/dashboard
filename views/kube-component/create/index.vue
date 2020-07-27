<template>
  <div style="height: 400px">
    <component :is="component" @submit="submit" />
  </div>
</template>

<script>
import Ceph from '../components/Ceph'
import { componentMap } from '../constants/componentMap'
import Fluentbit from '../components/Fluentbit'
import Monitor from '../components/Monitor'

export default {
  name: 'K8SKubeComponentCreate',
  components: {
    Ceph,
    Fluentbit,
    Monitor,
  },
  data () {
    return {
      loading: false,
      component: componentMap[this.$route.query.kubeComponent],
    }
  },
  methods: {
    async submit (data) {
      try {
        const { cluster = 'default', kubeComponent } = this.$route.query
        const manager = new this.$Manager('kubeclusters', 'v1')
        this.loading = true
        await manager.performAction({
          id: cluster,
          action: 'enable-component',
          data: {
            [kubeComponent]: data,
            type: kubeComponent,
          },
        })
        this.loading = false
        this.$message.success(this.$t('k8s.text_46'))
        this.$router.push('/k8s-kubecomponent')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>

<style>

</style>
