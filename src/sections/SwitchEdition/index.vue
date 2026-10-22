<template>
  <div v-if="canSwitch" class="edition-switch-bar">
    <div>
      <div class="edition-switch-bar__title">{{ $t('scope.edition_switch.title') }}</div>
      <div>
        <span class="text-color-help">{{ $t('scope.edition_switch.current') }}</span>
        <a-tag class="ml-2">{{ editionLabel(currentEdition) }}</a-tag>
      </div>
    </div>
    <a-button type="primary" @click="open">{{ $t('scope.edition_switch.action') }}</a-button>
    <a-modal
      :title="$t('scope.edition_switch.title')"
      :visible="visible"
      :mask-closable="false"
      :confirm-loading="submitting"
      :ok-text="$t('scope.edition_switch.confirm')"
      :ok-button-props="{ props: { disabled: !canSubmit } }"
      width="640px"
      @ok="submit"
      @cancel="close">
      <a-spin :spinning="detecting">
        <div class="mb-3">
          <span class="text-color-help">{{ $t('scope.edition_switch.current') }}</span>
          <span class="ml-2">{{ editionLabel(currentEdition) }}</span>
        </div>
        <a-alert v-if="probe.sshable" type="success" show-icon class="mb-3" :message="$t('scope.edition_switch.sshable', [probe.host])" />
        <template v-else-if="!detecting">
          <a-alert type="warning" show-icon class="mb-3" :message="$t('scope.edition_switch.not_sshable')" />
          <div class="mb-2">{{ $t('scope.edition_switch.host') }}{{ probe.host || '-' }}</div>
          <div class="mb-2" v-if="probe.reason">{{ $t('scope.edition_switch.reason') }}{{ probe.reason }}</div>
          <pre v-if="probe.shell_cmd" class="shell-cmd">{{ probe.shell_cmd }}</pre>
          <div>
            <a-button size="small" class="mr-2" :disabled="!probe.shell_cmd" @click="copyScript">{{ $t('scope.edition_switch.copy') }}</a-button>
            <a-button size="small" @click="detect">{{ $t('scope.edition_switch.redetect') }}</a-button>
          </div>
        </template>
        <template v-if="probe.sshable">
          <div class="mb-3">
            <span class="text-color-help">{{ $t('scope.edition_switch.target') }}</span>
            <a-select v-model="edition" class="ml-2" style="width: 240px">
              <a-select-option value="ce">{{ $t('scope.edition_switch.ce') }}</a-select-option>
              <a-select-option value="ce/support">{{ $t('scope.edition_switch.ce_support') }}</a-select-option>
            </a-select>
          </div>
          <a-alert type="info" show-icon :message="warningText" />
          <div v-if="running" class="mt-3">
            <a-icon type="loading" class="mr-1" />
            {{ $t('scope.edition_switch.running') }}
            <a class="ml-2" v-if="recordId" @click="openLog({ id: recordId, status: 'running' })">{{ $t('scope.edition_switch.view_log') }}</a>
          </div>
          <div v-if="failReason" class="mt-3 error-color">
            {{ $t('scope.edition_switch.failed') }}{{ failReason }}
            <a class="ml-2" v-if="recordId" @click="openLog({ id: recordId, status: 'failed' })">{{ $t('scope.edition_switch.view_log') }}</a>
          </div>
        </template>
        <div v-if="history.length" class="mt-3">
          <div class="text-color-help mb-2">{{ $t('scope.edition_switch.history') }}</div>
          <div v-for="item in history" :key="item.id" class="history-row">
            <span>{{ editionLabel(item.edition) }}</span>
            <a-tag class="ml-2" :color="statusColor(item.status)">{{ statusLabel(item.status) }}</a-tag>
            <span class="ml-2 text-color-help">{{ formatTime(item.created_at) }}</span>
            <a class="ml-2" @click="openLog(item)">{{ $t('scope.edition_switch.view_log') }}</a>
          </div>
        </div>
      </a-spin>
    </a-modal>
    <a-modal
      :title="$t('scope.edition_switch.log_title')"
      :visible="logVisible"
      :footer="null"
      width="860px"
      @cancel="closeLog">
      <div class="mb-2">
        <a-icon v-if="logRefreshing" type="loading" class="mr-1" />
        <span v-if="logRefreshing">{{ $t('scope.edition_switch.log_running') }}</span>
        <a-button size="small" class="ml-2" :disabled="!logOutput" @click="copyLog">{{ $t('scope.edition_switch.copy_log') }}</a-button>
      </div>
      <pre ref="logPre" class="ansible-log">{{ logOutput || $t('scope.edition_switch.log_empty') }}</pre>
    </a-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import http from '@/utils/http'
import { hasPermission, hasServices } from '@/utils/auth'

const POLL_MS = 5000
const LOG_RUNNING = ['init', 'running']

// #region agent log
function debugLog (hypothesisId, location, message, data) {
  fetch('http://127.0.0.1:7352/ingest/c030c54a-d880-4012-ab89-11f0847c0c96', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cbc2e9' }, body: JSON.stringify({ sessionId: 'cbc2e9', hypothesisId, location, message, data, timestamp: Date.now() }) }).catch(() => {})
}
// #endregion

export default {
  name: 'SwitchEdition',
  data () {
    return {
      visible: false,
      detecting: false,
      submitting: false,
      running: false,
      currentEdition: '',
      edition: undefined,
      failReason: '',
      recordId: '',
      history: [],
      logVisible: false,
      logRecordId: '',
      logRecordStatus: '',
      logOutput: '',
      logStatus: '',
      logTimer: null,
      probe: {
        host: '',
        sshable: false,
        reason: '',
        shell_cmd: '',
      },
      pollTimer: null,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    canSwitch () {
      return this.isAdminMode && hasServices('devtool') && hasPermission({ key: 'editionswitches_perform_switch' })
    },
    canSubmit () {
      return this.probe.sshable && !!this.edition && this.edition !== this.currentEdition && !this.submitting && !this.running && !this.detecting
    },
    logRefreshing () {
      if (LOG_RUNNING.includes(this.logStatus)) return true
      return !this.logStatus && this.logRecordStatus === 'running'
    },
    warningText () {
      let text = this.$t('scope.edition_switch.warning')
      if (this.edition === 'ce') {
        text += ' ' + this.$t('scope.edition_switch.warning_ce')
      } else if (this.edition === 'ce/support') {
        text += ' ' + this.$t('scope.edition_switch.warning_ce_support')
      }
      return text
    },
  },
  mounted () {
    if (this.canSwitch) this.fetchCurrent()
  },
  beforeDestroy () {
    this.stopPoll()
    this.stopLogPoll()
  },
  methods: {
    editionLabel (edition) {
      if (edition === 'ce') return this.$t('scope.edition_switch.ce')
      if (edition === 'ce/support') return this.$t('scope.edition_switch.ce_support')
      return edition || this.$t('scope.edition_switch.unknown')
    },
    open () {
      this.visible = true
      if (!this.pollTimer) {
        this.edition = undefined
        this.failReason = ''
        this.running = false
      }
      this.fetchCurrent()
      this.detect()
      this.fetchHistory()
    },
    close () {
      this.visible = false
    },
    async fetchCurrent () {
      try {
        const ret = await http.get('/v1/infos/info')
        this.currentEdition = (ret.data && ret.data.edition) || ''
      } catch (error) {
        this.currentEdition = ''
      }
    },
    async detect () {
      this.detecting = true
      this.probe = { host: '', sshable: false, reason: '', shell_cmd: '' }
      try {
        const ret = await new this.$Manager('editionswitches').get({ id: 'sshable' })
        const data = ret.data || {}
        this.probe = {
          host: data.host || '',
          sshable: !!data.sshable,
          reason: data.reason || '',
          shell_cmd: data.shell_cmd || '',
        }
      } catch (error) {
        this.probe.reason = this.errorText(error)
      } finally {
        this.detecting = false
      }
    },
    copyScript () {
      this.$copyText(this.probe.shell_cmd).then(() => {
        this.$message.success(this.$t('scope.edition_switch.copied'))
      }).catch(() => {
        this.$message.error(this.$t('scope.edition_switch.copy_failed'))
      })
    },
    async submit () {
      // #region agent log
      debugLog('A', 'SwitchEdition/index.vue:submit', 'switch clicked', { canSubmit: this.canSubmit, edition: this.edition, currentEdition: this.currentEdition, sshable: this.probe.sshable, host: this.probe.host || '' })
      // #endregion
      if (!this.canSubmit) return
      this.submitting = true
      this.failReason = ''
      try {
        const ret = await new this.$Manager('editionswitches').performClassAction({
          action: 'switch',
          data: { edition: this.edition },
        })
        const id = ret.data && (ret.data.id || ret.data.Id)
        // #region agent log
        debugLog('B', 'SwitchEdition/index.vue:submit', 'switch response', { id: id || '', keys: ret.data ? Object.keys(ret.data) : [] })
        // #endregion
        if (!id) {
          throw new Error(this.$t('scope.edition_switch.failed'))
        }
        this.recordId = id
        this.running = true
        this.poll(id)
        this.fetchHistory()
      } catch (error) {
        this.failReason = this.errorText(error)
        // #region agent log
        debugLog('B', 'SwitchEdition/index.vue:submit', 'switch request failed', { failReason: this.failReason, status: error && error.response && error.response.status })
        // #endregion
        this.$message.error(this.failReason)
      } finally {
        this.submitting = false
      }
    },
    poll (id) {
      this.stopPoll()
      const tick = async () => {
        try {
          const ret = await new this.$Manager('editionswitches').get({ id })
          const status = ((ret.data && (ret.data.status || ret.data.Status)) || '').toLowerCase()
          const reason = (ret.data && (ret.data.reason || ret.data.Reason)) || ''
          const instanceId = (ret.data && (ret.data.ansible_playbook_instance_id || ret.data.ansiblePlaybookInstanceId)) || ''
          // #region agent log
          debugLog(status === 'running' || status === '' ? 'D' : 'C', 'SwitchEdition/index.vue:poll', 'poll record', { id, status, reason: String(reason).slice(0, 500), host: (ret.data && (ret.data.host || ret.data.Host)) || '', instanceId })
          // #endregion
          if ((status === 'succeeded' || status === 'failed') && instanceId) {
            // #region agent log
            new this.$Manager('ansibleplaybookinstances').get({ id: instanceId }).then(ans => {
              const body = ans.data || {}
              const output = body.output || ''
              debugLog('F', 'SwitchEdition/index.vue:poll', 'ansible instance output', { instanceId, status: body.status || '', outputLength: output.length, outputHead: output.slice(0, 800), outputTail: output.slice(-800) })
            }).catch(error => {
              debugLog('F', 'SwitchEdition/index.vue:poll', 'ansible instance fetch failed', { instanceId, error: this.errorText(error), httpStatus: error && error.response && error.response.status })
            })
            // #endregion
          }
          if (status === 'succeeded' || status === 'failed') {
            this.running = false
            this.stopPoll()
            this.fetchHistory()
            if (this.logRecordId === id) this.logRecordStatus = status
            if (status === 'succeeded') {
              this.$message.success(this.$t('scope.edition_switch.success'))
              await new Promise(resolve => setTimeout(resolve, 2000))
              try {
                await this.$store.dispatch('auth/logout')
              } catch (error) {
                this.$store.commit('auth/LOGOUT')
                this.$store.commit('auth/RESET_COOKIE')
              }
              window.location.assign('/auth/login')
            } else {
              this.failReason = (ret.data && ret.data.reason) || ''
              this.$message.error(this.failReason || this.$t('scope.edition_switch.failed'))
            }
            return
          }
        } catch (error) {
          this.failReason = this.errorText(error)
        }
        this.pollTimer = setTimeout(tick, POLL_MS)
      }
      this.pollTimer = setTimeout(tick, POLL_MS)
    },
    stopPoll () {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
    },
    async fetchHistory () {
      try {
        const ret = await new this.$Manager('editionswitches').list({
          params: { limit: 5, order_by: 'created_at', order: 'desc' },
        })
        const body = ret.data || {}
        const rows = body.data || body.editionswitches || []
        this.history = rows.map(item => ({
          id: item.id || item.Id,
          edition: item.edition || item.Edition,
          status: (item.status || item.Status || '').toLowerCase(),
          created_at: item.created_at || item.CreatedAt,
        }))
      } catch (error) {
        this.history = []
      }
    },
    statusLabel (status) {
      const key = `scope.edition_switch.status_${(status || '').toLowerCase()}`
      const text = this.$t(key)
      return text === key ? (status || '-') : text
    },
    statusColor (status) {
      if (status === 'succeeded') return 'green'
      if (status === 'failed') return 'red'
      if (status === 'running') return 'blue'
      return ''
    },
    formatTime (value) {
      if (!value) return ''
      if (this.$moment) return this.$moment(value).format('YYYY-MM-DD HH:mm:ss')
      return value
    },
    openLog (record) {
      this.logVisible = true
      this.logRecordId = record.id
      this.logRecordStatus = (record.status || '').toLowerCase()
      this.logOutput = ''
      this.logStatus = ''
      this.fetchLog()
    },
    closeLog () {
      this.logVisible = false
      this.stopLogPoll()
    },
    async fetchLog () {
      if (!this.logVisible || !this.logRecordId) return
      try {
        const ret = await new this.$Manager('editionswitches').getSpecific({
          id: this.logRecordId,
          spec: 'ansible-log',
        })
        const data = ret.data || {}
        this.logStatus = (data.status || '').toLowerCase()
        this.logOutput = data.output || ''
        // #region agent log
        debugLog('E', 'SwitchEdition/index.vue:fetchLog', 'ocboot log response', { id: this.logRecordId, status: this.logStatus, outputLength: this.logOutput.length, outputHead: this.logOutput.slice(0, 300) })
        // #endregion
      } catch (error) {
        const text = this.errorText(error)
        // #region agent log
        debugLog('E', 'SwitchEdition/index.vue:fetchLog', 'ocboot log request failed', { id: this.logRecordId, error: text, httpStatus: error && error.response && error.response.status })
        // #endregion
        if (!this.logOutput) this.logOutput = text || this.$t('scope.edition_switch.log_load_failed')
      }
      this.$nextTick(() => {
        const el = this.$refs.logPre
        if (el) el.scrollTop = el.scrollHeight
      })
      this.scheduleLogPoll()
    },
    scheduleLogPoll () {
      this.stopLogPoll()
      if (this.logVisible && this.logRefreshing) {
        this.logTimer = setTimeout(() => { this.fetchLog() }, POLL_MS)
      }
    },
    stopLogPoll () {
      if (this.logTimer) {
        clearTimeout(this.logTimer)
        this.logTimer = null
      }
    },
    copyLog () {
      this.$copyText(this.logOutput).then(() => {
        this.$message.success(this.$t('scope.edition_switch.copied'))
      }).catch(() => {
        this.$message.error(this.$t('scope.edition_switch.copy_failed'))
      })
    },
    errorText (error) {
      const data = error && error.response && error.response.data
      if (data && (data.details || data.class)) return data.details || data.class
      return (error && error.message) || this.$t('scope.edition_switch.failed')
    },
  },
}
</script>

<style scoped>
.edition-switch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding: 16px 20px;
  border-radius: 8px;
  background: #f7f8fa;
}
.edition-switch-bar__title {
  margin-bottom: 4px;
  font-weight: 500;
}
.shell-cmd {
  max-height: 180px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
.history-row {
  line-height: 28px;
}
.ansible-log {
  max-height: 460px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 0;
}
</style>
