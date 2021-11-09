<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_452')}}</div>
    <div slot="body">
      <dialog-selected-tips name="VPC" :count="params.data.length" :action="$t('cloudenv.text_452')" />
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
  name: 'RemoveVpcForVpcNetworkDialog',
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
        const vpcManager = new this.$Manager('inter_vpc_networks')
        await vpcManager.batchPerformAction({
          ids: this.params.resData.id,
          action: 'removevpc',
          data: {
            vpc_id: ids[0],
          },
        })
        this.params.refresh && this.params.refresh(2)
        this.$bus.$emit('VpcNetworkListSingleRefresh', [this.params.resData.id])
        this.cancelDialog()
        this.$message.success(this.$t('common.success'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
