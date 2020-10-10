<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      {{ $t('compute.vmrc_tips') }}<a href="http://www.vmware.com/go/download-vmrc" target="_blank"> {{ $t('compute.vmrc_link') }} </a>{{ $t('compute.vmrc_download') }}
    </div>
    <div slot="footer">
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmrcDownload',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      action: this.$t('compute.text_1274'),
    }
  },
}
</script>
