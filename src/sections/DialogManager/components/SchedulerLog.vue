<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common.scheduler_log')}}</div>
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
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SchedulerLogDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
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
      showData: '',
    }
  },
  created () {
    this.fetchSchedFailData()
  },
  methods: {
    fetchSchedFailData () {
      this.loading = true
      new this.$Manager('schedulers', 'v1').rpc({
        methodname: 'PostHistoryShow',
        params: {
          session_id: this.params.data.sessionId,
          log: true,
          raw: true,
        },
      }).then(res => {
        this.showData = JSON.stringify(res.data)
        this.loading = false
      }).catch(err => {
        this.showData = 'No log found'
        this.loading = false
        throw err
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
