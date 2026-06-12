import WindowsMixin from '@/mixins/windows'
import { fetchLlmDeploymentNameMap } from '@Ai/utils/llmDeploymentNames'
import { fetchLlmInstanceNameMap } from '@Ai/utils/llmInstanceNames'

export default {
  mixins: [WindowsMixin],
  data () {
    return {
      llmDeploymentNameMap: {},
      llmInstanceNameMap: {},
      llmDeploymentName: '',
      llmInstanceName: '',
    }
  },
  watch: {
    'data.llm_deployment_id' () {
      this.loadAiproxyLlmLinkDetailNames()
    },
    'data.llm_id' () {
      this.loadAiproxyLlmLinkDetailNames()
    },
  },
  mounted () {
    this.loadAiproxyLlmLinkDetailNames()
  },
  methods: {
    async loadAiproxyLlmLinkDetailNames ({ withDeployment = true, withInstance = true } = {}) {
      const scope = this.$store.getters.scope
      const deploymentId = withDeployment ? this.data?.llm_deployment_id : ''
      const llmId = withInstance ? this.data?.llm_id : ''

      if (!deploymentId) {
        this.llmDeploymentName = ''
      }
      if (!llmId) {
        this.llmInstanceName = ''
      }
      if (!deploymentId && !llmId) return

      const tasks = []
      if (deploymentId) {
        tasks.push(fetchLlmDeploymentNameMap([deploymentId], { scope }).then(map => ({ type: 'deployment', map })))
      }
      if (llmId) {
        tasks.push(fetchLlmInstanceNameMap([llmId], { scope }).then(map => ({ type: 'instance', map })))
      }

      const results = await Promise.all(tasks)
      if (this._isDestroyed) return

      results.forEach(({ type, map }) => {
        if (type === 'deployment') {
          this.llmDeploymentNameMap = { ...this.llmDeploymentNameMap, ...map }
          this.llmDeploymentName = map[deploymentId] || ''
        }
        if (type === 'instance') {
          this.llmInstanceNameMap = { ...this.llmInstanceNameMap, ...map }
          this.llmInstanceName = map[llmId] || ''
        }
      })
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
  },
}
