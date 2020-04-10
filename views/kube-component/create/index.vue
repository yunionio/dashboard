<template>
  <div style="height: 400px">
    <component-form @submit="submit" />
  </div>
</template>

<script>
import ComponentForm from '../components/Form'

export default {
  name: 'K8SKubeComponentCreate',
  components: {
    ComponentForm,
  },
  data () {
    return {
      loading: false,
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
            [kubeComponent]: {
              config: data,
            },
            type: kubeComponent,
          },
        })
        this.loading = false
        this.$message.success('操作成功')
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
