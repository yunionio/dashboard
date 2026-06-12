import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { maskSecret } from '@Ai/utils/aiproxyUtils'

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
      getEnabledTableColumn(),
      {
        field: 'virtual_key',
        title: this.$t('aice.aiproxy.virtual_key_field'),
        minWidth: 200,
        slots: {
          default: ({ row }, h) => {
            if (!row.virtual_key) return '-'
            const text = maskSecret(row.virtual_key)
            return [
              <div class="d-flex align-items-center">
                <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{text}</side-page-trigger>
                <copy class="ml-1" message={row.virtual_key} />
              </div>,
            ]
          },
        },
        formatter: ({ row }) => (row.virtual_key ? maskSecret(row.virtual_key) : '-'),
      },
      { field: 'owner_name', title: this.$t('aice.aiproxy.owner'), minWidth: 100 },
      {
        field: 'limits',
        title: this.$t('aice.aiproxy.limits'),
        minWidth: 120,
        formatter: ({ row }) => {
          const l = row.limits || {}
          const parts = []
          if (l.max_tokens_per_request) parts.push(`tokens:${l.max_tokens_per_request}`)
          if (l.requests_per_minute) parts.push(`rpm:${l.requests_per_minute}`)
          return parts.length ? parts.join(', ') : '-'
        },
      },
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AiVirtualKeySidePage', {
        id: row.id,
        resource: 'ai_virtual_keys',
        getParams: this.getParam,
      }, { list: this.list })
    },
  },
}
