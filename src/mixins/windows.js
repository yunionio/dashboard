import * as R from 'ramda'
import { mapActions } from 'vuex'
import { uuid } from '@/utils/utils'

export default {
  props: {
    assignedId: String,
  },
  data () {
    return {
      windowId: '',
    }
  },
  computed: {
    windowData () {
      return this.$store.getters.windows[this.windowId]
    },
  },
  beforeDestroy () {
    this.destroyDialogs()
  },
  destroyed () {
    this.destroyWindow(this.windowId)
  },
  created () {
    this.createWindow().then(() => {
      this.updateWindow({
        dialogIds: [],
      })
    })
  },
  methods: {
    ...mapActions({
      _createWindow: 'window/create',
      _updateWindow: 'window/update',
      _destroyWindow: 'window/destroy',
      _createDialog: 'dialog/create',
      _updateDialog: 'dialog/update',
      destroyWindow: 'window/destroy',
      destroyDialog: 'dialog/destroy',
      updateCommonObject: 'common/updateObject',
    }),
    createWindow () {
      if (this.assignedId) {
        this.windowId = this.assignedId
      } else {
        this.windowId = `${this.$options.name}-${uuid(32)}`
      }
      if (this.$store.getters.windows[this.windowId]) {
        return Promise.resolve()
      }
      return this._createWindow({
        id: this.windowId,
      })
    },
    updateWindow (payload) {
      return this._updateWindow({ id: this.windowId, ...payload })
    },
    createDialog (name, params) {
      const id = `${name}-${uuid(32)}`
      return this._createDialog({
        id,
        parentWindowId: this.windowId,
        name,
        params,
      }).then(dialogId => {
        const dialogIds = R.clone(this.windowData.dialogIds)
        dialogIds.push(dialogId)
        this.updateWindow({
          dialogIds,
        })
      })
    },
    destroyDialogs () {
      if (this.windowData && this.windowData.dialogIds && this.windowData.dialogIds.length > 0) {
        const tasks = this.windowData.dialogIds.map(id => this.destroyDialog(id))
        tasks.push(this.updateWindow({ dialogIds: [] }))
        return Promise.all(tasks)
      }
      return Promise.resolve()
    },
  },
}
