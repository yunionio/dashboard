import { Manager } from '@/utils/manager'
import { getAiproxySelectParams } from '@Ai/constants/aiproxyResources'
import { isPlaceholderApiKey } from '@Ai/utils/aiproxyEndpoint'

/** Shared virtual key select + secret fetch for aiproxy access panels. */
export default {
  data () {
    return {
      selectedVirtualKeyId: '',
      selectedVirtualKey: '',
      virtualKeyExtraOpts: [],
      virtualKeyLoading: false,
    }
  },
  computed: {
    virtualKeySelectParams () {
      return getAiproxySelectParams(this, 'ai_virtual_keys', { enabled: true, limit: 100 })
    },
    hasConfiguredApiKey () {
      return !!this.selectedVirtualKey && !isPlaceholderApiKey(`Bearer ${this.selectedVirtualKey}`)
    },
    selectedVirtualKeyRef () {
      const name = this.virtualKeyExtraOpts?.[0]?.name
      if (name) return name
      if (this.selectedVirtualKeyId) return this.selectedVirtualKeyId
      return '<virtual-key>'
    },
  },
  methods: {
    async onVirtualKeyChange (id) {
      if (!id) {
        this.selectedVirtualKey = ''
        this.virtualKeyExtraOpts = []
        return
      }
      await this.fetchVirtualKeySecret(id)
    },
    async fetchVirtualKeySecret (id) {
      if (!id) {
        this.selectedVirtualKey = ''
        return
      }
      this.virtualKeyLoading = true
      try {
        const manager = new Manager('ai_virtual_keys')
        const { data } = await manager.get({
          id,
          params: getAiproxySelectParams(this, 'ai_virtual_keys'),
        })
        this.selectedVirtualKey = data?.virtual_key || ''
        if (data?.id && data?.name) {
          this.virtualKeyExtraOpts = [{
            id: data.id,
            name: data.name,
          }]
        }
      } catch (e) {
        this.selectedVirtualKey = ''
      } finally {
        this.virtualKeyLoading = false
      }
    },
  },
}
