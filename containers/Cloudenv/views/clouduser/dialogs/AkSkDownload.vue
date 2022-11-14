<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.aksk.download') }}</div>
    <div slot="body">
      <a-alert :message="$t('cloudenv.aksk.download_tip')" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('cloudenv.aksk.download') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import XLSX from 'xlsx'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AkskDownloadDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
    }
  },
  methods: {
    async handleConfirm () {
      const filename = `${this.$t('cloudenv.aksk')}.xlsx`
      const aksk = this.params.data
      const data = [
        ['Access Key', 'Secret'],
        [aksk.access_key, aksk.secret],
      ]
      const ws_name = 'Sheet1'
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, ws_name)
      XLSX.writeFile(wb, filename)
      this.cancelDialog()
    },
  },
}
</script>
