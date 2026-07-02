<template>
  <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_providers" />
</template>

<script>
import AiproxyLlmLinkDetailMixin from '@Ai/mixins/aiproxyLlmLinkDetailMixin'
import AiproxyProviderLabel from '@Ai/components/AiproxyProviderLabel'
import { getLlmDeploymentDetailField, getLlmInstanceDetailField } from '@Ai/utils/aiproxyLlmLinkColumns'
import { getEnabledTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import { formatApiModeLabel, supportsDualAPIMode } from '@Ai/utils/aiproxyProviderApiMode'
import { isCustomProviderKey } from '@Ai/utils/aiproxyProviderTypes'
import { effectiveProviderBaseURL } from '@Ai/utils/aiproxyProviderDefaults'

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
        {
          field: 'provider_key',
          title: this.$t('aice.aiproxy.provider_key'),
          slots: {
            default: ({ row }) => [
              this.$createElement(AiproxyProviderLabel, {
                props: {
                  providerKey: row.provider_key,
                  label: isCustomProviderKey(row.provider_key)
                    ? this.$t('aice.aiproxy.provider_type.custom')
                    : row.provider_key,
                  iconSize: 18,
                },
              }),
            ],
          },
          formatter: ({ row }) => {
            if (isCustomProviderKey(row.provider_key)) {
              return this.$t('aice.aiproxy.provider_type.custom')
            }
            return row.provider_key || '-'
          },
        },
        {
          field: 'config.base_url',
          title: this.$t('aice.aiproxy.api_url'),
          formatter: ({ row }) => {
            const url = effectiveProviderBaseURL(
              row.provider_key,
              row.config?.api_mode,
              row.config?.base_url,
            )
            return url || '-'
          },
        },
        {
          field: 'config.api_mode',
          title: this.$t('aice.aiproxy.api_mode'),
          formatter: ({ row }) => {
            if (!supportsDualAPIMode(row.provider_key)) return '-'
            return formatApiModeLabel(this, row.config?.api_mode)
          },
        },
        getLlmDeploymentDetailField(this, { deploymentName: this.llmDeploymentName }),
        getLlmInstanceDetailField(this, { instanceName: this.llmInstanceName }),
        getTimeTableColumn(),
      ]
    },
  },
}
</script>
