<template>
  <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_keys" />
</template>

<script>
import AiproxyProviderLinkDetailMixin from '@Ai/mixins/aiproxyProviderLinkDetailMixin'
import { getAiProviderDetailField } from '@Ai/utils/aiproxyLlmLinkColumns'
import { getEnabledTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import { maskSecret } from '@Ai/utils/aiproxyUtils'

export default {
  name: 'AiKeyDetail',
  mixins: [AiproxyProviderLinkDetailMixin],
  props: {
    data: { type: Object, required: true },
    onManager: { type: Function, required: true },
  },
  computed: {
    baseInfo () {
      return [
        getEnabledTableColumn(),
        getAiProviderDetailField(this, {
          providerName: this.aiProviderDetailName,
          providerKey: this.aiProviderDetailKey,
        }),
        { field: 'weight', title: this.$t('aice.aiproxy.weight') },
        {
          field: 'secret',
          title: this.$t('aice.aiproxy.secret'),
          formatter: ({ row }) => maskSecret(row.secret),
        },
        {
          field: 'routing.allowed_model_keys',
          title: this.$t('aice.aiproxy.allowed_model_keys'),
          formatter: ({ row }) => (row.routing?.allowed_model_keys || []).join(', ') || '-',
        },
        {
          field: 'routing.blocked_model_keys',
          title: this.$t('aice.aiproxy.blocked_model_keys'),
          formatter: ({ row }) => (row.routing?.blocked_model_keys || []).join(', ') || '-',
        },
        getTimeTableColumn(),
      ]
    },
  },
}
</script>
