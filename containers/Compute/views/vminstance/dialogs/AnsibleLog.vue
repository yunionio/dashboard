<template>
  <base-dialog @cancel="cancelDialog" width="1000px">
    <div slot="header">{{ $t('compute.vminstance.monitor.install_agent.view_log') }}</div>
    <div class="clearfix ansible-log-body" slot="body">
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
import 'codemirror/theme/3024-day.css'
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
      this.refreshEditor()
    },
  },
  mounted () {
    // 弹窗动画结束后再 refresh，避免 gutter 宽度算成 0，行首被行号挡住
    this.refreshEditor(300)
  },
  created () {
    this.fetchLog()
  },
  beforeDestroy () {
    this.clearTimer()
  },
  methods: {
    refreshEditor (delay = 0) {
      this.$nextTick(() => {
        const run = () => {
          this.$refs.codeMirrorRef && this.$refs.codeMirrorRef.refresh()
        }
        if (delay > 0) {
          setTimeout(run, delay)
        } else {
          run()
        }
      })
    },
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

<style lang="less" scoped>
.ansible-log-body {
  ::v-deep .CodeMirror {
    height: 400px !important;
    font-family: Consolas, Monaco, monospace;
  }
  /* ant-design 的 pre { overflow: auto } 可能裁切行首字符 */
  ::v-deep pre.CodeMirror-line,
  ::v-deep pre.CodeMirror-line-like {
    overflow: visible !important;
  }
  ::v-deep .CodeMirror-gutters {
    background-color: #f7f7f7;
    border-right: 1px solid #ddd;
  }
}
</style>
