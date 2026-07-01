<template>
  <base-dialog :width="600" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_deployment.restart') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.llm_deployment')" :count="params.data.length" :action="$t('aice.llm_deployment.restart')" />
      <p class="mb-2">{{ $t('aice.llm_deployment.restart_confirm') }}</p>
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
  name: 'LlmDeploymentRestartDialog',
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
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: ['ready', 'partial'],
          managerArgs: {
            action: 'restart',
            data: {},
          },
        })
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
