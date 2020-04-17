<template>
  <div>
    <a-form-model :model="form" layout="inline">
      <a-form-model-item label="容器">
        <a-select style="min-width: 200px;" v-model="form.activeContainer" @change="fetchUrl">
          <a-select-option v-for="item in containers" :value="item.name" :key="item.name">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="开启过滤">
        <a-switch v-model="form.showTime" />
      </a-form-model-item>
      <a-form-model-item label="近期时间" v-if="form.showTime">
        <duration-second-input v-model="form.time" :durationOptions="durationOptions" />
      </a-form-model-item>
    </a-form-model>
    <xterm :connectParams="connectParams" />
  </div>
</template>

<script>
export default {
  name: 'K8SPodLog',
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
        showTime: false,
        time: 3600,
      },
      connectParams: '',
      durationOptions: [
        { label: '小时', key: 'hours' },
        { label: '分', key: 'minutes' },
        { label: '天', key: 'days' },
      ],
    }
  },
  watch: {
    'form.showTime' () {
      this.fetchUrl()
    },
    'form.time' () {
      this.fetchUrl()
    },
  },
  created () {
    this.manager = new this.$Manager('pods', 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const { data: { containers } } = await this.manager.get({
        id: this.data.name,
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
      if (this.form.showTime) {
        params.since = `${this.form.time}s`
      }
      const { data } = await new this.$Manager('webconsole', 'v1').objectRpc({
        methodname: 'DoK8sLogConnect',
        objId: this.data.name,
        params,
      })
      this.connectParams = data.connect_params
    },
  },
}
</script>
