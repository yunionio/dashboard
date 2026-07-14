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
      visualProviderDetailName: '',
      visualProviderDetailKey: '',
    }
  },
  watch: {
    'data.ai_provider_id' () {
      this.loadAiProviderLinkDetailMeta()
    },
    'data.visual_provider_id' () {
      this.loadAiProviderLinkDetailMeta()
    },
  },
  mounted () {
    this.loadAiProviderLinkDetailMeta()
  },
  methods: {
    async loadAiProviderLinkDetailMeta () {
      const providerId = String(this.data?.ai_provider_id || '').trim()
      const visualProviderId = String(this.data?.visual_provider_id || '').trim()
      const ids = [...new Set([providerId, visualProviderId].filter(Boolean))]
      if (!ids.length) {
        this.aiProviderDetailName = ''
        this.aiProviderDetailKey = ''
        this.visualProviderDetailName = ''
        this.visualProviderDetailKey = ''
        return
      }

      const metaMap = await fetchAiProviderMetaMap(ids, { vm: this })
      if (this._isDestroyed) return

      if (providerId) {
        const meta = metaMap[providerId] || {}
        const name = meta.name || this.data?.ai_provider_name || providerId
        const providerKey = meta.provider_key || ''
        this.aiProviderNameMap = { ...this.aiProviderNameMap, [providerId]: name }
        if (providerKey) {
          this.aiProviderKeyMap = { ...this.aiProviderKeyMap, [providerId]: providerKey }
        }
        this.aiProviderDetailName = name
        this.aiProviderDetailKey = providerKey
      } else {
        this.aiProviderDetailName = ''
        this.aiProviderDetailKey = ''
      }

      if (visualProviderId) {
        const vmeta = metaMap[visualProviderId] || {}
        const vname = vmeta.name || this.data?.visual_provider_name || visualProviderId
        const vkey = vmeta.provider_key || this.data?.visual_provider_key || ''
        this.aiProviderNameMap = { ...this.aiProviderNameMap, [visualProviderId]: vname }
        if (vkey) {
          this.aiProviderKeyMap = { ...this.aiProviderKeyMap, [visualProviderId]: vkey }
        }
        this.visualProviderDetailName = vname
        this.visualProviderDetailKey = vkey
      } else {
        this.visualProviderDetailName = ''
        this.visualProviderDetailKey = ''
      }
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
