<template>
  <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_models" />
</template>

<script>
import AiproxyProviderLinkDetailMixin from '@Ai/mixins/aiproxyProviderLinkDetailMixin'
import { getAiProviderDetailField, getVisualProviderDetailField } from '@Ai/utils/aiproxyLlmLinkColumns'
import { getEnabledTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AiModelDetail',
  mixins: [AiproxyProviderLinkDetailMixin],
  props: {
    data: { type: Object, required: true },
    onManager: { type: Function, required: true },
  },
  computed: {
    visualConfig () {
      return this.data.config?.extensions?.visual || {}
    },
    baseInfo () {
      return [
        getEnabledTableColumn(),
        getAiProviderDetailField(this, {
          providerName: this.aiProviderDetailName,
          providerKey: this.aiProviderDetailKey,
        }),
        { field: 'model_key', title: this.$t('aice.aiproxy.model_key') },
        {
          field: 'visual_enabled',
          title: this.$t('aice.aiproxy.visual_enabled'),
          formatter: () => (this.visualConfig.enabled ? this.$t('status.enabled.true') : this.$t('status.enabled.false')),
        },
        getVisualProviderDetailField(this, {
          providerName: this.visualProviderDetailName,
          providerKey: this.visualProviderDetailKey,
        }),
        {
          field: 'visual_model_key',
          title: this.$t('aice.aiproxy.visual_model_key'),
          formatter: ({ row }) => row.visual_model_key || '-',
        },
        {
          field: 'visual_max_rounds',
          title: this.$t('aice.aiproxy.visual_max_rounds'),
          formatter: () => this.visualConfig.max_rounds || '-',
        },
        {
          field: 'visual_max_tokens',
          title: this.$t('aice.aiproxy.visual_max_tokens'),
          formatter: () => this.visualConfig.max_tokens || '-',
        },
        getTimeTableColumn(),
      ]
    },
  },
}
</script>
