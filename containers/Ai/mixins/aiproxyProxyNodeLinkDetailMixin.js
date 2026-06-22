import WindowsMixin from '@/mixins/windows'

export default {
  mixins: [WindowsMixin],
  methods: {
    handleOpenAiProxyNodeSidepage (nodeId) {
      if (!nodeId) return
      this.sidePageTriggerHandle(this, 'AiProxyNodeSidePage', {
        id: nodeId,
        resource: 'ai_proxy_nodes',
        getParams: () => ({
          scope: this.$store.getters.scope,
          details: true,
        }),
      })
    },
  },
}
