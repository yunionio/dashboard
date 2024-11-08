<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.view_source_data')}}</div>
    <div slot="body">
      <code-mirror v-model="yamlInfo" :options="cmOptions" />
    </div>
    <div slot="footer">
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import jsYaml from 'js-yaml'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ContainerViewDataInfoDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
      },
      yamlInfo: jsYaml.safeDump(this.params.data[0]),
    }
  },
  methods: {
  },
}
</script>

<style lang="less" scoped>
.CodeMirror {
  height: 500px;
}
</style>
