<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">解绑</div>
    <div slot="body">
      <dialog-selected-tips name="VPC" :count="params.data.length" action="解绑" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  name: 'RemoveVpcDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item.id)
        const vpcManager = new this.$Manager('dns_zones')
        await vpcManager.batchPerformAction({
          ids: this.params.resData.id,
          action: 'remove-vpcs',
          data: {
            vpc_ids: ids,
          },
        })
        this.params.refresh && this.params.refresh()
        this.$bus.$emit('DnsZoneListSingleRefresh', [this.params.resData.id])
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
