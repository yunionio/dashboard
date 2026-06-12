import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getAiProviderLinkColumn } from '@Ai/utils/aiproxyLlmLinkColumns'

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
      getAiProviderLinkColumn(this),
      { field: 'weight', title: this.$t('aice.aiproxy.weight'), width: 80 },
      {
        field: 'routing',
        title: this.$t('aice.aiproxy.routing_config'),
        minWidth: 160,
        formatter: ({ row }) => {
          const r = row.routing || {}
          const parts = []
          if (r.allowed_model_keys?.length) parts.push(`+${r.allowed_model_keys.length}`)
          if (r.blocked_model_keys?.length) parts.push(`-${r.blocked_model_keys.length}`)
          return parts.length ? parts.join(' ') : '-'
        },
      },
      getTimeTableColumn(),
    ]
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AiKeySidePage', {
        id: row.id,
        resource: 'ai_keys',
        getParams: this.getParam,
      }, { list: this.list })
    },
  },
}
