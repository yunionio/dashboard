<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.image.export.url.title')}}</div>
    <div slot="body">
      <p>{{ $t('compute.image.export.url.title.tips') }}</p>
      <div class="d-flex align-items-center list-body-cell-wrap">
        <pre class="image-url-export">{{ params.url }}</pre>
        <copy :message="params.url" />
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('compute.image.export.url.confirm') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ImageExportUrlDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        mode: 'text/plain',
        theme: 'material',
      },
    }
  },
  methods: {
    handleConfirm () {
      try {
        this.$copyText(this.params.url)
        this.cancelDialog()
        this.$message.success(this.$t('common.copy'))
      } catch (error) {
        this.$message.warn(this.$t('common.copyError'))
      }
    },
  },
}
</script>

<style lang="less" scoped>
.image-url-export {
  white-space: pre-wrap;       /* Since CSS 2.1 */
  white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
  white-space: -o-pre-wrap;    /* Opera 7 */
  word-wrap: break-word;       /* Internet Explorer 5.5+ */
}
</style>
