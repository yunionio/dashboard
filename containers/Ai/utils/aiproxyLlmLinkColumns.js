import { getAiProviderDisplayName } from '@Ai/utils/aiProviderNames'
import { getLlmDeploymentDisplayName } from '@Ai/utils/llmDeploymentNames'
import { getLlmInstanceDisplayName } from '@Ai/utils/llmInstanceNames'

export function getAiProviderLinkColumn (vm) {
  return {
    field: 'ai_provider_id',
    title: vm.$t('aice.aiproxy.provider'),
    minWidth: 140,
    slots: {
      default: ({ row }, h) => {
        const id = row.ai_provider_id
        if (!id) return '-'
        const text = getAiProviderDisplayName(row, vm.aiProviderNameMap)
        return [
          <list-body-cell-wrap copy hideField={true} field='ai_provider_id' row={row} message={text}>
            <side-page-trigger onTrigger={() => vm.handleOpenAiProviderSidepage(id)}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
    },
    formatter: ({ row }) => getAiProviderDisplayName(row, vm.aiProviderNameMap),
  }
}

export function getAiProviderDetailField (vm, { providerName = '' } = {}) {
  return {
    field: 'ai_provider_id',
    title: vm.$t('aice.aiproxy.provider'),
    slots: {
      default: ({ row }, h) => {
        const id = row.ai_provider_id
        if (!id) return '-'
        const text = providerName || getAiProviderDisplayName(row, vm.aiProviderNameMap)
        return [
          <list-body-cell-wrap copy hideField={true} field='ai_provider_id' row={row} message={text}>
            <side-page-trigger onTrigger={() => vm.handleOpenAiProviderSidepage(id)}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
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
      default: ({ row }, h) => {
        const id = row.llm_deployment_id
        if (!id) return '-'
        const text = getLlmDeploymentDisplayName(row, vm.llmDeploymentNameMap)
        return [
          <list-body-cell-wrap copy hideField={true} field='llm_deployment_id' row={row} message={text}>
            <side-page-trigger onTrigger={() => vm.handleOpenLlmDeploymentSidepage(id)}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
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
      default: ({ row }, h) => {
        const id = row.llm_id
        if (!id) return '-'
        const text = getLlmInstanceDisplayName(row, vm.llmInstanceNameMap)
        return [
          <list-body-cell-wrap copy hideField={true} field='llm_id' row={row} message={text}>
            <side-page-trigger onTrigger={() => vm.handleOpenLlmInstanceSidepage(id)}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
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
      default: ({ row }, h) => {
        const id = row.llm_deployment_id
        if (!id) return '-'
        const text = deploymentName || getLlmDeploymentDisplayName(row, vm.llmDeploymentNameMap)
        return [
          <list-body-cell-wrap copy hideField={true} field='llm_deployment_id' row={row} message={text}>
            <side-page-trigger onTrigger={() => vm.handleOpenLlmDeploymentSidepage(id)}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
    },
    formatter: ({ row }) => getLlmDeploymentDisplayName({ ...row, llm_deployment_name: deploymentName }, vm.llmDeploymentNameMap),
  }
}

export function getLlmInstanceDetailField (vm, { instanceName = '' } = {}) {
  return {
    field: 'llm_id',
    title: vm.$t('aice.aiproxy.llm_id'),
    slots: {
      default: ({ row }, h) => {
        const id = row.llm_id
        if (!id) return '-'
        const text = instanceName || getLlmInstanceDisplayName(row, vm.llmInstanceNameMap)
        return [
          <list-body-cell-wrap copy hideField={true} field='llm_id' row={row} message={text}>
            <side-page-trigger onTrigger={() => vm.handleOpenLlmInstanceSidepage(id)}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
    },
    formatter: ({ row }) => getLlmInstanceDisplayName({ ...row, llm_name: instanceName }, vm.llmInstanceNameMap),
  }
}
