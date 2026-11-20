<template>
  <base-dialog :drag="false" @cancel="cancelDialog">
    <div slot="header">{{ dialogTitle }}</div>
    <div slot="body" class="edition-switch-dialog">
      <a-spin :spinning="detecting">
        <div v-if="!detecting || probe.host || probe.reason || probe.shell_cmd" class="edition-switch-probe">
          <a-alert
            v-if="probe.sshable"
            type="success"
            show-icon
            :message="$t('scope.edition_switch.sshable', [probe.host])" />
          <template v-else-if="!detecting">
            <a-alert type="warning" show-icon :message="$t('scope.edition_switch.not_sshable')" />
            <div class="edition-switch-probe-meta mt-2">
              <div class="edition-switch-probe-meta__row">
                <span class="edition-switch-probe-meta__label text-color-help">{{ $t('scope.edition_switch.host') }}</span>
                <span class="edition-switch-probe-meta__value">{{ probe.host || '-' }}</span>
              </div>
              <div v-if="probe.reason" class="edition-switch-probe-meta__row mt-1">
                <span class="edition-switch-probe-meta__label text-color-help">{{ $t('scope.edition_switch.reason') }}</span>
                <span class="edition-switch-probe-meta__value">{{ probe.reason }}</span>
              </div>
            </div>
            <pre v-if="probe.shell_cmd" class="shell-cmd mt-2">{{ probe.shell_cmd }}</pre>
            <div class="edition-switch-probe__actions mt-2">
              <a-button v-if="probe.shell_cmd" size="small" class="mr-2" @click="copyScript">{{ $t('scope.edition_switch.copy') }}</a-button>
              <a-button type="primary" size="small" @click="detect">{{ $t('scope.edition_switch.redetect') }}</a-button>
            </div>
          </template>
        </div>
        <a-form v-if="probe.sshable" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" class="edition-switch-form">
          <a-form-item :label="$t('scope.edition_switch.current')" class="mb-0">
            <a-tag class="edition-switch-tag" :color="editionTagColor(normalizedCurrentEdition)">
              {{ editionLabel(normalizedCurrentEdition) }}
            </a-tag>
          </a-form-item>
          <a-form-item :label="$t('scope.edition_switch.target')" :extra="targetWarningExtra" class="mb-0">
            <a-tag class="edition-switch-tag" :color="editionTagColor(targetEdition)">
              {{ editionLabel(targetEdition) }}
            </a-tag>
          </a-form-item>
          <div v-if="failReason" class="edition-switch-status mt-2">
            <div class="error-color">
              {{ failedProgressText }}{{ failReason }}
              <a
                v-if="recordId"
                class="ml-2"
                @click="openLog({ id: recordId, status: 'failed', edition: lastOperationEdition })">{{ $t('scope.edition_switch.view_log') }}</a>
            </div>
          </div>
        </a-form>
        <div v-if="history.length" class="edition-switch-history">
          <div class="text-color-help mb-2">{{ $t('scope.edition_switch.history') }}</div>
          <div class="edition-switch-history-list">
            <div
              v-for="item in history"
              :key="item.id"
              class="edition-switch-history-row">
              <div class="edition-switch-history-row__main">
                <span class="edition-switch-history-edition">
                  <span
                    class="edition-switch-history-action"
                    :class="isUpgradeEdition(item.edition) ? 'success-color' : 'error-color'">{{ historyActionLabel(item.edition) }}</span>
                  <span class="edition-switch-history-edition-name">{{ editionLabel(item.edition) }}</span>
                </span>
                <span class="edition-switch-history-status-cell">
                  <span
                    v-if="isActiveSwitchStatus(item.status)"
                    class="edition-switch-history-status edition-switch-history-status--running text-color-help">
                    <a-icon type="loading" class="edition-switch-history-status__spin" />
                    {{ statusLabel(item.status, item.edition) }}
                  </span>
                  <a-tag
                    v-else
                    class="edition-switch-history-status"
                    :color="statusColor(item.status)">
                    {{ statusLabel(item.status, item.edition) }}
                  </a-tag>
                </span>
                <span class="edition-switch-history-time text-color-help">{{ formatTime(item.created_at) }}</span>
              </div>
              <a
                class="edition-switch-history-row__action"
                :class="{ 'primary-color': logRecordId === item.id }"
                @click="openLog(item)">{{ $t('scope.edition_switch.view_log') }}</a>
            </div>
          </div>
        </div>
        <div v-if="logRecordId" class="edition-switch-log">
          <div class="edition-switch-log-toolbar mb-2">
            <div class="edition-switch-log-toolbar__left">
              <span class="edition-switch-log__title">{{ $t('scope.edition_switch.log_title') }}</span>
              <template v-if="logRefreshing">
                <a-icon type="loading" class="edition-switch-log-toolbar__loading" />
                <span class="text-color-help">{{ logRunningText }}</span>
              </template>
            </div>
            <div class="edition-switch-log-toolbar__actions">
              <a-button size="small" :disabled="!logOutput" @click="copyLog">{{ $t('scope.edition_switch.copy_log') }}</a-button>
              <a-button size="small" @click="closeLog">{{ $t('scope.edition_switch.close_log') }}</a-button>
            </div>
          </div>
          <pre ref="logPre" class="ansible-log">{{ logOutput || logEmptyText }}</pre>
        </div>
      </a-spin>
    </div>
    <div slot="footer">
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
      <a-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="submit">
        {{ confirmActionText }}
      </a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { SHOW_SWITCH_VERSION } from '@/config/switchVersion'
import http from '@/utils/http'

const POLL_MS = 5000
const LOG_RUNNING = ['init', 'running']
const ACTIVE_SWITCH_STATUSES = LOG_RUNNING
const EDITION_SWITCH_POLL_IGNORE_HTTP = [502, 503, 504]
const EDITION_SWITCH_POLL_HTTP_PARAMS = { ignoreErrorStatusCode: EDITION_SWITCH_POLL_IGNORE_HTTP }

export default {
  name: 'SwitchEditionDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      localCurrentEdition: '',
      detecting: false,
      submitting: false,
      running: false,
      failReason: '',
      recordId: '',
      history: [],
      pollTimer: null,
      logRecordId: '',
      logRecordStatus: '',
      logOutput: '',
      logStatus: '',
      logTimer: null,
      lastOperationEdition: '',
      logRecordEdition: '',
      pendingSwitchSourceEdition: '',
      pendingSwitchTargetEdition: '',
      probe: {
        host: '',
        sshable: false,
        reason: '',
        shell_cmd: '',
      },
    }
  },
  computed: {
    normalizedCurrentEdition () {
      if (this.localCurrentEdition === 'ce/support') return 'ce/support'
      if (this.localCurrentEdition === 'ce') return 'ce'
      return 'ce'
    },
    switchRoute () {
      const route = this.params && this.params.switchRoute
      if (route === 'upgrade' || route === 'downgrade') return route
      return this.normalizedCurrentEdition === 'ce/support' ? 'downgrade' : 'upgrade'
    },
    targetEdition () {
      return this.isUpgrade ? 'ce/support' : 'ce'
    },
    isUpgrade () {
      return this.switchRoute === 'upgrade'
    },
    dialogTitle () {
      return this.isUpgrade
        ? this.$t('scope.edition_switch.dialog_title_upgrade')
        : this.$t('scope.edition_switch.dialog_title_downgrade')
    },
    confirmActionText () {
      return this.isUpgrade
        ? this.$t('scope.edition_switch.confirm_upgrade')
        : this.$t('scope.edition_switch.confirm_downgrade')
    },
    hasOngoingEditionSwitch () {
      if (this.running) return true
      return this.history.some(item => {
        const status = (item.status || '').toLowerCase()
        return ACTIVE_SWITCH_STATUSES.includes(status) && this.editionSwitchMatchesRoute(item)
      })
    },
    canSubmit () {
      const editionReady = this.isUpgrade
        ? this.normalizedCurrentEdition === 'ce'
        : this.normalizedCurrentEdition === 'ce/support'
      return this.probe.sshable &&
        editionReady &&
        !this.submitting &&
        !this.hasOngoingEditionSwitch &&
        !this.detecting
    },
    targetWarningExtra () {
      let text = this.isUpgrade
        ? this.$t('scope.edition_switch.warning_upgrade')
        : this.$t('scope.edition_switch.warning_downgrade')
      if (this.targetEdition === 'ce') {
        text += ' ' + this.$t('scope.edition_switch.warning_ce')
      } else if (this.targetEdition === 'ce/support') {
        text += ' ' + this.$t('scope.edition_switch.warning_ce_support')
      }
      return text
    },
    logRefreshing () {
      if (LOG_RUNNING.includes(this.logStatus)) return true
      return !this.logStatus && this.logRecordStatus === 'running'
    },
    failedProgressText () {
      return this.isUpgradeEdition(this.lastOperationEdition || this.targetEdition)
        ? this.$t('scope.edition_switch.failed_upgrade')
        : this.$t('scope.edition_switch.failed_downgrade')
    },
    logContextEdition () {
      return this.logRecordEdition || this.lastOperationEdition || this.targetEdition
    },
    logRunningText () {
      return this.isUpgradeEdition(this.logContextEdition)
        ? this.$t('scope.edition_switch.log_running_upgrade')
        : this.$t('scope.edition_switch.log_running_downgrade')
    },
    logEmptyText () {
      return this.isUpgradeEdition(this.logContextEdition)
        ? this.$t('scope.edition_switch.log_empty_upgrade')
        : this.$t('scope.edition_switch.log_empty_downgrade')
    },
  },
  created () {
    if (!SHOW_SWITCH_VERSION) return
    this.refreshCurrentEdition()
    this.detect()
    this.fetchHistory()
  },
  beforeDestroy () {
    this.stopAllSwitchTimers()
    this.closeLog()
  },
  methods: {
    cancelDialog () {
      this.stopAllSwitchTimers()
      this.closeLog()
      if (this.params && typeof this.params.onClosed === 'function') {
        this.params.onClosed()
      }
      DialogMixin.methods.cancelDialog.call(this)
    },
    editionLabel (edition) {
      if (edition === 'ce') return this.$t('scope.edition_switch.ce')
      if (edition === 'ce/support') return this.$t('scope.edition_switch.ce_support')
      return edition || this.$t('scope.edition_switch.unknown')
    },
    editionTagColor (edition) {
      if (edition === 'ce') return 'green'
      if (edition === 'ce/support') return 'blue'
      return ''
    },
    isUpgradeEdition (edition) {
      return edition === 'ce/support'
    },
    editionSwitchMatchesRoute (item) {
      if (!item) return false
      const upgrading = this.isUpgradeEdition(item.edition)
      return this.isUpgrade ? upgrading : !upgrading
    },
    inferSourceEdition (targetEdition) {
      if (targetEdition === 'ce/support') return 'ce'
      if (targetEdition === 'ce') return 'ce/support'
      return ''
    },
    beginPendingEditionSwitch (sourceEdition, targetEdition) {
      this.pendingSwitchSourceEdition = sourceEdition
      this.pendingSwitchTargetEdition = targetEdition
    },
    clearPendingEditionSwitch () {
      this.pendingSwitchSourceEdition = ''
      this.pendingSwitchTargetEdition = ''
    },
    stopAllSwitchTimers () {
      this.stopEditionPoll()
      this.stopLogPoll()
    },
    async checkPendingEditionReached () {
      if (!this.pendingSwitchTargetEdition) return false
      await this.refreshCurrentEdition()
      const current = this.normalizedCurrentEdition
      if (current === this.pendingSwitchTargetEdition && current !== this.pendingSwitchSourceEdition) {
        this.handleEditionSwitchComplete()
        return true
      }
      return false
    },
    handleEditionSwitchComplete () {
      this.stopAllSwitchTimers()
      this.running = false
      const target = this.pendingSwitchTargetEdition || this.lastOperationEdition
      const isUpgrade = this.isUpgradeEdition(target)
      this.clearPendingEditionSwitch()
      this.$message.success(isUpgrade
        ? this.$t('scope.edition_switch.complete_refresh_upgrade')
        : this.$t('scope.edition_switch.complete_refresh_downgrade'))
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    },
    historyActionLabel (edition) {
      return this.isUpgradeEdition(edition)
        ? this.$t('scope.edition_switch.confirm_upgrade')
        : this.$t('scope.edition_switch.confirm_downgrade')
    },
    failedMessage (edition) {
      return this.isUpgradeEdition(edition)
        ? this.$t('scope.edition_switch.failed_upgrade')
        : this.$t('scope.edition_switch.failed_downgrade')
    },
    successMessage (edition) {
      return this.isUpgradeEdition(edition)
        ? this.$t('scope.edition_switch.success_upgrade')
        : this.$t('scope.edition_switch.success_downgrade')
    },
    async refreshCurrentEdition () {
      if (!SHOW_SWITCH_VERSION) return
      try {
        const ret = await http.get('/v1/infos/info', { params: { ...EDITION_SWITCH_POLL_HTTP_PARAMS } })
        const edition = (ret.data && ret.data.edition) || ''
        this.localCurrentEdition = edition
      } catch (error) {
        const status = error && error.response && error.response.status
        this.localCurrentEdition = status === 404 ? 'ce' : ''
      }
    },
    async detect () {
      if (!SHOW_SWITCH_VERSION) return
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
      if (!this.canSubmit) return
      this.submitting = true
      this.failReason = ''
      try {
        const ret = await new this.$Manager('editionswitches').performClassAction({
          action: 'switch',
          data: { edition: this.targetEdition },
        })
        const id = ret.data && (ret.data.id || ret.data.Id)
        if (!id) {
          throw new Error(this.failedMessage(this.targetEdition))
        }
        this.lastOperationEdition = this.targetEdition
        this.beginPendingEditionSwitch(this.normalizedCurrentEdition, this.targetEdition)
        this.recordId = id
        this.running = true
        this.pollEditionSwitch(id)
        this.fetchHistory()
        this.openLog({ id, status: 'running', edition: this.targetEdition })
        if (this.params && typeof this.params.onSwitchStarted === 'function') {
          this.params.onSwitchStarted({
            id,
            edition: this.targetEdition,
            status: 'running',
          })
        }
      } catch (error) {
        this.failReason = this.errorText(error)
        this.$message.error(this.failReason)
      } finally {
        this.submitting = false
      }
    },
    async fetchHistory () {
      if (!SHOW_SWITCH_VERSION) return
      try {
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
        this.history = rows.map(item => ({
          id: item.id || item.Id,
          edition: item.edition || item.Edition,
          status: (item.status || item.Status || '').toLowerCase(),
          created_at: item.created_at || item.CreatedAt,
        }))
        this.resumeOngoingSwitchIfNeeded()
        this.tryOpenInitialLog()
      } catch (error) {
        this.history = []
      }
    },
    tryOpenInitialLog () {
      const record = this.params && this.params.initialLogRecord
      if (!record || !record.id || this.logRecordId) return
      this.openLog(record)
    },
    resumeOngoingSwitchIfNeeded () {
      const active = this.history.find(item => {
        const status = (item.status || '').toLowerCase()
        return ACTIVE_SWITCH_STATUSES.includes(status) && this.editionSwitchMatchesRoute(item)
      })
      if (!active) return
      this.running = true
      this.recordId = active.id
      this.lastOperationEdition = active.edition || ''
      this.failReason = ''
      const targetEdition = active.edition || ''
      const sourceEdition = this.inferSourceEdition(targetEdition)
      if (targetEdition && sourceEdition) {
        this.beginPendingEditionSwitch(sourceEdition, targetEdition)
      }
      if (!this.pollTimer) {
        this.pollEditionSwitch(active.id)
      }
    },
    isActiveSwitchStatus (status) {
      return ACTIVE_SWITCH_STATUSES.includes((status || '').toLowerCase())
    },
    statusLabel (status, edition) {
      const normalized = (status || '').toLowerCase()
      if (ACTIVE_SWITCH_STATUSES.includes(normalized)) {
        return this.isUpgradeEdition(edition)
          ? this.$t('scope.edition_switch.status_running_upgrade')
          : this.$t('scope.edition_switch.status_running_downgrade')
      }
      const key = `scope.edition_switch.status_${normalized}`
      const text = this.$t(key)
      return text === key ? (status || '-') : text
    },
    statusColor (status) {
      if (status === 'succeeded') return 'green'
      if (status === 'failed') return 'red'
      if (status === 'running' || status === 'init') return 'blue'
      return ''
    },
    formatTime (value) {
      if (!value) return ''
      if (this.$moment) return this.$moment(value).format('YYYY-MM-DD HH:mm:ss')
      return value
    },
    openLog (record) {
      if (!record || !record.id) return
      this.stopLogPoll()
      this.logRecordId = record.id
      this.logRecordEdition = record.edition || ''
      this.logRecordStatus = (record.status || '').toLowerCase()
      this.logOutput = ''
      this.logStatus = ''
      this.fetchLog()
    },
    closeLog () {
      this.stopLogPoll()
      this.logRecordId = ''
      this.logRecordEdition = ''
      this.logRecordStatus = ''
      this.logOutput = ''
      this.logStatus = ''
    },
    async fetchLog () {
      if (!this.logRecordId) return
      try {
        const ret = await new this.$Manager('editionswitches').getSpecific({
          id: this.logRecordId,
          spec: 'ansible-log',
          params: { ...EDITION_SWITCH_POLL_HTTP_PARAMS },
        })
        const data = ret.data || {}
        this.logStatus = (data.status || '').toLowerCase()
        this.logOutput = data.output || ''
      } catch (error) {
        // 网关重启等临时错误不展示，保持日志轮询
      }
      if (!this.logRecordId) return
      this.$nextTick(() => {
        const el = this.$refs.logPre
        if (el) el.scrollTop = el.scrollHeight
      })
      this.scheduleLogPoll()
    },
    scheduleLogPoll () {
      this.stopLogPoll()
      if (this.logRecordId && this.logRefreshing) {
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
    pollEditionSwitch (id) {
      this.stopEditionPoll()
      const tick = async () => {
        try {
          const ret = await new this.$Manager('editionswitches').get({
            id,
            params: { ...EDITION_SWITCH_POLL_HTTP_PARAMS },
          })
          const status = ((ret.data && (ret.data.status || ret.data.Status)) || '').toLowerCase()
          if (status === 'succeeded' || status === 'failed') {
            this.stopEditionPoll()
            this.fetchHistory()
            if (status === 'succeeded') {
              const completed = await this.checkPendingEditionReached()
              if (!completed) {
                this.handleEditionSwitchComplete()
              }
              return
            }
            this.running = false
            this.clearPendingEditionSwitch()
            this.refreshCurrentEdition()
            const reason = (ret.data && ret.data.reason) || ''
            this.failReason = reason || this.failedMessage(this.lastOperationEdition || this.targetEdition)
            return
          }
          this.failReason = ''
        } catch (error) {
          // 临时不可达（如 apigateway 重启）静默重试，不以 HTTP 错误判定任务失败
        }
        this.pollTimer = setTimeout(tick, POLL_MS)
      }
      this.pollTimer = setTimeout(tick, POLL_MS)
    },
    stopEditionPoll () {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer)
        this.pollTimer = null
      }
    },
    errorText (error) {
      const data = error && error.response && error.response.data
      if (data && (data.details || data.class)) return data.details || data.class
      return (error && error.message) || this.failedMessage(this.lastOperationEdition || this.targetEdition)
    },
  },
}
</script>

<style lang="less" scoped>
.edition-switch-probe {
  margin-bottom: 16px;
}
.edition-switch-probe__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.edition-switch-probe-meta__row {
  display: flex;
  align-items: flex-start;
  line-height: 22px;
}
.edition-switch-probe-meta__label {
  flex-shrink: 0;
  width: 72px;
}
.edition-switch-probe-meta__value {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}
.edition-switch-form {
  margin-bottom: 8px;
}
.edition-switch-tag {
  margin: 0;
  border-radius: 4px;
}
.shell-cmd {
  max-height: 160px;
  margin-bottom: 0;
  padding: 8px 12px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f5f5f5;
  border-radius: 4px;
}
.edition-switch-history {
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.edition-switch-history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  line-height: 22px;
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
}
.edition-switch-history-row__main {
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  align-items: center;
  min-width: 0;
  gap: 8px;
}
.edition-switch-history-row__action {
  flex-shrink: 0;
  margin-left: 16px;
  white-space: nowrap;
}
.edition-switch-history-edition {
  display: inline-flex;
  flex: 0 0 200px;
  align-items: center;
  width: 200px;
  min-width: 0;
  line-height: 1.4;
  gap: 6px;
}
.edition-switch-history-action {
  flex-shrink: 0;
}
.edition-switch-history-edition-name {
  overflow: hidden;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.edition-switch-history-status-cell {
  flex: 0 0 100px;
  width: 100px;
}
.edition-switch-history-status {
  max-width: 100%;
  margin: 0;
  line-height: 1.4;
  white-space: normal;
}
.edition-switch-history-status--running {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  font-size: 12px;
  line-height: 20px;
  white-space: normal;
}
.edition-switch-history-status__spin {
  flex-shrink: 0;
  margin-right: 4px;
  font-size: 12px;
}
.edition-switch-history-time {
  flex-shrink: 0;
  white-space: nowrap;
}
.edition-switch-log {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}
.edition-switch-log-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.edition-switch-log-toolbar__left {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  min-width: 0;
  gap: 8px;
}
.edition-switch-log-toolbar__loading {
  margin-left: 4px;
}
.edition-switch-log-toolbar__actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  margin-left: auto;
  gap: 8px;
}
.edition-switch-log__title {
  font-weight: 500;
}
.ansible-log {
  max-height: 280px;
  margin-bottom: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
