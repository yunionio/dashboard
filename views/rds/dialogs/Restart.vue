<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.dbinstances')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
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
  name: 'RDSRestartdialog',
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
        if (this.params.data && this.params.data.length > 1) {
          const ids = this.params.data.map(({ id }) => id)
          await this.params.onManager('batchPerformAction', {
            id: ids,
            steadyStatus: ['running'],
            managerArgs: {
              action: 'reboot',
            },
          })
        } else {
          await this.params.onManager('performAction', {
            id: this.params.data[0].id,
            steadyStatus: ['running'],
            managerArgs: {
              action: 'reboot',
            },
          })
        }
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
