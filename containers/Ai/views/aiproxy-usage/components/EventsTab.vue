<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :show-single-actions="false"
    @filterChange="onListFilterChange" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import {
  buildUsageQueryParams,
  DEFAULT_EVENTS_PAGE_SIZE,
  searchValueToUsageFilters,
  usageFiltersToSearchValue,
} from '../constants'
import { buildUsageSearchFilterOptions } from '../utils/filterOptions'
import { isUsageVirtualKeyId } from '../utils/virtualKeyLink'

export default {
  name: 'AiproxyUsageEventsTab',
  mixins: [WindowsMixin, ListMixin],
  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: 'AiProxyUsageEvents',
        resource: 'ai_proxy_usage/events',
        getParams: this.getParam,
        limit: DEFAULT_EVENTS_PAGE_SIZE,
        hiddenColumns: ['error_message'],
        autoHiddenFilterKey: 'aiproxy_usage_events_hidden_columns',
        filterOptions: buildUsageSearchFilterOptions({
          t: key => this.$t(key),
          fetchEventsDistinctField: params => this.fetchEventsDistinctField(params),
          includeEventsFilters: true,
        }),
        fetchDataCb: res => {
          if (res.data?.truncated) {
            this.$emit('truncated-change', true)
          }
        },
      }),
      columns: [],
      syncingFilter: false,
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('aice.aiproxy.usage.events'),
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('aice.aiproxy.usage.time'), key: 'timestamp' },
          { label: this.$t('aice.aiproxy.usage.model'), key: 'model' },
          { label: this.$t('aice.aiproxy.usage.provider'), key: 'provider_name' },
          { label: this.$t('aice.aiproxy.usage.source'), key: 'source' },
          { label: this.$t('aice.aiproxy.usage.api_key'), key: 'api_key_label' },
          { label: this.$t('aice.aiproxy.usage.ai_key'), key: 'auth_index_name' },
          { label: this.$t('res.project'), key: 'project_name' },
          { label: this.$t('res.domain'), key: 'domain_name' },
          { label: this.$t('aice.aiproxy.usage.input_token_short'), key: 'input_tokens' },
          { label: this.$t('aice.aiproxy.usage.output_token_short'), key: 'output_tokens' },
          { label: this.$t('aice.aiproxy.usage.total_token_short'), key: 'total_tokens' },
          { label: this.$t('aice.aiproxy.usage.latency'), key: 'latency_ms' },
          { label: this.$t('aice.aiproxy.usage.result'), key: 'result' },
          { label: this.$t('aice.aiproxy.usage.status_code'), key: 'status_code' },
          { label: this.$t('aice.aiproxy.usage.error'), key: 'error_message' },
        ],
      }
    },
  },
  watch: {
    filters: {
      deep: true,
      handler (val) {
        this.syncListFilter(val, { fetch: this.active })
      },
    },
    active (val) {
      if (val) {
        this.syncListFilter(this.filters, { fetch: true })
      }
    },
  },
  created () {
    this.initColumns()
    this.syncListFilter(this.filters, { fetch: false })
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return buildUsageQueryParams(this.filters)
    },
    fetchEventsDistinctField (params) {
      return new this.$Manager('ai_proxy_usage', 'v2').getSpecific({
        id: 'events',
        spec: 'distinct-field',
        params: {
          ...params,
          ...buildUsageQueryParams(this.filters),
        },
      })
    },
    syncListFilter (filters, { fetch = true } = {}) {
      if (!this.list || this.syncingFilter) return
      const nextFilter = usageFiltersToSearchValue(filters, { includeEventsFields: true })
      if (JSON.stringify(this.list.filter) === JSON.stringify(nextFilter)) return
      this.syncingFilter = true
      this.list.filter = nextFilter
      if (fetch) {
        this.list.refresh()
      }
      this.$nextTick(() => {
        this.syncingFilter = false
      })
    },
    onListFilterChange (filter) {
      if (this.syncingFilter) return
      this.$emit('update:filters', searchValueToUsageFilters(filter))
    },
    initColumns () {
      this.columns = [
        { field: 'id', title: 'ID', minWidth: 120, formatter: ({ cellValue }) => cellValue || '-' },
        getTimeTableColumn({
          field: 'timestamp',
          title: this.$t('aice.aiproxy.usage.time'),
          minWidth: 160,
          vm: this,
        }),
        { field: 'model', title: this.$t('aice.aiproxy.usage.model'), minWidth: 160, formatter: ({ cellValue }) => cellValue || '-' },
        { field: 'provider', title: this.$t('aice.aiproxy.usage.provider'), minWidth: 120, formatter: ({ row }) => row.provider_name || row.provider || '-' },
        { field: 'source', title: this.$t('aice.aiproxy.usage.source'), minWidth: 180, formatter: ({ cellValue }) => cellValue || '-' },
        {
          field: 'api_key',
          title: this.$t('aice.aiproxy.usage.api_key'),
          minWidth: 140,
          slots: {
            default: ({ row }) => {
              const text = this.formatKeyLabel(row)
              const id = row.api_key_id || row.api_key
              if (!isUsageVirtualKeyId(id)) return text
              return [
                <side-page-trigger permission="ai_virtual_keys_get" name="AiVirtualKeySidePage" id={id} vm={this}>{text}</side-page-trigger>,
              ]
            },
          },
          formatter: ({ row }) => this.formatKeyLabel(row),
        },
        {
          field: 'auth_index',
          title: this.$t('aice.aiproxy.usage.ai_key'),
          minWidth: 140,
          slots: {
            default: ({ row }) => {
              const text = this.formatAiKeyLabel(row)
              const id = row.auth_index
              if (!isUsageVirtualKeyId(id)) return text
              return [
                <side-page-trigger permission="ai_keys_get" name="AiKeySidePage" id={id} vm={this}>{text}</side-page-trigger>,
              ]
            },
          },
          formatter: ({ row }) => this.formatAiKeyLabel(row),
        },
        getProjectTableColumn({ field: 'project_name', domainField: 'domain_name', sortable: false, minWidth: 120 }),
        {
          field: 'input_tokens',
          title: this.$t('aice.aiproxy.usage.input_token_short'),
          minWidth: 90,
          formatter: ({ cellValue }) => cellValue ?? 0,
        },
        {
          field: 'output_tokens',
          title: this.$t('aice.aiproxy.usage.output_token_short'),
          minWidth: 90,
          formatter: ({ cellValue }) => cellValue ?? 0,
        },
        {
          field: 'total_tokens',
          title: this.$t('aice.aiproxy.usage.total_token_short'),
          minWidth: 90,
          formatter: ({ row }) => {
            const input = row.input_tokens ?? 0
            const output = row.output_tokens ?? 0
            return row.total_tokens ?? (input + output)
          },
        },
        {
          field: 'latency_ms',
          title: this.$t('aice.aiproxy.usage.latency'),
          minWidth: 100,
          formatter: ({ cellValue }) => this.formatDuration(cellValue),
        },
        {
          field: 'result',
          title: this.$t('aice.aiproxy.usage.result'),
          minWidth: 80,
          slots: {
            default: ({ row }) => {
              const color = row.result === 'success' ? 'green' : 'red'
              return [<a-tag color={color}>{this.resultLabel(row.result)}</a-tag>]
            },
          },
          formatter: ({ cellValue }) => this.resultLabel(cellValue),
        },
        { field: 'status_code', title: this.$t('aice.aiproxy.usage.status_code'), minWidth: 80, formatter: ({ cellValue }) => cellValue ?? '-' },
        { field: 'error_message', title: this.$t('aice.aiproxy.usage.error'), minWidth: 160, formatter: ({ cellValue }) => cellValue || '-' },
      ]
    },
    resultLabel (val) {
      if (val === 'success') return this.$t('aice.aiproxy.usage.success')
      if (val === 'failed') return this.$t('aice.aiproxy.usage.failed')
      return val || '-'
    },
    formatKeyLabel (record) {
      return record.api_key_label || record.api_key_name || record.api_key || '-'
    },
    formatAiKeyLabel (record) {
      return record.auth_index_name || record.auth_index_label || record.auth_index || '-'
    },
    formatDuration (ms) {
      if (ms == null) return '-'
      if (ms < 1000) return ms.toFixed(0) + 'ms'
      if (ms < 60000) return (ms / 1000).toFixed(2) + 's'
      return (ms / 60000).toFixed(2) + 'min'
    },
  },
}
</script>
