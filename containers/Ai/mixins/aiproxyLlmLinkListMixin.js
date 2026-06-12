import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { fetchAiProviderNameMap } from '@Ai/utils/aiProviderNames'
import { fetchLlmDeploymentNameMap } from '@Ai/utils/llmDeploymentNames'
import { fetchLlmInstanceNameMap } from '@Ai/utils/llmInstanceNames'

export default {
  data () {
    return {
      llmDeploymentNameMap: {},
      llmInstanceNameMap: {},
      aiProviderNameMap: {},
    }
  },
  methods: {
    async enrichRowsWithAiProviderLinks (response) {
      const rows = response?.data?.data
      if (!Array.isArray(rows) || !rows.length) return
      const nameMap = await fetchAiProviderNameMap(
        rows.map(row => row.ai_provider_id),
        { vm: this },
      )
      if (this._isDestroyed) return
      this.aiProviderNameMap = { ...this.aiProviderNameMap, ...nameMap }
      rows.forEach(row => {
        const name = nameMap[row.ai_provider_id]
        if (name) row.ai_provider_name = name
      })
    },
    async enrichRowsWithAiproxyLlmLinks (response, { withDeployment = false, withInstance = false } = {}) {
      const rows = response?.data?.data
      if (!Array.isArray(rows) || !rows.length) return
      const scope = this.$store.getters.scope

      if (withDeployment) {
        const nameMap = await fetchLlmDeploymentNameMap(
          rows.map(row => row.llm_deployment_id),
          { scope },
        )
        if (this._isDestroyed) return
        this.llmDeploymentNameMap = { ...this.llmDeploymentNameMap, ...nameMap }
        rows.forEach(row => {
          const name = nameMap[row.llm_deployment_id]
          if (name) row.llm_deployment_name = name
        })
      }

      if (withInstance) {
        const nameMap = await fetchLlmInstanceNameMap(
          rows.map(row => row.llm_id),
          { scope },
        )
        if (this._isDestroyed) return
        this.llmInstanceNameMap = { ...this.llmInstanceNameMap, ...nameMap }
        rows.forEach(row => {
          const name = nameMap[row.llm_id]
          if (name) row.llm_name = name
        })
      }
    },
    syncAiproxyLlmLinkNamesForList ({ withDeployment = false, withInstance = false } = {}) {
      const rows = Object.keys(this.list?.data || {})
        .map(key => this.list.data[key]?.data)
        .filter(Boolean)
      if (!rows.length) return

      const patch = {}
      let needFetchDeployment = false
      let needFetchInstance = false

      if (withDeployment) {
        rows.forEach(row => {
          if (!row.llm_deployment_id) return
          const name = row.llm_deployment_name || this.llmDeploymentNameMap[row.llm_deployment_id]
          if (name && name !== row.llm_deployment_id) {
            if (!row.llm_deployment_name) row.llm_deployment_name = name
            patch[row.id] = { ...(patch[row.id] || {}), llm_deployment_name: name }
          } else if (!row.llm_deployment_name && !this.llmDeploymentNameMap[row.llm_deployment_id]) {
            needFetchDeployment = true
          }
        })
      }

      if (withInstance) {
        rows.forEach(row => {
          if (!row.llm_id) return
          const name = row.llm_name || this.llmInstanceNameMap[row.llm_id]
          if (name && name !== row.llm_id) {
            if (!row.llm_name) row.llm_name = name
            patch[row.id] = { ...(patch[row.id] || {}), llm_name: name }
          } else if (!row.llm_name && !this.llmInstanceNameMap[row.llm_id]) {
            needFetchInstance = true
          }
        })
      }

      if (Object.keys(patch).length) {
        this.list.updatesProperty(patch)
      }

      if (needFetchDeployment || needFetchInstance) {
        this.enrichRowsWithAiproxyLlmLinks({ data: { data: rows } }, { withDeployment: needFetchDeployment, withInstance: needFetchInstance }).then(() => {
          const nextPatch = {}
          rows.forEach(row => {
            const item = {}
            if (withDeployment && row.llm_deployment_name) {
              item.llm_deployment_name = row.llm_deployment_name
            }
            if (withInstance && row.llm_name) {
              item.llm_name = row.llm_name
            }
            if (Object.keys(item).length) {
              nextPatch[row.id] = item
            }
          })
          if (Object.keys(nextPatch).length) {
            this.list.updatesProperty(nextPatch)
          }
        })
      }
    },
    handleOpenLlmDeploymentSidepage (deploymentId) {
      if (!deploymentId) return
      this.sidePageTriggerHandle(this, 'LlmDeploymentSidePage', {
        id: deploymentId,
        resource: 'llm_deployments',
        getParams: () => ({
          scope: this.$store.getters.scope,
          details: true,
        }),
      })
    },
    handleOpenLlmInstanceSidepage (llmId) {
      if (!llmId) return
      this.sidePageTriggerHandle(this, 'LlmSidePage', {
        id: llmId,
        resource: 'llms',
        getParams: () => ({
          scope: this.$store.getters.scope,
          details: true,
        }),
      })
    },
    handleOpenAiProviderSidepage (providerId) {
      if (!providerId) return
      this.sidePageTriggerHandle(this, 'AiProviderSidePage', {
        id: providerId,
        resource: 'ai_providers',
        getParams: () => ({
          scope: getAiproxyResourceScope('ai_providers', this),
          details: true,
        }),
      })
    },
    syncAiProviderNamesForList () {
      const rows = Object.keys(this.list?.data || {})
        .map(key => this.list.data[key]?.data)
        .filter(row => row?.ai_provider_id)
      if (!rows.length) return

      const patch = {}
      let needFetch = false
      rows.forEach(row => {
        const name = row.ai_provider_name || this.aiProviderNameMap[row.ai_provider_id]
        if (name && name !== row.ai_provider_id) {
          if (!row.ai_provider_name) row.ai_provider_name = name
          patch[row.id] = { ...(patch[row.id] || {}), ai_provider_name: name }
        } else if (!row.ai_provider_name && !this.aiProviderNameMap[row.ai_provider_id]) {
          needFetch = true
        }
      })
      if (Object.keys(patch).length) {
        this.list.updatesProperty(patch)
      }
      if (needFetch) {
        this.enrichRowsWithAiProviderLinks({ data: { data: rows } }).then(() => {
          const nextPatch = {}
          rows.forEach(row => {
            if (row.ai_provider_name) {
              nextPatch[row.id] = { ai_provider_name: row.ai_provider_name }
            }
          })
          if (Object.keys(nextPatch).length) {
            this.list.updatesProperty(nextPatch)
          }
        })
      }
    },
  },
}
