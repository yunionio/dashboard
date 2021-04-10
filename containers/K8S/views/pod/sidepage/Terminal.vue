<template>
  <div>
    <a-form-model :model="form" layout="inline">
      <a-form-model-item :label="$t('k8s.text_1')">
        <a-select style="min-width: 200px;" v-model="form.activeContainer" @change="fetchUrl">
          <a-select-option v-for="item in containers" :value="item.name" :key="item.name">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
    <xterm :connectParams="connectParams" />
  </div>
</template>

<script>
export default {
  name: 'K8SPodTerminal',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      containers: [],
      form: {
        activeContainer: '',
      },
      connectParams: '',
    }
  },
  created () {
    this.manager = new this.$Manager('pods', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const { data: { containers } } = await this.manager.get({
        id: this.data.id,
        params: {
          cluster: this.data.clusterID,
          namespace: this.data.namespace,
        },
      })
      this.containers = containers
      this.form.activeContainer = containers[0].name
      this.fetchUrl(this.form.activeContainer)
    },
    async fetchUrl (container) {
      const params = {
        cluster: this.data.cluster,
        namespace: this.data.namespace,
        name: this.data.name,
        container,
      }
      const { data } = await new this.$Manager('webconsole', 'v1').objectRpc({
        methodname: 'DoK8sShellConnect',
        objId: this.data.name,
        params,
      })
      this.connectParams = data.connect_params
    },
  },
}
</script>
