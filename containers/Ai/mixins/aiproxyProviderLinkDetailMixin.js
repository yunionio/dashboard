import WindowsMixin from '@/mixins/windows'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { fetchAiProviderMetaMap } from '@Ai/utils/aiProviderNames'

export default {
  mixins: [WindowsMixin],
  data () {
    return {
      aiProviderNameMap: {},
      aiProviderKeyMap: {},
      aiProviderDetailName: '',
      aiProviderDetailKey: '',
    }
  },
  watch: {
    'data.ai_provider_id' () {
      this.loadAiProviderLinkDetailMeta()
    },
  },
  mounted () {
    this.loadAiProviderLinkDetailMeta()
  },
  methods: {
    async loadAiProviderLinkDetailMeta () {
      const providerId = String(this.data?.ai_provider_id || '').trim()
      if (!providerId) {
        this.aiProviderDetailName = ''
        this.aiProviderDetailKey = ''
        return
      }

      const metaMap = await fetchAiProviderMetaMap([providerId], { vm: this })
      if (this._isDestroyed) return

      const meta = metaMap[providerId] || {}
      const name = meta.name || this.data?.ai_provider_name || providerId
      const providerKey = meta.provider_key || ''

      this.aiProviderNameMap = { ...this.aiProviderNameMap, [providerId]: name }
      if (providerKey) {
        this.aiProviderKeyMap = { ...this.aiProviderKeyMap, [providerId]: providerKey }
      }
      this.aiProviderDetailName = name
      this.aiProviderDetailKey = providerKey
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
  },
}
