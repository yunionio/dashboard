<template>
  <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_routings" />
</template>

<script>
import AiproxyLlmLinkDetailMixin from '@Ai/mixins/aiproxyLlmLinkDetailMixin'
import { getLlmDeploymentDetailField } from '@Ai/utils/aiproxyLlmLinkColumns'
import { getEnabledTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AiRoutingDetail',
  mixins: [AiproxyLlmLinkDetailMixin],
  props: {
    data: { type: Object, required: true },
    onManager: { type: Function, required: true },
  },
  computed: {
    baseInfo () {
      return [
        getEnabledTableColumn(),
        { field: 'model_pattern', title: this.$t('aice.aiproxy.model_pattern') },
        { field: 'priority', title: this.$t('aice.aiproxy.priority') },
        { field: 'ai_proxy_node_id', title: this.$t('aice.aiproxy.ai_proxy_node_id') },
        getLlmDeploymentDetailField(this, { deploymentName: this.llmDeploymentName }),
        getProjectTableColumn(),
        getTimeTableColumn(),
      ]
    },
  },
}
</script>
