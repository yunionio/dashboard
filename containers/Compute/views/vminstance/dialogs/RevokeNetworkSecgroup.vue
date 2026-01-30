<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.secgroup')" :count="params.data.length" action="移除" />
      <dialog-table :data="params.data" :columns="columns" />
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
import { getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'VmSidepageRevokeNetworkSecgroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      action: this.$t('compute.text_950'),
      loading: false,
      columns: [
        {
          field: 'name',
          title: this.$t('common.name'),
          slots: {
            default: ({ row }, h) => {
              return this.params.secgroupType === 'network' ? row.secgroup : row.name
            },
          },
        },
        getStatusTableColumn({ statusModule: 'secgroup', vm: this, field: this.params.secgroupType === 'network' ? 'secgroup_status' : 'status' }),
      ],
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const secgroup_ids = this.params.data.map(item => this.params.secgroupType === 'network' ? item.secgroup_id : item.id)
        const data = this.params.secgroupType === 'network' ? {
          network_index: this.params.data[0].network_index,
          guest: this.params.data[0].guest_id,
          secgroup_ids: [this.params.data[0].secgroup_id],
        } : {
          mac: this.params.mac,
          secgroup_ids,
        }
        const manager = new this.$Manager('servers')
        await manager.performAction({
          id: this.params.secgroupType === 'network' ? this.params.data[0].guest_id : this.params.detailData.id,
          action: 'revoke-network-secgroup',
          data,
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
