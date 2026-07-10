<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_benchmark.stop') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.llm_benchmark')" :count="params.data.length" :action="$t('aice.llm_benchmark.stop')" />
      <p class="mb-2">{{ $t('aice.llm_benchmark.stop_confirm') }}</p>
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { BENCHMARK_TERMINAL_STATES } from '../constants'

export default {
  name: 'LlmBenchmarkStopDialog',
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
          steadyStatus: { state: BENCHMARK_TERMINAL_STATES },
          managerArgs: {
            action: 'stop',
          },
        })
        if (this.params.vm?.refresh) {
          this.params.vm.refresh()
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
