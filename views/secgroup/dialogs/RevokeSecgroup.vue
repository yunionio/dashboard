<template>
  <base-dialog @cancel="cancelDialog" width="480px">
    <div slot="header">{{ action }}</div>
    <div slot="body">{{$t('compute.text_1020')}}</div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RevokeSecgroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      action: this.$t('compute.text_950'),
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item.id)
        await new this.$Manager('servers').batchPerformAction({
          ids: ids,
          action: 'revoke-secgroup',
          data: {
            secgroup_ids: [this.params.secgrpId],
          },
        })
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
        this.$message.success(this.$t('compute.text_1021'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
