<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_benchmark.retest') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.llm_benchmark')" :count="params.data.length" :action="$t('aice.llm_benchmark.retest')" />
      <p class="mb-2">{{ $t('aice.llm_benchmark.retest_confirm') }}</p>
      <a-checkbox v-if="hasRunner" v-model="reuseRunner">{{ $t('aice.llm_benchmark.reuse_runner') }}</a-checkbox>
      <dialog-table class="mt-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
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

export default {
  name: 'LlmBenchmarkRetestDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      reuseRunner: false,
    }
  },
  computed: {
    hasRunner () {
      return !!this.params.data[0]?.runner_server_id
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: { state: ['pending', 'queued', 'validating', 'running'] },
          managerArgs: {
            action: 'retest',
            data: { reuse_runner: this.hasRunner && this.reuseRunner },
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
