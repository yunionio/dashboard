<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <vxe-grid v-if="params.columns && params.columns.length" class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'freedDialog',
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
        const manager = new this.$Manager('reservedips')
        const ips = this.params.data.map(item => item.ip_addr)
        const params = {
          ips,
        }
        await manager.rpc({ methodname: 'DoBatchReleaseReservedIPs', params })
        this.cancelDialog()
        this.params.list.refresh()
        this.$message.success('操作成功')
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
