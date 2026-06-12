import i18n from '@/locales'

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
      default: ({ row }, h) => {
        if (!row.llm_sku_id) return '-'
        const text = row.llm_sku || row.llm_sku_id
        return [
          <list-body-cell-wrap copy hideField={true} field="llm_sku" row={row} message={text}>
            <side-page-trigger permission="llm_skus_get" name="LlmSkuSidePage" id={row.llm_sku_id} vm={vm}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
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
