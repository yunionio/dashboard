import i18n from '@/locales'
import { getParallelModeShortLabel, formatTopologySummary } from './topology'

export const getReplicasTableColumn = () => ({
  field: 'replicas_display',
  title: i18n.t('aice.llm_deployment.replicas'),
  width: 120,
  formatter: ({ row }) => {
    const ready = row.ready_replicas || 0
    const desired = row.replicas || 0
    return `${ready}/${desired}`
  },
})

export const getBackendTableColumn = () => ({
  field: 'backend',
  title: i18n.t('aice.llm_deployment.backend'),
  width: 100,
})

export const getLLMSkuTableColumn = ({ vm } = {}) => {
  const column = {
    field: 'llm_sku',
    title: i18n.t('aice.llm_sku'),
    showOverflow: 'title',
    minWidth: 120,
    formatter: ({ row }) => {
      if (!row.llm_sku_id) return '-'
      return row.llm_sku || row.llm_sku_id
    },
  }
  if (vm) {
    column.slots = {
      default: ({ row }) => {
        if (!row.llm_sku_id) return '-'
        const text = row.llm_sku || row.llm_sku_id
        return [
          vm.$createElement('list-body-cell-wrap', {
            props: {
              copy: true,
              hideField: true,
              field: 'llm_sku',
              row,
              message: text,
            },
          }, [
            vm.$createElement('side-page-trigger', {
              props: {
                permission: 'llm_skus_get',
                name: 'LlmSkuSidePage',
                id: row.llm_sku_id,
                vm,
              },
            }, [text]),
          ]),
        ]
      },
    }
  }
  return column
}

export const getPlacementStrategyTableColumn = () => ({
  field: 'placement_strategy',
  title: i18n.t('aice.llm_deployment.placement_strategy'),
  width: 100,
  formatter: ({ row }) => {
    if (!row.placement_strategy) return '-'
    const key = `aice.llm_deployment.placement_strategy.${row.placement_strategy}`
    return i18n.te(key) ? i18n.t(key) : row.placement_strategy
  },
})

// getDistributedInferenceTableColumn shows the per-replica multi-host layout:
// "3 × 8" means 3 nodes with 8 GPUs each. Single-host replicas show as such.
export const getDistributedInferenceTableColumn = () => ({
  field: 'distributed_inference',
  title: i18n.t('aice.llm_deployment.distributed_inference'),
  width: 140,
  formatter: ({ row }) => {
    if (row.distributed_inference === null || row.distributed_inference === undefined) return '-'
    if (!row.distributed_inference) return i18n.t('aice.llm_deployment.dist_role.single')
    const nnodes = row.distributed_nnodes || 1
    const gpus = row.gpus_per_node || 0
    if (nnodes <= 1) return i18n.t('aice.llm_deployment.dist_role.single')
    return `${nnodes} × ${gpus}`
  },
})

export const getTopologyBadgeTableColumn = ({ vm } = {}) => {
  const column = {
    field: 'parallel_mode',
    title: i18n.t('aice.llm_deployment.topology_badge'),
    width: 180,
    formatter: ({ row }) => {
      if (!row.distributed_inference) return i18n.t('aice.llm_deployment.dist_role.single')
      const mode = row.parallel_mode || 'pp'
      return `${getParallelModeShortLabel(mode)} · ${formatTopologySummary({
        parallel_mode: mode,
        distributed_nnodes: row.distributed_nnodes,
        gpus_per_node: row.gpus_per_node,
        tensor_parallel_size: row.tensor_parallel_size,
        pipeline_parallel_size: row.pipeline_parallel_size,
        data_parallel_size: row.data_parallel_size,
      })}`
    },
  }
  if (vm) {
    column.slots = {
      default: ({ row }) => {
        if (!row.distributed_inference) return i18n.t('aice.llm_deployment.dist_role.single')
        const mode = row.parallel_mode || 'pp'
        const summary = formatTopologySummary({
          parallel_mode: mode,
          distributed_nnodes: row.distributed_nnodes,
          gpus_per_node: row.gpus_per_node,
          tensor_parallel_size: row.tensor_parallel_size,
          pipeline_parallel_size: row.pipeline_parallel_size,
          data_parallel_size: row.data_parallel_size,
        })
        return [
          vm.$createElement('a-tag', {
            props: { color: mode === 'dp' ? 'blue' : 'purple' },
          }, [getParallelModeShortLabel(mode)]),
          vm.$createElement('span', {
            class: 'text-color-help ml-1',
            attrs: { title: summary },
          }, [summary]),
        ]
      },
    }
  }
  return column
}

export const getAccessPolicyTableColumn = () => ({
  field: 'access_policy',
  title: i18n.t('aice.llm_deployment.access_policy'),
  width: 100,
  formatter: ({ row }) => {
    if (!row.access_policy) return '-'
    const key = `aice.llm_deployment.access_policy.${row.access_policy}`
    return i18n.te(key) ? i18n.t(key) : row.access_policy
  },
})
