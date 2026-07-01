<template>
  <div>
    <detail
      :on-manager="onManager"
      :data="data"
      :base-info="baseInfo"
      status-module="llmDeployment"
      resource="llm_deployments" />
  </div>
</template>

<script>
import AiproxyRoutingLinkDetailMixin from '@Ai/mixins/aiproxyRoutingLinkDetailMixin'
import { getAiRoutingDetailField } from '@Ai/utils/aiproxyRoutingLinkColumns'
import {
  getReplicasTableColumn,
  getBackendTableColumn,
  getLLMSkuTableColumn,
  getPlacementStrategyTableColumn,
  getAccessPolicyTableColumn,
} from '../utils/columns'

export default {
  name: 'LlmDeploymentDetail',
  mixins: [AiproxyRoutingLinkDetailMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  computed: {
    baseInfo () {
      return [
        getLLMSkuTableColumn({ vm: this }),
        getBackendTableColumn(),
        getReplicasTableColumn(),
        getPlacementStrategyTableColumn(),
        {
          field: 'distributed_inference',
          title: this.$t('aice.llm_deployment.distributed_inference'),
          formatter: ({ row }) => {
            if (row.distributed_inference === null || row.distributed_inference === undefined) return '-'
            return row.distributed_inference ? this.$t('common.true') : this.$t('common.false')
          },
        },
        {
          field: 'restart_on_error',
          title: this.$t('aice.llm_deployment.restart_on_error'),
          formatter: ({ row }) => {
            if (row.restart_on_error === null || row.restart_on_error === undefined) return '-'
            return row.restart_on_error ? this.$t('common.true') : this.$t('common.false')
          },
        },
        getAccessPolicyTableColumn(),
        {
          field: 'source',
          title: this.$t('aice.llm_deployment.source'),
          formatter: ({ row }) => row.source || '-',
        },
        {
          field: 'huggingface_repo_id',
          title: this.$t('aice.llm_deployment.huggingface_repo_id'),
          formatter: ({ row }) => row.huggingface_repo_id || '-',
        },
        {
          field: 'auto_register_aiproxy',
          title: this.$t('aice.llm_deployment.auto_register_aiproxy'),
          formatter: ({ row }) => {
            if (row.auto_register_aiproxy === null || row.auto_register_aiproxy === undefined) return '-'
            return row.auto_register_aiproxy ? this.$t('common.true') : this.$t('common.false')
          },
        },
        {
          field: 'aiproxy_sync_status',
          title: this.$t('aice.llm_deployment.aiproxy_sync_status'),
          formatter: ({ row }) => {
            const status = row.aiproxy_sync_status
            if (!status) return '-'
            const key = `status.llmDeploymentAiproxy.${status}`
            return this.$te(key) ? this.$t(key) : status
          },
        },
        getAiRoutingDetailField(this, { routingName: this.aiRoutingName }),
      ]
    },
  },
}
</script>
