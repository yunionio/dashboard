import { mapGetters } from 'vuex'
import { uuid } from '@/utils/utils'

export default {
  data () {
    return {
      windowId: '',
    }
  },
  computed: {
    ...mapGetters(['windows', 'common']),
    windowData () {
      return this.windows[this.windowId]
    },
  },
  beforeDestroy () {
    this.destroyWindow(this.windowId)
  },
  created () {
    this.createWindow()
  },
  methods: {
    createWindow () {
      this.windowId = `${this.$options.name}-${uuid(32)}`
      if (this.$store.getters.windows[this.windowId]) {
        return Promise.resolve()
      }
      return this.$store.dispatch('window/create', {
        id: this.windowId,
      })
    },
    updateWindow (payload) {
      return this.$store.dispatch('window/update', { id: this.windowId, ...payload })
    },
    destroyWindow (id) {
      this.$store.dispatch('window/destroy', id)
    },
    updateDbObject (payload) {
      return this.$store.dispatch('common/updateObject', payload)
    },
  },
}
