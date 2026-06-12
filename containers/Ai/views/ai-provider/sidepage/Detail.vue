<template>
  <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_providers" />
</template>

<script>
import AiproxyLlmLinkDetailMixin from '@Ai/mixins/aiproxyLlmLinkDetailMixin'
import { getLlmDeploymentDetailField, getLlmInstanceDetailField } from '@Ai/utils/aiproxyLlmLinkColumns'
import { getEnabledTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import { maskSecret } from '@Ai/utils/aiproxyUtils'

export default {
  name: 'AiProviderDetail',
  mixins: [AiproxyLlmLinkDetailMixin],
  props: {
    data: { type: Object, required: true },
    onManager: { type: Function, required: true },
  },
  computed: {
    baseInfo () {
      return [
        getEnabledTableColumn(),
        { field: 'provider_key', title: this.$t('aice.aiproxy.provider_key') },
        {
          field: 'config.base_url',
          title: this.$t('aice.aiproxy.base_url'),
          formatter: ({ row }) => row.config?.base_url || '-',
        },
        {
          field: 'config.api_key',
          title: this.$t('aice.aiproxy.api_key_field'),
          formatter: ({ row }) => maskSecret(row.config?.api_key),
        },
        getLlmDeploymentDetailField(this, { deploymentName: this.llmDeploymentName }),
        getLlmInstanceDetailField(this, { instanceName: this.llmInstanceName }),
        getTimeTableColumn(),
      ]
    },
  },
}
</script>
