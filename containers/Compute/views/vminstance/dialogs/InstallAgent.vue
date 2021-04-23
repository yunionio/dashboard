<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips
        :name="$t('dictionary.server')"
        :count="params.data.length"
        :action="action" />
      <detect-ssh-table
        ref="endpointsTable"
        @onDetecting="handleDetectStatusChange"
        :params="params"
        :key="detectTableKey"
        :ansibleTasks="ansibleTasks"
        :remote="true" />
      <setup-ssh-form ref="stepForm" :servers="servers" @tasks="handleSetupSSHTasks" v-show="showForm" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading" :disabled="disabled">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import SetupSshForm from '../create/form/SetupSSHForm'
import { DetectSshTable } from './DetectSSH'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'InstallAgentDialog',
  components: {
    DetectSshTable,
    SetupSshForm,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      showForm: false,
      detectTableKey: 0,
      action: this.$t('compute.vminstance.monitor.install_agent'),
      ansibleTasks: {},
    }
  },
  computed: {
    servers () {
      return this.params.data.map((i) => { return i.id })
    },
    disabled () {
      return !this.params.data || this.params.data.length === 0
    },
  },
  methods: {
    handleSetupSSHTasks (tasks) {
      this.ansibleTasks = tasks
    },
    allServerSshable () {
      return this.params.data.every((server) => { return server.sshable_status === 'available' })
    },
    handleDetectStatusChange (e) {
      this.loading = e
      if (!e) {
        this.showForm = !this.allServerSshable()
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (!this.allServerSshable()) {
          await this.$refs.stepForm.submit().then((res) => {
            this.detectTableKey += 1
          })
        } else {
          const data = {
            auto_choose_proxy_endpoint: true,
            server_id: this.params.data[0].id,
          }
          const ret = await new this.$Manager('scripts').performAction({ id: 'monitor agent', action: 'apply', data: data })
          this.loading = false
          if (this.params.callback && typeof this.params.callback === 'function') {
            this.params.callback(ret.data.script_apply_id)
          }
          this.cancelDialog()
        }
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
