<template>
  <base-dialog @cancel="cancelDialog" width="500px">
    <div slot="header">{{$t('common.no_data_start_month')}}</div>
    <div slot="body">
      {{ $t('common.no_data_start_month_tip') }}
    </div>
    <div slot="footer">
      <a-checkbox v-model="no_tip" style="float:left">{{ $t('common.no_tip_in_this_month') }}</a-checkbox>
      <a-button type="primary" @click="handleConfirm">{{ $t('common.switch_to_last_month') }}</a-button>
      <a-button @click="cancel">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import storage from '@/utils/storage'

export default {
  name: 'BillNoDataTipDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      no_tip: false,
    }
  },
  methods: {
    async handleConfirm () {
      if (this.no_tip) {
        this.setNoTip()
      }
      this.params.switchMethod && this.params.switchMethod()
      this.cancelDialog()
    },
    setNoTip () {
      storage.set(this.params.ignoreTipTimeKey, this.$moment().format('YYYY-MM-DD'))
    },
    cancel () {
      if (this.no_tip) {
        this.setNoTip()
      }
      this.cancelDialog()
    },
  },
}
</script>
