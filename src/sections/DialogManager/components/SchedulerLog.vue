<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common.scheduler_log')}}</div>
    <div class="clearfix codemirror-h-100" slot="body">
      <code-mirror v-model="showData" :options="cmOptions" ref="codeMirrorRef" :is-scroll="true" />
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
import * as R from 'ramda'
import yaml from 'js-yaml'
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
        if (R.is(Object, res.data)) {
          const data = {}
          for (const key in res.data) {
            let value = res.data[key]
            if (key.startsWith('{\\') && key.endWith('}')) {
              try {
                const v = JSON.parse(value)
                value = v
              } catch (err) {}
            }
            data[key] = value
          }
          const yamlData = yaml.dump(data)
          this.cmOptions.mode = 'text/x-yaml'
          this.showData = yamlData
        } else {
          this.showData = JSON.stringify(res.data)
        }
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

<style lang="less" scoped>
.CodeMirror {
  height: 100% !important;
}
</style>
