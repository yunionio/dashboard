import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import AiproxyProviderLabel from '@Ai/components/AiproxyProviderLabel'
import { effectiveProviderBaseURL } from '@Ai/utils/aiproxyProviderDefaults'

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
        field: 'provider_key',
        title: this.$t('aice.aiproxy.provider_key'),
        minWidth: 160,
        slots: {
          default: ({ row }) => [
            this.$createElement(AiproxyProviderLabel, {
              props: {
                providerKey: row.provider_key,
                label: row.provider_key,
                iconSize: 18,
              },
            }),
          ],
        },
        formatter: ({ row }) => row.provider_key || '-',
      },
      {
        field: 'config.base_url',
        title: this.$t('aice.aiproxy.api_url'),
        minWidth: 180,
        formatter: ({ row }) => {
          const url = effectiveProviderBaseURL(
            row.provider_key,
            row.config?.api_mode,
            row.config?.base_url,
          )
          return url || '-'
        },
      },
      getTimeTableColumn(),
    ]
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AiProviderSidePage', {
        id: row.id,
        resource: 'ai_providers',
        getParams: this.getParam,
      }, { list: this.list })
    },
  },
}
