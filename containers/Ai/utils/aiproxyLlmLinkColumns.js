import AiproxyProviderLabel from '@Ai/components/AiproxyProviderLabel'
import { getAiProviderDisplayName, getAiProviderKeyFromRow } from '@Ai/utils/aiProviderNames'
import { getAiModelDisplayName } from '@Ai/utils/aiModelNames'
import { getLlmDeploymentDisplayName } from '@Ai/utils/llmDeploymentNames'
import { getLlmInstanceDisplayName } from '@Ai/utils/llmInstanceNames'

function renderListBodyCellWrap (vm, { field, row, message, children }) {
  return vm.$createElement('list-body-cell-wrap', {
    props: {
      copy: true,
      hideField: true,
      field,
      row,
      message,
    },
  }, children)
}

function renderSidePageTrigger (vm, { onTrigger, children }) {
  return vm.$createElement('side-page-trigger', {
    on: {
      trigger: onTrigger,
    },
  }, children)
}

function renderAiProviderLabel (vm, { providerKey, label }) {
  return vm.$createElement(AiproxyProviderLabel, {
    props: {
      providerKey: providerKey || '',
      label: label || '',
      iconSize: 18,
    },
  })
}

function renderAiProviderLinkCell (vm, row, { providerName = '', providerKey = '' } = {}) {
  const id = row.ai_provider_id
  if (!id) return '-'
  const text = providerName || getAiProviderDisplayName(row, vm.aiProviderNameMap)
  const key = providerKey || getAiProviderKeyFromRow(row, vm.aiProviderKeyMap)
  const labelRow = providerKey ? { ...row, ai_provider_key: key } : row
  return [
    renderListBodyCellWrap(vm, {
      field: 'ai_provider_id',
      row,
      message: text,
      children: [
        renderSidePageTrigger(vm, {
          onTrigger: () => vm.handleOpenAiProviderSidepage(id),
          children: [
            renderAiProviderLabel(vm, {
              providerKey: getAiProviderKeyFromRow(labelRow, vm.aiProviderKeyMap) || key,
              label: text,
            }),
          ],
        }),
      ],
    }),
  ]
}

function renderTextLinkCell (vm, { field, row, message, onTrigger }) {
  if (!message || message === '-') return '-'
  return [
    renderListBodyCellWrap(vm, {
      field,
      row,
      message,
      children: [
        renderSidePageTrigger(vm, {
          onTrigger,
          children: [message],
        }),
      ],
    }),
  ]
}

export function getAiProviderLinkColumn (vm) {
  return {
    field: 'ai_provider_id',
    title: vm.$t('aice.aiproxy.provider'),
    minWidth: 160,
    slots: {
      default: ({ row }) => renderAiProviderLinkCell(vm, row),
    },
    formatter: ({ row }) => getAiProviderDisplayName(row, vm.aiProviderNameMap),
  }
}

export function getAiModelLinkColumn (vm) {
  return {
    field: 'ai_model_id',
    title: vm.$t('aice.aiproxy.model'),
    minWidth: 140,
    slots: {
      default: ({ row }) => {
        const id = row.ai_model_id
        if (!id) return '-'
        const text = getAiModelDisplayName(row, vm.aiModelNameMap)
        return renderTextLinkCell(vm, {
          field: 'ai_model_id',
          row,
          message: text,
          onTrigger: () => vm.handleOpenAiModelSidepage(id, row.ai_provider_id),
        })
      },
    },
    formatter: ({ row }) => getAiModelDisplayName(row, vm.aiModelNameMap),
  }
}

export function getAiProviderDetailField (vm, { providerName = '', providerKey = '' } = {}) {
  return {
    field: 'ai_provider_id',
    title: vm.$t('aice.aiproxy.provider'),
    slots: {
      default: ({ row }) => renderAiProviderLinkCell(vm, row, { providerName, providerKey }),
    },
    formatter: ({ row }) => getAiProviderDisplayName({ ...row, ai_provider_name: providerName }, vm.aiProviderNameMap),
  }
}

export function getLlmDeploymentLinkColumn (vm) {
  return {
    field: 'llm_deployment_id',
    title: vm.$t('aice.aiproxy.llm_deployment_id'),
    minWidth: 140,
    slots: {
      default: ({ row }) => {
        const id = row.llm_deployment_id
        if (!id) return '-'
        const text = getLlmDeploymentDisplayName(row, vm.llmDeploymentNameMap)
        return renderTextLinkCell(vm, {
          field: 'llm_deployment_id',
          row,
          message: text,
          onTrigger: () => vm.handleOpenLlmDeploymentSidepage(id),
        })
      },
    },
    formatter: ({ row }) => getLlmDeploymentDisplayName(row, vm.llmDeploymentNameMap),
  }
}

export function getLlmInstanceLinkColumn (vm) {
  return {
    field: 'llm_id',
    title: vm.$t('aice.aiproxy.llm_id'),
    minWidth: 140,
    slots: {
      default: ({ row }) => {
        const id = row.llm_id
        if (!id) return '-'
        const text = getLlmInstanceDisplayName(row, vm.llmInstanceNameMap)
        return renderTextLinkCell(vm, {
          field: 'llm_id',
          row,
          message: text,
          onTrigger: () => vm.handleOpenLlmInstanceSidepage(id),
        })
      },
    },
    formatter: ({ row }) => getLlmInstanceDisplayName(row, vm.llmInstanceNameMap),
  }
}

export function getLlmDeploymentDetailField (vm, { deploymentName = '' } = {}) {
  return {
    field: 'llm_deployment_id',
    title: vm.$t('aice.aiproxy.llm_deployment_id'),
    slots: {
      default: ({ row }) => {
        const id = row.llm_deployment_id
        if (!id) return '-'
        const text = deploymentName || getLlmDeploymentDisplayName(row, vm.llmDeploymentNameMap)
        return renderTextLinkCell(vm, {
          field: 'llm_deployment_id',
          row,
          message: text,
          onTrigger: () => vm.handleOpenLlmDeploymentSidepage(id),
        })
      },
    },
    formatter: ({ row }) => getLlmDeploymentDisplayName({ ...row, llm_deployment_name: deploymentName }, vm.llmDeploymentNameMap),
  }
}

export function getAiProxyNodeLinkColumn (vm) {
  return {
    field: 'ai_proxy_node_id',
    title: vm.$t('aice.aiproxy.ai_proxy_node_id'),
    minWidth: 120,
    slots: {
      default: ({ row }) => {
        const id = row.ai_proxy_node_id
        if (!id) return '-'
        return renderTextLinkCell(vm, {
          field: 'ai_proxy_node_id',
          row,
          message: id,
          onTrigger: () => vm.handleOpenAiProxyNodeSidepage(id),
        })
      },
    },
    formatter: ({ row }) => row.ai_proxy_node_id || '-',
  }
}

export function getAiProxyNodeDetailField (vm) {
  return {
    field: 'ai_proxy_node_id',
    title: vm.$t('aice.aiproxy.ai_proxy_node_id'),
    slots: {
      default: ({ row }) => {
        const id = row.ai_proxy_node_id
        if (!id) return '-'
        return renderTextLinkCell(vm, {
          field: 'ai_proxy_node_id',
          row,
          message: id,
          onTrigger: () => vm.handleOpenAiProxyNodeSidepage(id),
        })
      },
    },
    formatter: ({ row }) => row.ai_proxy_node_id || '-',
  }
}

export function getLlmInstanceDetailField (vm, { instanceName = '' } = {}) {
  return {
    field: 'llm_id',
    title: vm.$t('aice.aiproxy.llm_id'),
    slots: {
      default: ({ row }) => {
        const id = row.llm_id
        if (!id) return '-'
        const text = instanceName || getLlmInstanceDisplayName(row, vm.llmInstanceNameMap)
        return renderTextLinkCell(vm, {
          field: 'llm_id',
          row,
          message: text,
          onTrigger: () => vm.handleOpenLlmInstanceSidepage(id),
        })
      },
    },
    formatter: ({ row }) => getLlmInstanceDisplayName({ ...row, llm_name: instanceName }, vm.llmInstanceNameMap),
  }
}
