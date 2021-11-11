<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.reserved-ip')" :count="params.data.length" :action="this.params.title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  name: 'ReservedIPFreedDialog',
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
        const query = this.params.query
        query.scope = this.$store.getters.scope
        const params = {
          ips,
          query,
        }
        await manager.rpc({ methodname: 'DoBatchReleaseReservedIps', params })
        this.cancelDialog()
        this.params.refresh()
        this.$message.success(this.$t('network.text_290'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
