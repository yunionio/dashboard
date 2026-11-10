<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="llm_benchmarks" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { renderBenchmarkState } from '../utils/state'
import { downloadBenchmarkArtifact, fetchBenchmarkLog } from '../utils/artifacts'

export default {
  name: 'LlmBenchmarkDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        readOnly: true,
        theme: 'material',
        mode: 'application/json',
        lineWrapping: true,
      },
      logCmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        readOnly: true,
        theme: 'material',
        mode: 'text/plain',
        lineWrapping: true,
      },
    }
  },
  computed: {
    baseInfo () {
      return [
        {
          field: 'state',
          title: this.$t('common.status'),
          slots: {
            default: ({ row }) => [renderBenchmarkState(this.$createElement, this, row.state)],
          },
        },
        {
          field: 'state_message',
          title: this.$t('aice.llm_benchmark.state_message'),
          formatter: ({ row }) => row.state_message || '-',
        },
        {
          field: 'llm_deployment_id',
          title: this.$t('aice.llm_benchmark.deployment'),
          formatter: ({ row }) => row.llm_deployment || row.llm_deployment_id || '-',
        },
        {
          field: 'backend',
          title: this.$t('aice.llm_deployment.backend'),
          formatter: ({ row }) => row.backend || '-',
        },
        {
          field: 'model',
          title: this.$t('aice.llm_benchmark.model'),
          formatter: ({ row }) => row.model || '-',
        },
        {
          field: 'target_url',
          title: this.$t('aice.llm_benchmark.target_url'),
          formatter: ({ row }) => row.target_url || '-',
        },
      ]
    },
    extraInfo () {
      return [
        {
          title: this.$t('aice.llm_benchmark.params'),
          items: [
            { field: 'profile', title: this.$t('aice.llm_benchmark.profile') },
            { field: 'request_rate', title: this.$t('aice.llm_benchmark.request_rate') },
            { field: 'total_requests', title: this.$t('aice.llm_benchmark.total_requests') },
            { field: 'max_duration_seconds', title: this.$t('aice.llm_benchmark.max_duration_seconds') },
            { field: 'max_errors', title: this.$t('aice.llm_benchmark.max_errors') },
            { field: 'dataset_name', title: this.$t('aice.llm_benchmark.dataset_name') },
            { field: 'dataset_input_tokens', title: this.$t('aice.llm_benchmark.dataset_input_tokens') },
            { field: 'dataset_output_tokens', title: this.$t('aice.llm_benchmark.dataset_output_tokens') },
          ],
        },
        {
          title: this.$t('aice.llm_benchmark.results'),
          items: [
            {
              field: 'requests_per_second_mean',
              title: this.$t('aice.llm_benchmark.requests_per_second_mean'),
              formatter: ({ row }) => this.formatMetric(row.requests_per_second_mean),
            },
            {
              field: 'output_tokens_per_second_mean',
              title: this.$t('aice.llm_benchmark.output_tokens_per_second_mean'),
              formatter: ({ row }) => this.formatMetric(row.output_tokens_per_second_mean, 'tok/s'),
            },
            {
              field: 'input_tokens_per_second_mean',
              title: this.$t('aice.llm_benchmark.input_tokens_per_second_mean'),
              formatter: ({ row }) => this.formatMetric(row.input_tokens_per_second_mean, 'tok/s'),
            },
            {
              field: 'tokens_per_second_mean',
              title: this.$t('aice.llm_benchmark.tokens_per_second_mean'),
              formatter: ({ row }) => this.formatMetric(row.tokens_per_second_mean, 'tok/s'),
            },
            {
              field: 'time_to_first_token_mean_ms',
              title: this.$t('aice.llm_benchmark.time_to_first_token_mean_ms'),
              formatter: ({ row }) => this.formatMetric(row.time_to_first_token_mean_ms, 'ms'),
            },
            {
              field: 'time_to_first_token_p95_ms',
              title: this.$t('aice.llm_benchmark.time_to_first_token_p95_ms'),
              formatter: ({ row }) => this.formatMetric(row.time_to_first_token_p95_ms, 'ms'),
            },
            {
              field: 'time_to_first_token_p99_ms',
              title: this.$t('aice.llm_benchmark.time_to_first_token_p99_ms'),
              formatter: ({ row }) => this.formatMetric(row.time_to_first_token_p99_ms, 'ms'),
            },
            {
              field: 'inter_token_latency_mean_ms',
              title: this.$t('aice.llm_benchmark.inter_token_latency_mean_ms'),
              formatter: ({ row }) => this.formatMetric(row.inter_token_latency_mean_ms, 'ms'),
            },
            {
              field: 'inter_token_latency_p95_ms',
              title: this.$t('aice.llm_benchmark.inter_token_latency_p95_ms'),
              formatter: ({ row }) => this.formatMetric(row.inter_token_latency_p95_ms, 'ms'),
            },
            {
              field: 'inter_token_latency_p99_ms',
              title: this.$t('aice.llm_benchmark.inter_token_latency_p99_ms'),
              formatter: ({ row }) => this.formatMetric(row.inter_token_latency_p99_ms, 'ms'),
            },
            {
              field: 'request_latency_mean_sec',
              title: this.$t('aice.llm_benchmark.request_latency_mean_sec'),
              formatter: ({ row }) => this.formatMetric(row.request_latency_mean_sec, 's'),
            },
            {
              field: 'request_latency_p95_sec',
              title: this.$t('aice.llm_benchmark.request_latency_p95_sec'),
              formatter: ({ row }) => this.formatMetric(row.request_latency_p95_sec, 's'),
            },
            {
              field: 'request_latency_p99_sec',
              title: this.$t('aice.llm_benchmark.request_latency_p99_sec'),
              formatter: ({ row }) => this.formatMetric(row.request_latency_p99_sec, 's'),
            },
            {
              field: 'request_concurrency_mean',
              title: this.$t('aice.llm_benchmark.request_concurrency_mean'),
              formatter: ({ row }) => this.formatMetric(row.request_concurrency_mean),
            },
            {
              field: 'request_concurrency_max',
              title: this.$t('aice.llm_benchmark.request_concurrency_max'),
              formatter: ({ row }) => this.formatMetric(row.request_concurrency_max),
            },
            { field: 'request_total', title: this.$t('aice.llm_benchmark.request_total') },
            { field: 'request_successful', title: this.$t('aice.llm_benchmark.request_successful') },
            { field: 'request_errored', title: this.$t('aice.llm_benchmark.request_errored') },
            { field: 'request_incomplete', title: this.$t('aice.llm_benchmark.request_incomplete') },
            {
              field: 'error_rate',
              title: this.$t('aice.llm_benchmark.error_rate'),
              formatter: ({ row }) => this.formatErrorRate(row.error_rate),
            },
          ],
        },
        {
          title: this.$t('aice.llm_benchmark.debug'),
          items: [
            {
              field: 'target_snapshot',
              title: this.$t('aice.llm_benchmark.target_snapshot'),
              slots: {
                default: () => [this.renderJsonBlock(this.data.target_snapshot)],
              },
            },
            {
              field: 'guide_llm_spec',
              title: this.$t('aice.llm_benchmark.guide_llm_spec'),
              slots: {
                default: () => [this.renderJsonBlock(this.data.guide_llm_spec)],
              },
            },
            {
              field: 'raw_metrics',
              title: this.$t('aice.llm_benchmark.raw_metrics'),
              slots: {
                default: () => [this.renderJsonBlock(this.data.raw_metrics)],
              },
            },
            {
              field: 'artifacts',
              title: this.$t('aice.llm_benchmark.artifacts'),
              slots: {
                default: () => [this.renderArtifactActions()],
              },
            },
          ],
        },
      ]
    },
  },
  methods: {
    formatMetric (value, suffix) {
      if (value == null || value === '') return '-'
      const val = Number(value)
      if (Number.isNaN(val)) return value
      return suffix ? `${val.toFixed(2)} ${suffix}` : val.toFixed(2)
    },
    formatErrorRate (val) {
      if (val == null || val === '') return '-'
      const num = Number(val)
      if (Number.isNaN(num)) return val
      return `${(num * 100).toFixed(2)}%`
    },
    formatJsonText (value) {
      if (value == null || value === '') return ''
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value, null, 2)
        } catch (e) {
          return String(value)
        }
      }
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return ''
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            return JSON.stringify(JSON.parse(trimmed), null, 2)
          } catch (e) {
            return value
          }
        }
        return value
      }
      return String(value)
    },
    renderJsonBlock (value) {
      const text = this.formatJsonText(value)
      if (!text) return '-'
      return <code-mirror value={text} options={this.cmOptions} />
    },
    renderArtifactActions () {
      const canDownload = ['completed', 'stopped', 'error'].includes(this.data.state)
      if (!canDownload) return '-'
      return (
        <div>
          <a-button type="link" size="small" onClick={() => this.handleViewLog()}>{this.$t('common.view_logs')}</a-button>
          <a-button type="link" size="small" onClick={() => downloadBenchmarkArtifact(this, this.data.id, 'log')}>{this.$t('aice.llm_benchmark.download_log')}</a-button>
          <a-button type="link" size="small" onClick={() => downloadBenchmarkArtifact(this, this.data.id, 'json')}>{this.$t('aice.llm_benchmark.download_json')}</a-button>
          <a-button type="link" size="small" onClick={() => downloadBenchmarkArtifact(this, this.data.id, 'csv')}>{this.$t('aice.llm_benchmark.download_csv')}</a-button>
        </div>
      )
    },
    async handleViewLog () {
      const content = await fetchBenchmarkLog(this, this.data.id)
      this.createDialog('LlmBenchmarkLogDialog', {
        content,
        title: this.$t('common.view_logs'),
      })
    },
  },
}
</script>
