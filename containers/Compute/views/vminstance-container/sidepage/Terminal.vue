<template>
  <div>
    <a-form-model :model="form" layout="inline">
      <a-form-model-item :label="$t('compute.container', [])">
        <a-select style="min-width: 200px;" v-model="form.container" @change="fetchConnectUrl">
          <a-select-option v-for="item in containers" :value="item.id" :key="item.name">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
    <a-skeleton v-if="form.container && !connectParams" active :paragraph="{ rows: 6 }" />
    <xterm :connectParams="connectParams" />
  </div>
</template>

<script>
export default {
  name: 'ContainerTerminal',
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
        container: '',
      },
      connectParams: '',
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const manager = new this.$Manager('containers')
      const res = await manager.list({
        params: {
          guest_id: this.data.id,
          scope: this.$store.getters.scope,
          filter: 'status.in(\'running\')',
        },
      })
      this.containers = res.data.data
      const firstContainer = this.containers[0]?.id
      if (firstContainer) {
        this.form.container = firstContainer
        this.fetchConnectUrl(firstContainer)
      }
    },
    async fetchConnectUrl (container) {
      this.connectParams = ''
      const { data } = await new this.$Manager('webconsole', 'v1').objectRpc({
        methodname: 'DoContainerExec',
        params: {
          container_id: container,
        },
      })
      this.connectParams = data.connect_params
    },
  },
}
</script>
