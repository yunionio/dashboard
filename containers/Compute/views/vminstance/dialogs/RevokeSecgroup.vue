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
  name: 'VmSidepageRevokeSecgroupDialog',
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
              return row.name
            },
          },
        },
        getStatusTableColumn({ statusModule: 'secgroup', vm: this }),
      ],
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const secgroup_ids = this.params.data.map(item => item.id)
        await new this.$Manager('servers').batchPerformAction({
          ids: [this.params.detailData.id],
          action: 'revoke-secgroup',
          data: {
            secgroup_ids,
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
