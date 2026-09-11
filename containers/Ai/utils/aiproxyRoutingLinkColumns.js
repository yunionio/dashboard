import { getAiRoutingDisplayName } from '@Ai/utils/aiRoutingNames'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'

function routingTriggerOptions (vm) {
  return {
    getParams: () => ({
      scope: getAiproxyResourceScope('ai_routings', vm),
      details: true,
    }),
  }
}

function renderRoutingLink (vm, row, { routingName = '', emptyText, onEmptyClick } = {}) {
  const id = row.aiproxy_routing_id
  if (!id) {
    if (typeof onEmptyClick === 'function') {
      const text = emptyText || vm.$t('ai.mcp.update_routing_required')
      return [
        vm.$createElement('a', {
          class: 'error-color',
          on: {
            click: () => onEmptyClick(row),
          },
        }, [text]),
      ]
    }
    return emptyText || '-'
  }
  const text = routingName || getAiRoutingDisplayName({ aiproxy_routing_id: id, ai_routing_name: row.ai_routing_name }, vm.aiRoutingNameMap)
  return [
    vm.$createElement('list-body-cell-wrap', {
      props: {
        copy: true,
        hideField: true,
        field: 'aiproxy_routing_id',
        row,
        message: text,
      },
    }, [
      vm.$createElement('side-page-trigger', {
        props: {
          permission: 'ai_routings_get',
          name: 'AiRoutingSidePage',
          id,
          vm,
          options: routingTriggerOptions(vm),
        },
      }, [text]),
    ]),
  ]
}

export function getAiRoutingTableColumn (vm, { routingName = '', title, emptyText, onEmptyClick } = {}) {
  return {
    field: 'aiproxy_routing_id',
    title: title || vm.$t('aice.aiproxy.routing'),
    slots: {
      default: ({ row }) => renderRoutingLink(vm, row, { routingName, emptyText, onEmptyClick }),
    },
    formatter: ({ row }) => {
      if (!row.aiproxy_routing_id) return emptyText || '-'
      return getAiRoutingDisplayName(
        { aiproxy_routing_id: row.aiproxy_routing_id, ai_routing_name: routingName || row.ai_routing_name },
        vm.aiRoutingNameMap,
      )
    },
  }
}

export function getAiRoutingDetailField (vm, { routingName = '', emptyText, onEmptyClick } = {}) {
  return getAiRoutingTableColumn(vm, {
    routingName,
    title: vm.$t('aice.llm_deployment.aiproxy_routing'),
    emptyText,
    onEmptyClick,
  })
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
