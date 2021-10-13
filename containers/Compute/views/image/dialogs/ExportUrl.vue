<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.image.export.url.title')}}</div>
    <div slot="body">
      <p>{{ $t('compute.image.export.url.title.tips') }}</p>
      <code-mirror class="image-url-export" :value="params.url" :options="cmOptions" view-height="100px" :is-scroll="true" />
      <copy :message="params.url" />
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
      } catch (error) {
        this.$message.warn(this.$t('common.copyError'))
      }
    },
  },
}
</script>

<style lang="less" scoped>
.image-url-export {
  ::v-deep {
    .CodeMirror {
      height: 100px !important;
    }
  }
}
</style>
