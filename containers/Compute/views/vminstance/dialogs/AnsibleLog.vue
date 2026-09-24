<template>
  <base-dialog @cancel="cancelDialog" width="1000px">
    <div slot="header">{{ $t('compute.vminstance.monitor.install_agent.view_log') }}</div>
    <div class="clearfix codemirror-h-100" slot="body">
      <code-mirror v-model="showData" :options="cmOptions" ref="codeMirrorRef" />
      <div
        class="float-right"
        v-clipboard:copy="showData"
        v-clipboard:success="copySuccess"
        v-clipboard:error="copyError">
        <a-icon class="primary-color" type="copy" />
        <a-button type="link" size="small">{{ $t('common.text00094') }}</a-button>
      </div>
    </div>
    <div slot="footer">
      <span v-if="running" class="mr-2">
        <a-icon type="loading" />
        {{ $t('compute.vminstance.monitor.install_agent.log_running') }}
      </span>
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

// The status is the one of the ansible playbook instance, see
// pkg/apis/ansibleserver/status.go. While it is still init/running the output keeps
// growing, so the log is refreshed until the playbook reaches a terminal status.
const RUNNING_STATUS = ['init', 'running']
const POLL_INTERVAL = 5000

export default {
  name: 'MonitorAgentAnsibleLogDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      showData: '',
      status: '',
      timer: null,
      cmOptions: {
        tabSize: 2,
        indentUnit: 2,
        smartIndent: true,
        lineNumbers: true,
        readOnly: true,
        theme: '3024-day',
        lineWrapping: true,
        mode: 'text/plain',
      },
    }
  },
  computed: {
    running () {
      return RUNNING_STATUS.includes(this.status)
    },
  },
  watch: {
    showData () {
      this.$nextTick(() => {
        this.$refs.codeMirrorRef && this.$refs.codeMirrorRef.refresh()
      })
    },
  },
  created () {
    this.fetchLog()
  },
  beforeDestroy () {
    this.clearTimer()
  },
  methods: {
    clearTimer () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    scheduleNext () {
      this.clearTimer()
      if (this.running) {
        this.timer = setTimeout(() => { this.fetchLog() }, POLL_INTERVAL)
      }
    },
    async fetchLog () {
      const recordId = this.params.recordId
      if (!recordId) return
      this.loading = true
      try {
        const { data } = await new this.$Manager('scriptapplyrecords').performAction({
          id: recordId,
          action: 'ansible-log',
        })
        this.status = data.status || ''
        this.showData = data.output || ''
      } catch (e) {
        this.status = ''
        this.showData = e?.response?.data?.message ||
          this.$t('compute.vminstance.monitor.install_agent.log_load_failed')
      } finally {
        this.loading = false
      }
      this.scheduleNext()
    },
    copySuccess () {
      this.$message.success(this.$t('common.text00095'))
    },
    copyError () {
      this.$message.error(this.$t('common.text00096'))
    },
  },
}
</script>
