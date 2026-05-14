<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="llmDeployment"
    resource="llm_deployments" />
</template>

<script>
import {
  getReplicasTableColumn,
  getBackendTableColumn,
  getLLMSkuTableColumn,
  getPlacementStrategyTableColumn,
  getAccessPolicyTableColumn,
} from '../utils/columns'

export default {
  name: 'LlmDeploymentDetail',
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
  data () {
    return {
      baseInfo: [
        getLLMSkuTableColumn(),
        getBackendTableColumn(),
        {
          field: 'backend_version',
          title: this.$t('aice.llm_deployment.backend_version'),
          formatter: ({ row }) => row.backend_version || '-',
        },
        getReplicasTableColumn(),
        getPlacementStrategyTableColumn(),
        {
          field: 'cpu_offloading',
          title: this.$t('aice.llm_deployment.cpu_offloading'),
          formatter: ({ row }) => {
            if (row.cpu_offloading === null || row.cpu_offloading === undefined) return '-'
            return row.cpu_offloading ? this.$t('common.true') : this.$t('common.false')
          },
        },
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
      ],
    }
  },
}
</script>
