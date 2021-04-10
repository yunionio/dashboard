<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('k8s.text_19')}}</div>
    <div slot="body">
      <code-mirror v-model="configText" :options="cmOptions" />
    </div>
    <div slot="footer">
      <a-button
        type="primary"
        v-clipboard:copy="configText"
        v-clipboard:success="_ => $message.success($t('k8s.text_31'))"
        v-clipboard:error="_ => $message.error($t('k8s.text_32'))">{{$t('k8s.text_176')}}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ClusterShowKubeConfigDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      configText: '',
      cmOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        lineWrapping: true,
        readOnly: true,
        theme: 'material',
      },
    }
  },
  created () {
    this.loadSchedTags()
  },
  methods: {
    loadSchedTags (query) {
      new this.$Manager('kubeclusters', 'v1').getSpecific({ id: this.params.data[0].id, spec: 'kubeconfig' })
        .then(({ data }) => {
          this.configText = data.kubeconfig
        })
    },
  },
}
</script>
