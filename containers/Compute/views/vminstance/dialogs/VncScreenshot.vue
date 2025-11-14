<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <div class="screenshot-wrapper">
        <img style="width: 100%" :src="screenshotUrl" />
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="downloadScreenshot">{{ $t('common.download_screenshot') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('common_115') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { ppmToPNGDataURL } from '@/utils/utils'

export default {
  name: 'VmVncScreenshotDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const { canvas, url } = ppmToPNGDataURL(this.params.screenshotUrl.replace('data:application/octet-stream;base64,', ''))
    return {
      action: this.$t('compute.vnc_panic_screenshot'),
      screenshotUrl: url,
      canvas,
    }
  },
  methods: {
    downloadScreenshot () {
      const that = this
      if (this.canvas) {
        this.canvas.toBlob(function (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `server-panicked-screenshot-${that.params.data.id}.png`
          a.click()
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
    },
  },
}
</script>
