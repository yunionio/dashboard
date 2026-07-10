import {
  getNameDescriptionTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { BENCHMARK_TERMINAL_STATES } from '../constants'
import { renderBenchmarkState } from '../utils/state'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => (
          <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
        ),
      }),
      {
        field: 'llm_deployment_id',
        title: this.$t('aice.llm_benchmark.deployment'),
        minWidth: 140,
        formatter: ({ row }) => {
          return row.llm_deployment || row.llm_deployment_id || '-'
        },
      },
      {
        field: 'state',
        title: this.$t('common.status'),
        width: 110,
        slots: {
          default: ({ row }) => [renderBenchmarkState(this.$createElement, this, row.state)],
        },
      },
      {
        field: 'request_rate',
        title: this.$t('aice.llm_benchmark.request_rate'),
        width: 100,
      },
      {
        field: 'total_requests',
        title: this.$t('aice.llm_benchmark.total_requests'),
        width: 100,
      },
      {
        field: 'request_total',
        title: this.$t('aice.llm_benchmark.request_total'),
        width: 100,
      },
      {
        field: 'request_successful',
        title: this.$t('aice.llm_benchmark.request_successful'),
        width: 100,
      },
      {
        field: 'request_errored',
        title: this.$t('aice.llm_benchmark.request_errored'),
        width: 100,
      },
      {
        field: 'error_rate',
        title: this.$t('aice.llm_benchmark.error_rate'),
        width: 100,
        formatter: ({ row }) => {
          if (row.error_rate == null || row.error_rate === '') return '-'
          const val = Number(row.error_rate)
          if (Number.isNaN(val)) return row.error_rate
          return `${(val * 100).toFixed(2)}%`
        },
      },
      {
        field: 'requests_per_second_mean',
        title: this.$t('aice.llm_benchmark.requests_per_second_mean'),
        minWidth: 120,
        formatter: ({ row }) => {
          if (row.requests_per_second_mean == null || row.requests_per_second_mean === '') return '-'
          const val = Number(row.requests_per_second_mean)
          if (Number.isNaN(val)) return row.requests_per_second_mean
          return `${val.toFixed(2)}`
        },
      },
      {
        field: 'request_latency_mean_sec',
        title: this.$t('aice.llm_benchmark.request_latency_mean_sec'),
        minWidth: 130,
        formatter: ({ row }) => {
          if (row.request_latency_mean_sec == null || row.request_latency_mean_sec === '') return '-'
          const val = Number(row.request_latency_mean_sec)
          if (Number.isNaN(val)) return row.request_latency_mean_sec
          return `${val.toFixed(2)}s`
        },
      },
      getTimeTableColumn(),
    ]
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LlmBenchmarkSidePage', {
        id: row.id,
        resource: 'llm_benchmarks',
        steadyStatus: { state: BENCHMARK_TERMINAL_STATES },
        getParams: this.getParam,
      }, { list: this.list })
    },
  },
}
