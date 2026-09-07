<template>
  <base-dialog :width="600" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_deployment.restart') }}</div>
    <div slot="body">
      <div class="mb-2">
        <span>{{ $t('common.text00002') }}</span>
        <span class="ml-2 mr-2 primary-color">{{ params.data.length }}{{ $t('common.text00003') }}{{ $t('aice.llm_deployment') }}</span>
        <span>{{ $t('common.text00004') }}</span>
        <span class="ml-2 mr-2 warning-color">{{ $t('aice.llm_deployment.restart') }}</span>
      </div>
      <p class="mb-2">{{ $t('aice.llm_deployment.restart_confirm') }}</p>
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <div class="mt-3">
        <a-checkbox v-model="force">{{ $t('aice.llm_deployment.force_restart') }}</a-checkbox>
        <div class="mt-1 text-color-help">{{ $t('aice.llm_deployment.force_restart_extra') }}</div>
      </div>
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

const NORMAL_RESTART_STATUSES = ['ready', 'partial', 'running']

export default {
  name: 'LlmDeploymentRestartDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const status = this.params?.data?.[0]?.status
    return {
      loading: false,
      force: !NORMAL_RESTART_STATUSES.includes(status),
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: this.force
            ? ['ready', 'partial', 'start_fail', 'create_fail']
            : ['ready', 'partial'],
          managerArgs: {
            action: 'restart',
            data: this.force ? { force: true } : {},
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
