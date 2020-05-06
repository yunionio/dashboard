<template>
  <div style="height: 400px">
    <component-form v-if="resData.config" @submit="submit" :config="resData.config" />
    <a-alert v-else message="无可用服务组件" banner />
  </div>
</template>

<script>
import ComponentForm from '../components/Ceph'

export default {
  name: 'K8SKubeComponentUpdate',
  components: {
    ComponentForm,
  },
  data () {
    return {
      loading: false,
      resData: {},
    }
  },
  created () {
    this.manager = new this.$Manager('kubeclusters', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        const { cluster = 'default', kubeComponent } = this.$route.query
        const { data = {} } = await this.manager.getSpecific({
          id: cluster,
          spec: 'component-setting',
          params: {
            type: kubeComponent,
          },
        })
        this.resData = data[kubeComponent]
      } catch (error) {
        throw error
      }
    },
    async submit (data) {
      try {
        this.loading = true
        const { cluster = 'default', kubeComponent } = this.$route.query
        await this.manager.performAction({
          id: cluster,
          action: 'update-component',
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
