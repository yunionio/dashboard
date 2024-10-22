<template>
  <div style="height: 400px">
    <!-- <component-form v-if="resData.config" @submit="submit" :config="resData.config" /> -->
    <component :is="component" v-if="loaded" @submit="submit" :updateData="resData" :isUpdate="true" />
    <a-alert v-else :message="$t('k8s.text_265')" banner />
  </div>
</template>

<script>
import Ceph from '../components/Ceph'
import Fluentbit from '../components/Fluentbit'
import Monitor from '../components/Monitor'
import { componentMap } from '../constants/componentMap'

export default {
  name: 'K8SKubeComponentUpdate',
  components: {
    Ceph,
    Fluentbit,
    Monitor,
  },
  data () {
    return {
      loading: false,
      loaded: false,
      resData: {},
      component: componentMap[this.$route.query.kubeComponent],
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
        this.loading = true
        const { data = {} } = await this.manager.getSpecific({
          id: cluster,
          spec: 'component-setting',
          params: {
            type: kubeComponent,
          },
        })
        this.resData = data[kubeComponent]
        this.loaded = true
      } catch (error) {
        throw error
      } finally {
        this.loading = false
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
            [kubeComponent]: data,
            type: kubeComponent,
          },
        })
        this.$store.commit('keepAlive/ADD_DELAY_EVENT', { name: 'ResourceListSingleRefresh', params: cluster })
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
