<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.user')" :count="params.data.length" :action="action" />
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
  name: 'ResetMFADialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      action: `${this.$t('common.reset')}MFA`,
      loading: false,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const { data, onManager } = this.params
      try {
        onManager('performAction', {
          id: data[0].id,
          // steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'reset-credentials',
            data: {
              type: 'totp',
            },
          },
        })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
