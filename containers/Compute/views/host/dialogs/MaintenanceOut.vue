<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_559')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" :action="$t('compute.text_550')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 2)" />
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
      return this.params.onManager('batchPerformAction', {
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
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
