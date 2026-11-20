import { SHOW_SWITCH_VERSION } from '@/config/switchVersion'

const EDITION_SWITCH_POLL_MS = 5000
const ACTIVE_EDITION_SWITCH_STATUSES = ['init', 'running']
const EDITION_SWITCH_POLL_IGNORE_HTTP = [502, 503, 504]
const EDITION_SWITCH_POLL_HTTP_PARAMS = { ignoreErrorStatusCode: EDITION_SWITCH_POLL_IGNORE_HTTP }

export default {
  data () {
    return {
      activeEditionSwitch: null,
      editionStatusPollTimer: null,
    }
  },
  computed: {
    switchEditionDialogOpen () {
      const dialogs = this.$store.getters.dialogs || {}
      return Object.values(dialogs).some(item => item && item.name === 'SwitchEditionDialog')
    },
    editionSwitchInProgress () {
      return !!this.activeEditionSwitch
    },
    editionSwitchProgressLabel () {
      if (!this.activeEditionSwitch) return ''
      const edition = this.activeEditionSwitch.edition
      return edition === 'ce/support'
        ? this.$t('scope.edition_switch.status_running_upgrade')
        : this.$t('scope.edition_switch.status_running_downgrade')
    },
    editionSwitchPollEnabled () {
      if (!SHOW_SWITCH_VERSION) return false
      if (typeof this.canSwitch === 'boolean' && this.canSwitch) return true
      if (typeof this.canEditionSwitch === 'boolean' && this.canEditionSwitch) return true
      return false
    },
  },
  watch: {
    editionSwitchPollEnabled (enabled) {
      if (!enabled) {
        this.activeEditionSwitch = null
        this.stopEditionStatusPoll()
        return
      }
      this.refreshActiveEditionSwitch()
    },
  },
  mounted () {
    if (SHOW_SWITCH_VERSION) {
      this.refreshActiveEditionSwitch()
    }
  },
  beforeDestroy () {
    this.stopEditionStatusPoll()
  },
  methods: {
    stopEditionStatusPoll () {
      if (this.editionStatusPollTimer) {
        clearTimeout(this.editionStatusPollTimer)
        this.editionStatusPollTimer = null
      }
    },
    scheduleEditionStatusPoll () {
      if (!SHOW_SWITCH_VERSION) return
      this.stopEditionStatusPoll()
      if (!this.editionSwitchInProgress || this.switchEditionDialogOpen) return
      this.editionStatusPollTimer = setTimeout(() => {
        this.refreshActiveEditionSwitch()
      }, EDITION_SWITCH_POLL_MS)
    },
    normalizeEditionSwitchRecord (item) {
      if (!item) return null
      const id = item.id || item.Id
      if (!id) return null
      return {
        id,
        edition: item.edition || item.Edition,
        status: (item.status || item.Status || '').toLowerCase(),
      }
    },
    isActiveEditionSwitchStatus (status) {
      return ACTIVE_EDITION_SWITCH_STATUSES.includes((status || '').toLowerCase())
    },
    async discoverActiveEditionSwitch () {
      if (!SHOW_SWITCH_VERSION) return { record: null, rows: [] }
      const ret = await new this.$Manager('editionswitches').list({
        params: {
          limit: 5,
          order_by: 'created_at',
          order: 'desc',
          ...EDITION_SWITCH_POLL_HTTP_PARAMS,
        },
      })
      const body = ret.data || {}
      const rows = body.data || body.editionswitches || []
      const active = rows.find(item => this.isActiveEditionSwitchStatus(item.status || item.Status))
      return {
        record: this.normalizeEditionSwitchRecord(active),
        rows,
      }
    },
    async fetchEditionSwitchById (id) {
      if (!SHOW_SWITCH_VERSION) return null
      const ret = await new this.$Manager('editionswitches').get({
        id,
        params: { ...EDITION_SWITCH_POLL_HTTP_PARAMS },
      })
      return this.normalizeEditionSwitchRecord(ret.data)
    },
    async refreshActiveEditionSwitch () {
      if (!SHOW_SWITCH_VERSION) {
        this.activeEditionSwitch = null
        this.stopEditionStatusPoll()
        return
      }
      if (!this.editionSwitchPollEnabled) {
        this.activeEditionSwitch = null
        this.stopEditionStatusPoll()
        return
      }
      const wasActive = !!this.activeEditionSwitch
      const trackedId = this.activeEditionSwitch && this.activeEditionSwitch.id
      let record = null
      let listRows = null
      try {
        if (trackedId) {
          record = await this.fetchEditionSwitchById(trackedId)
        } else {
          const discovered = await this.discoverActiveEditionSwitch()
          record = discovered.record
          listRows = discovered.rows
        }
        if (record && this.isActiveEditionSwitchStatus(record.status)) {
          this.activeEditionSwitch = record
          this.scheduleEditionStatusPoll()
          return
        }
        const finishedRecord = record ||
          (listRows && listRows.length ? this.normalizeEditionSwitchRecord(listRows[0]) : null)
        this.activeEditionSwitch = null
        this.stopEditionStatusPoll()
        if (wasActive && !this.switchEditionDialogOpen && finishedRecord) {
          await this.handleEditionSwitchFinished(finishedRecord)
        }
      } catch (error) {
        if (this.activeEditionSwitch && !this.switchEditionDialogOpen) {
          this.scheduleEditionStatusPoll()
        }
      }
    },
    async handleEditionSwitchFinished (record) {
      if (!record || typeof this.fetchCurrentEdition !== 'function') return
      const status = record.status
      const targetEdition = record.edition
      await this.fetchCurrentEdition()
      if (status !== 'succeeded' || !targetEdition) return
      if (this.currentEdition !== targetEdition) return
      const isUpgrade = targetEdition === 'ce/support'
      this.$message.success(this.$t(isUpgrade
        ? 'scope.edition_switch.complete_refresh_upgrade'
        : 'scope.edition_switch.complete_refresh_downgrade'))
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    },
    handleEditionSwitchStarted (record) {
      if (!SHOW_SWITCH_VERSION) return
      const normalized = this.normalizeEditionSwitchRecord(record)
      if (!normalized) {
        this.refreshActiveEditionSwitch()
        return
      }
      this.activeEditionSwitch = {
        ...normalized,
        status: this.isActiveEditionSwitchStatus(normalized.status) ? normalized.status : 'running',
      }
      if (!this.switchEditionDialogOpen) {
        this.scheduleEditionStatusPoll()
      }
    },
    openSwitchEditionDialog ({ switchRoute = 'upgrade' } = {}) {
      if (!SHOW_SWITCH_VERSION) return
      this.stopEditionStatusPoll()
      const params = {
        onClosed: () => {
          if (typeof this.fetchCurrentEdition === 'function') {
            this.fetchCurrentEdition()
          }
          this.refreshActiveEditionSwitch()
        },
        onSwitchStarted: (record) => {
          this.handleEditionSwitchStarted(record)
        },
      }
      if (this.activeEditionSwitch) {
        params.initialLogRecord = { ...this.activeEditionSwitch }
      }
      this.createDialog('SwitchEditionDialog', {
        switchRoute,
        ...params,
      })
    },
  },
}