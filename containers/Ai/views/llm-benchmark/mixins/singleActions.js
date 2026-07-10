import { isBenchmarkRunning } from '../constants'
import { downloadBenchmarkArtifact, fetchBenchmarkLog } from '../utils/artifacts'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('aice.llm_benchmark.stop'),
        permission: 'llm_benchmarks_perform_stop',
        action: obj => this.handleStop(obj),
        meta: obj => ({
          validate: isBenchmarkRunning(obj.state),
        }),
      },
      {
        label: this.$t('common.more'),
        actions: obj => [
          {
            label: this.$t('common.view_logs'),
            permission: 'llm_benchmarks_get',
            action: () => this.handleViewLog(obj),
            meta: () => ({ validate: obj.state === 'completed' || obj.state === 'stopped' || obj.state === 'error' }),
          },
          {
            label: this.$t('aice.llm_benchmark.download_log'),
            permission: 'llm_benchmarks_get',
            action: () => downloadBenchmarkArtifact(this, obj.id, 'log'),
            meta: () => ({ validate: obj.state === 'completed' || obj.state === 'stopped' || obj.state === 'error' }),
          },
          {
            label: this.$t('aice.llm_benchmark.download_json'),
            permission: 'llm_benchmarks_get',
            action: () => downloadBenchmarkArtifact(this, obj.id, 'json'),
            meta: () => ({ validate: obj.state === 'completed' || obj.state === 'stopped' || obj.state === 'error' }),
          },
          {
            label: this.$t('aice.llm_benchmark.download_csv'),
            permission: 'llm_benchmarks_get',
            action: () => downloadBenchmarkArtifact(this, obj.id, 'csv'),
            meta: () => ({ validate: obj.state === 'completed' || obj.state === 'stopped' || obj.state === 'error' }),
          },
          {
            label: this.$t('table.action.delete'),
            permission: 'llm_benchmarks_delete',
            action: () => {
              this.createDialog('DeleteResDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                title: this.$t('table.action.delete'),
                name: this.$t('aice.llm_benchmark'),
                onManager: this.onManager,
              })
            },
            meta: () => this.$getDeleteResult(obj),
          },
        ],
      },
    ]
  },
  methods: {
    handleStop (obj) {
      this.createDialog('LlmBenchmarkStopDialog', {
        vm: this,
        data: [obj],
        columns: this.columns,
        onManager: this.onManager,
      })
    },
    async handleViewLog (obj) {
      const content = await fetchBenchmarkLog(this, obj.id)
      this.createDialog('LlmBenchmarkLogDialog', {
        content,
        title: this.$t('common.view_logs'),
      })
    },
  },
}
