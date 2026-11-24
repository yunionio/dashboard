<template>
  <div>
    <detail
      :on-manager="onManager"
      :data="data"
      :base-info="baseInfo"
      :extra-info="extraInfo"
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
  getTopologyBadgeTableColumn,
  // 访问策略未实现，暂不展示
  // getAccessPolicyTableColumn,
} from '../utils/columns'
import DistTopology from './DistTopology'

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
        getTopologyBadgeTableColumn({ vm: this }),
        {
          field: 'distributed_inference',
          title: this.$t('aice.llm_deployment.distributed_inference'),
          formatter: ({ row }) => {
            if (row.distributed_inference === null || row.distributed_inference === undefined) return '-'
            return row.distributed_inference ? this.$t('common.true') : this.$t('common.false')
          },
        },
        {
          field: 'nnodes',
          title: this.$t('aice.llm_deployment.nnodes'),
          formatter: ({ row }) => {
            if (!row.nnodes) return this.$t('aice.llm_deployment.nnodes_auto')
            return row.nnodes
          },
        },
        {
          field: 'pipeline_parallel_size',
          title: this.$t('aice.llm_deployment.pipeline_parallel_size'),
          formatter: ({ row }) => {
            if (!row.pipeline_parallel_size) return this.$t('aice.llm_deployment.pipeline_parallel_size_auto')
            return row.pipeline_parallel_size
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
        // getAccessPolicyTableColumn(),
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
    extraInfo () {
      // Keep the pre-existing single-column layout for non-distributed
      // deployments: an empty array would still render the right column.
      if (!this.data?.distributed_inference) return undefined
      return [
        {
          title: this.$t('aice.llm_deployment.dist_topology.title'),
          items: [
            {
              field: 'distributed_nnodes',
              title: this.$t('aice.llm_deployment.dist_topology.nnodes'),
              formatter: ({ row }) => row.distributed_nnodes || '-',
            },
            {
              field: 'gpus_per_node',
              title: this.$t('aice.llm_deployment.dist_topology.gpus_per_node'),
              formatter: ({ row }) => row.gpus_per_node || '-',
            },
            {
              field: 'dist_groups',
              slots: {
                default: ({ row }) => this.$createElement(DistTopology, {
                  props: { groups: row.dist_groups, vm: this },
                }),
              },
            },
          ],
        },
      ]
    },
  },
}
</script>
