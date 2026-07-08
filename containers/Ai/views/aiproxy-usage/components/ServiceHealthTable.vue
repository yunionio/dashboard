<template>
  <div class="monitor-overview-chart mt-4">
    <div class="header mb-1">
      <div class="title-wrapper">
        <div class="title">{{ $t('aice.aiproxy.usage.service_health') }}</div>
      </div>
    </div>
    <a-spin :spinning="loading" class="table-loading-wrap">
      <vxe-grid
        ref="grid"
        :data="currentPageData"
        :columns="vxeColumns"
        show-header-overflow
        show-overflow
        highlight-hover-row
        resizable
        size="small">
        <template v-slot:empty>
          <loader :loading="false" :noDataText="$t('common.notData')" />
        </template>
        <template v-slot:pager>
          <vxe-pager
            :current-page="page.currentPage"
            :page-size="page.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="page.total"
            :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'Sizes', 'Total']"
            @page-change="handlePageChange" />
        </template>
      </vxe-grid>
    </a-spin>
  </div>
</template>

<script>
export default {
  name: 'AiproxyUsageServiceHealthTable',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    overviewData: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      tableData: [],
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
    }
  },
  computed: {
    serviceHealth () {
      return (this.overviewData || {}).service_health || []
    },
    currentPageData () {
      if (!this.tableData.length) return []
      const { currentPage, pageSize } = this.page
      const start = (currentPage - 1) * pageSize
      return this.tableData.slice(start, start + pageSize)
    },
    vxeColumns () {
      return [
        { title: this.$t('aice.aiproxy.usage.provider'), field: 'provider', minWidth: 140, formatter: ({ cellValue }) => cellValue ?? '-' },
        { title: this.$t('aice.aiproxy.usage.model'), field: 'model', minWidth: 200, formatter: ({ cellValue }) => cellValue ?? '-' },
        { title: this.$t('aice.aiproxy.usage.request_count_short'), field: 'request_count', minWidth: 100, formatter: ({ cellValue }) => cellValue ?? 0 },
        { title: this.$t('aice.aiproxy.usage.success_rate_short'), field: 'successRate', minWidth: 100 },
        { title: this.$t('aice.aiproxy.usage.avg_latency_short'), field: 'avg_latency_ms', minWidth: 100, formatter: ({ cellValue }) => this.formatDuration(cellValue) },
        { title: this.$t('aice.aiproxy.usage.last_status'), field: 'last_status_code', minWidth: 100, formatter: ({ cellValue }) => cellValue ?? '-' },
      ]
    },
  },
  watch: {
    serviceHealth: {
      immediate: true,
      handler (val) {
        const raw = val || []
        this.tableData = raw.map((item, index) => ({
          ...item,
          index,
          successRate: item.request_count > 0
            ? ((item.success_count / item.request_count) * 100).toFixed(1) + '%'
            : '-',
        }))
        this.page.total = this.tableData.length
        this.page.currentPage = 1
      },
    },
  },
  methods: {
    handlePageChange ({ type, currentPage, pageSize }) {
      if (type === 'current' && currentPage) {
        this.page.currentPage = currentPage
      }
      if (type === 'size' && pageSize) {
        this.page.pageSize = pageSize
        this.page.currentPage = 1
      }
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

<style lang="less" scoped>
.table-loading-wrap {
  min-height: 200px;
}
</style>
