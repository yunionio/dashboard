<template>
  <base-dialog @cancel="cancelDialog" width="480px">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      是否确认移除？
    </div>
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
      action: '移除',
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
            'secgrp.0': this.params.secgrpId,
          },
        })
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
        this.$message.success('移除成功')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
