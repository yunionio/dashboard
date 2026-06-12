<template>
  <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_routings" />
</template>

<script>
import AiproxyProxyNodeLinkDetailMixin from '@Ai/mixins/aiproxyProxyNodeLinkDetailMixin'
import { getAiProxyNodeDetailField } from '@Ai/utils/aiproxyLlmLinkColumns'
import { getEnabledTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AiRoutingDetail',
  mixins: [AiproxyProxyNodeLinkDetailMixin],
  props: {
    data: { type: Object, required: true },
    onManager: { type: Function, required: true },
  },
  computed: {
    baseInfo () {
      return [
        getEnabledTableColumn(),
        { field: 'model_key', title: this.$t('aice.aiproxy.model_key') },
        { field: 'priority', title: this.$t('aice.aiproxy.priority') },
        getAiProxyNodeDetailField(this),
        getProjectTableColumn(),
        getTimeTableColumn(),
      ]
    },
  },
}
</script>
