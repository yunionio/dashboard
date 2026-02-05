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
        const manager = new this.$Manager('servers')
        if (this.params.secgroupType === 'network') {
          // network 类型：params.data 可能来自多台 VM / 多张网卡，这里按 guest_id + network_index 分组批量 revoke
          const grouped = {}
          ;(this.params.data || []).forEach((row) => {
            const guestId = row.guest_id
            const networkIndex = row.network_index
            const secgroupId = row.secgroup_id
            if (!guestId || (networkIndex === undefined || networkIndex === null) || !secgroupId) return
            const key = `${guestId}::${networkIndex}`
            if (!grouped[key]) {
              grouped[key] = {
                guestId,
                networkIndex,
                secgroup_ids: [],
              }
            }
            grouped[key].secgroup_ids.push(secgroupId)
          })
          const reqs = Object.values(grouped).map((g) => {
            return manager.performAction({
              id: g.guestId,
              action: 'revoke-network-secgroup',
              data: {
                network_index: g.networkIndex,
                guest: g.guestId,
                secgroup_ids: g.secgroup_ids,
              },
            })
          })
          const results = await Promise.allSettled(reqs)
          const failed = results.filter(r => r.status === 'rejected')
          if (failed.length) {
            const msg = failed[0]?.reason?.message || this.$t('common.text_110') || 'error'
            throw new Error(msg)
          }
        } else {
          // 非 network 类型：一次请求即可
          const secgroup_ids = (this.params.data || []).map(item => item.id)
          await manager.performAction({
            id: this.params.detailData.id,
            action: 'revoke-network-secgroup',
            data: {
              mac: this.params.mac,
              secgroup_ids,
            },
          })
        }
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
