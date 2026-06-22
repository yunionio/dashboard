import { getAiRoutingDisplayName } from '@Ai/utils/aiRoutingNames'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'

export function getAiRoutingDetailField (vm, { routingName = '' } = {}) {
  return {
    field: 'aiproxy_routing_id',
    title: vm.$t('aice.llm_deployment.aiproxy_routing'),
    slots: {
      default: ({ row }, h) => {
        const id = row.aiproxy_routing_id
        if (!id) return '-'
        const text = routingName || getAiRoutingDisplayName({ aiproxy_routing_id: id, ai_routing_name: row.ai_routing_name }, vm.aiRoutingNameMap)
        return [
          <list-body-cell-wrap copy hideField={true} field='aiproxy_routing_id' row={row} message={text}>
            <side-page-trigger onTrigger={() => vm.handleOpenAiRoutingSidepage(id)}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
    },
    formatter: ({ row }) => {
      if (!row.aiproxy_routing_id) return '-'
      return getAiRoutingDisplayName(
        { aiproxy_routing_id: row.aiproxy_routing_id, ai_routing_name: routingName || row.ai_routing_name },
        vm.aiRoutingNameMap,
      )
    },
  }
}

export function openAiRoutingSidepage (vm, routingId) {
  if (!routingId || !vm?.sidePageTriggerHandle) return
  vm.sidePageTriggerHandle(vm, 'AiRoutingSidePage', {
    id: routingId,
    resource: 'ai_routings',
    getParams: () => ({
      scope: getAiproxyResourceScope('ai_routings', vm),
      details: true,
    }),
  })
}
