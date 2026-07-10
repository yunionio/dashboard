<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getDistinctFieldFilter } from '@/utils/common/tableFilter'
import { BENCHMARK_TERMINAL_STATES } from '../constants'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'LlmBenchmarkList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'llm_benchmarks',
        getParams: this.getParam,
        steadyStatus: {
          state: BENCHMARK_TERMINAL_STATES,
        },
        filterOptions: {
          name: getNameFilter(),
          llm_deployment: getDistinctFieldFilter({ field: 'llm_deployment', type: 'extra_field', label: this.$t('aice.llm_benchmark.deployment') }),
          state: {
            label: this.$t('common.status'),
            dropdown: true,
            items: [
              { label: this.$t('aice.llm_benchmark.state.pending'), key: 'pending' },
              { label: this.$t('aice.llm_benchmark.state.queued'), key: 'queued' },
              { label: this.$t('aice.llm_benchmark.state.running'), key: 'running' },
              { label: this.$t('aice.llm_benchmark.state.completed'), key: 'completed' },
              { label: this.$t('aice.llm_benchmark.state.stopped'), key: 'stopped' },
              { label: this.$t('aice.llm_benchmark.state.error'), key: 'error' },
            ],
          },
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'llm_benchmarks_create',
          action: () => this.$router.push({ name: 'LlmBenchmarkCreate' }),
          meta: () => ({ buttonType: 'primary', validate: true }),
        },
        {
          label: this.$t('table.action.delete'),
          permission: 'llm_benchmarks_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('aice.llm_benchmark'),
              onManager: this.onManager,
            })
          },
          meta: () => ({ validate: this.list.selected.length }),
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('aice.llm_benchmark'),
        items: this.columns,
      }
    },
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        details: true,
        scope: this.$store.getters.scope,
      }
    },
  },
}
</script>
