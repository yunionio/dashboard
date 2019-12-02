<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">退出维护模式</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="进入维护模式" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 2)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="disabled">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HostMaintenanceOutDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
    }
  },
  methods: {
    doMaintenance () {
      return this.params.list.onManager('batchPerformAction', {
        id: this.params.data.map(item => item.id),
        managerArgs: {
          action: 'host-exit-maintenance',
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doMaintenance()
        this.loading = false
        this.cancelDialog()
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
