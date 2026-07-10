<template>
  <base-dialog @cancel="cancelDialog" width="900px">
    <div slot="header">{{ params.title || $t('common.view_logs') }}</div>
    <div slot="body">
      <code-mirror v-model="showData" class="codemirror-h-100" :options="cmOptions" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LlmBenchmarkLogDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      showData: this.params.content || '',
      cmOptions: {
        tabSize: 2,
        indentUnit: 2,
        smartIndent: true,
        lineNumbers: true,
        readOnly: true,
        theme: '3024-day',
        lineWrapping: true,
        mode: 'text/plain',
      },
    }
  },
}
</script>
