<template>
  <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_models" />
</template>

<script>
import AiproxyProviderLinkDetailMixin from '@Ai/mixins/aiproxyProviderLinkDetailMixin'
import { getAiProviderDetailField } from '@Ai/utils/aiproxyLlmLinkColumns'
import { getEnabledTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AiModelDetail',
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
        { field: 'model_key', title: this.$t('aice.aiproxy.model_key') },
        getTimeTableColumn(),
      ]
    },
  },
}
</script>
