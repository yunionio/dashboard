<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">查看/更新</div>
    <div class="k8s-edit-yaml-dialog" slot="body">
      <code-mirror v-if="configText" v-model="configText" :options="cmOptions" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import jsYaml from 'js-yaml'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8SEditYamlDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      configText: '',
      data: this.params.data[0],
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        lineWrapping: true,
        readOnly: true,
        theme: 'material',
        coverGutterNextToScrollbar: true,
      },
    }
  },
  created () {
    this.manager = new this.$Manager(this.params.resource, 'v1')
    this.fetchData()
  },
  methods: {
    async fetchData (query) {
      const { cluster, namespace } = this.data
      const { data } = await this.manager.getSpecific({ id: this.data.name, spec: 'yaml', params: { cluster, namespace } })
      this.configText = data
    },
    async handleConfirm () {
      const { clusterID, name, namespace } = this.data
      let qs = `${name}?cluster=${clusterID}`
      if (namespace) qs += `&namespace=${namespace}`
      let data = null
      try {
        data = jsYaml.safeLoad(this.configText)
      } catch (error) {
        this.$message.error('解析yaml出错，请填写正确的yaml配置')
        throw error
      }
      await this.manager.update({
        id: qs,
        data,
      })
      this.$message.success('操作成功')
      this.params.refresh()
      this.cancelDialog()
    },
  },
}
</script>

<style lang="scss" scoped>
.k8s-edit-yaml-dialog {
  ::v-deep .CodeMirror {
    height: auto;
  }
}
</style>
