/**
 * Window mixin
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2018/08/07
 */
import * as R from 'ramda'
import { mapActions } from 'vuex'
import { uuid } from '@/utils/utils'
import i18n from '@/locales'

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
    this.destroySidePages()
  },
  destroyed () {
    this.destroyWindow(this.windowId)
  },
  created () {
    this.createWindow().then(() => {
      this.updateWindow({
        dialogIds: [],
        sidePageIds: [],
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
      _createSidePage: 'sidePage/create',
      _updateSidePage: 'sidePage/update',
      destroyWindow: 'window/destroy',
      destroyDialog: 'dialog/destroy',
      destroySidePage: 'sidePage/destroy',
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
    createDialog (name, params = {}) {
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
    createSidePage (name, params) {
      const id = `${name}-${uuid(32)}`
      return this._createSidePage({
        id,
        parentWindowId: this.windowId,
        name,
        params,
      }).then(sidePageId => {
        const sidePageIds = R.clone(this.windowData.sidePageIds)
        sidePageIds.push(sidePageId)
        this.updateWindow({
          sidePageIds,
        })
      })
    },
    destroySidePages () {
      if (this.windowData && this.windowData.sidePageIds && this.windowData.sidePageIds.length > 0) {
        const tasks = this.windowData.sidePageIds.map(id => this.destroySidePage(id))
        tasks.push(this.updateWindow({ sidePageIds: [] }))
        return Promise.all(tasks)
      }
      return Promise.resolve()
    },
    // ?????????????????????????????????????????????????????????????????????
    sidePageTriggerHandle (templateContext, sidepageName, options, params = {}) {
      if (!sidepageName) {
        throw Error(i18n.t('common_79'))
      }
      this.replaceSidePage(sidepageName, {
        templateContext,
        windowData: this.windowData,
        options,
        ...params,
      })
    },
    async replaceSidePage (name, params) {
      await this.destroySidePages()
      return this.createSidePage(name, params)
    },
    initSidePageTab (tab) {
      this.updateWindow({
        _currentTab: tab,
        currentTab: tab,
      })
    },
  },
}
