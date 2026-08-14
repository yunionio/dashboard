<template>
  <div class="monitor-overview-chart mt-4">
    <div class="header mb-1">
      <div class="title-wrapper">
        <div class="title">{{ $t('aice.aiproxy.usage.api_key_usage') }}</div>
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
import WindowsMixin from '@/mixins/windows'
import { isUsageVirtualKeyId } from '../utils/virtualKeyLink'

export default {
  name: 'AiproxyUsageApiKeyUsageTable',
  mixins: [WindowsMixin],
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
    apiKeyComposition () {
      return (this.overviewData || {}).api_key_composition || []
    },
    currentPageData () {
      if (!this.tableData.length) return []
      const { currentPage, pageSize } = this.page
      const start = (currentPage - 1) * pageSize
      return this.tableData.slice(start, start + pageSize)
    },
    vxeColumns () {
      return [
        { title: this.$t('aice.aiproxy.usage.api_key'), field: 'name', minWidth: 160, slots: { default: ({ row }) => this.renderApiKeyCell(row) }, formatter: ({ row }) => this.apiKeyLabel(row) },
        { title: this.$t('aice.aiproxy.usage.request_count_short'), field: 'request_count', minWidth: 100, formatter: ({ cellValue }) => cellValue ?? 0 },
        { title: this.$t('aice.aiproxy.usage.success_count'), field: 'success_count', minWidth: 100, formatter: ({ cellValue }) => cellValue ?? 0 },
        { title: this.$t('aice.aiproxy.usage.failure_count'), field: 'failure_count', minWidth: 100, formatter: ({ cellValue }) => cellValue ?? 0 },
        { title: this.$t('aice.aiproxy.usage.token_count'), field: 'token_count', minWidth: 100, formatter: ({ cellValue }) => cellValue ?? 0 },
        { title: this.$t('aice.aiproxy.usage.input_token_short'), field: 'input_tokens', minWidth: 90, formatter: ({ cellValue }) => cellValue ?? 0 },
        { title: this.$t('aice.aiproxy.usage.output_token_short'), field: 'output_tokens', minWidth: 90, formatter: ({ cellValue }) => cellValue ?? 0 },
      ]
    },
  },
  watch: {
    apiKeyComposition: {
      immediate: true,
      handler (val) {
        const raw = val || []
        this.tableData = raw.map((item, index) => ({
          ...item,
          index,
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
    apiKeyLabel (row) {
      return row.name || row.label || row.id || '-'
    },
    canOpenVirtualKey (id) {
      return isUsageVirtualKeyId(id)
    },
    renderApiKeyCell (row) {
      const text = this.apiKeyLabel(row)
      const id = row.id
      if (!this.canOpenVirtualKey(id)) return text
      return [
        <side-page-trigger permission="ai_virtual_keys_get" name="AiVirtualKeySidePage" id={id} vm={this}>{text}</side-page-trigger>,
      ]
    },
  },
}
</script>

<style lang="less" scoped>
.table-loading-wrap {
  // min-height: 200px;
}
</style>
