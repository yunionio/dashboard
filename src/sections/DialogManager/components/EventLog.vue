<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common.text00093')}}</div>
    <div class="clearfix pr-2" slot="body">
      <code-mirror v-model="showData" :options="cmOptions" ref="codeMirrorRef" view-height="300px" :is-scroll="true" />
      <div
        class="float-right"
        v-clipboard:copy="params.data"
        v-clipboard:success="copySuccess"
        v-clipboard:error="copyError">
        <a-icon class="primary-color" type="copy" />
        <a-button type="link" size="small">{{$t('common.text00094')}}</a-button>
      </div>
      <a-button v-if="sessionId" class="float-right mr-3" type="link" size="small" @click="showLog">{{ $t('common.view_scheduler_log') }}</a-button>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'EventLogDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      cmOptions: {
        tabSize: 2,
        indentUnit: 2,
        smartIndent: true,
        lineNumbers: true,
        readOnly: true,
        theme: '3024-day',
        lineWrapping: true,
        mode: 'application/json',
        gutters: ['CodeMirror-lint-markers'],
        lint: true,
      },
    }
  },
  computed: {
    showData () {
      return this.params.data
    },
    sessionId () {
      if (this.params.data && this.params.data.includes('=>sched_fail') && this.params.data.includes('session_id=')) {
        const str = this.params.data.replaceAll('\\', '')
        return str.match(/session_id="(.*?)"/)[1]
      }
      return ''
    },
  },
  methods: {
    showLog () {
      this.createDialog('SchedulerLogDialog', {
        data: {
          sessionId: this.sessionId,
        },
      })
    },
    copySuccess (evt) {
      this.$message.success(this.$t('common.text00095'))
    },
    copyError () {
      this.$message.error(this.$t('common.text00096'))
    },
  },
}
</script>
