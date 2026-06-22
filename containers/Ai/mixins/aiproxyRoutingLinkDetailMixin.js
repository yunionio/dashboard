import WindowsMixin from '@/mixins/windows'
import { fetchAiRoutingNameMap } from '@Ai/utils/aiRoutingNames'
import { openAiRoutingSidepage } from '@Ai/utils/aiproxyRoutingLinkColumns'

export default {
  mixins: [WindowsMixin],
  data () {
    return {
      aiRoutingNameMap: {},
      aiRoutingName: '',
    }
  },
  watch: {
    'data.aiproxy_routing_id' () {
      this.loadAiRoutingDetailName()
    },
  },
  mounted () {
    this.loadAiRoutingDetailName()
  },
  methods: {
    async loadAiRoutingDetailName () {
      const routingId = this.data?.aiproxy_routing_id
      if (!routingId) {
        this.aiRoutingName = ''
        return
      }
      const map = await fetchAiRoutingNameMap([routingId], { vm: this })
      if (this._isDestroyed) return
      this.aiRoutingNameMap = { ...this.aiRoutingNameMap, ...map }
      this.aiRoutingName = map[routingId] || ''
    },
    handleOpenAiRoutingSidepage (routingId) {
      openAiRoutingSidepage(this, routingId)
    },
  },
}
