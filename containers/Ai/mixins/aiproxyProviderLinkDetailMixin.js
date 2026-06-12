import WindowsMixin from '@/mixins/windows'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'

export default {
  mixins: [WindowsMixin],
  data () {
    return {
      aiProviderNameMap: {},
    }
  },
  methods: {
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
  },
}
