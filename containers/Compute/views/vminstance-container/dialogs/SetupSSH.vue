<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <steps class="my-3" v-model="step" />
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" v-show="showSetup" />
      <detect-ssh-table ref="endpointsTable" @onDetecting="handleDetectStatusChange" :params="params" :key="step.currentStep" :ansibleTasks="ansibleTasks" :remote="!showSetup" />
      <setup-ssh-form ref="stepForm" :servers="servers" @tasks="handleSetupSSHTasks" v-show="showSetup" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading" v-show="showSetup">{{ $t('dialog.ok') }}</a-button>
      <a-button type="primary" @click="() => { step.currentStep = 0 }" :loading="detecting" v-show="step.currentStep === 1">{{ $t('scope.text_107') }}</a-button>
      <a-button @click="cancelDialog">{{ cancelButtonText }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import SetupSshForm from '../create/form/SetupSSHForm'
import { DetectSshTable } from './DetectSSH'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SetupSSHDialog',
  components: {
    DetectSshTable,
    SetupSshForm,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      detecting: false,
      action: this.$t('compute.vminstance.actions.setup_ssh_authentication'),
      ansibleTasks: {},
      step: {
        steps: [
          { title: this.$t('compute.vminstance.actions.setup_ssh_authentication'), key: 'setup-ssh-form' },
          { title: this.$t('compute.vminstance.setup_ssh_authentication.step2'), key: 'add-user' },
        ],
        currentStep: 0,
      },
    }
  },
  computed: {
    showSetup () {
      return this.step.currentStep === 0
    },
    stepComponent () {
      return this.step.steps[this.step.currentStep].key
    },
    servers () {
      return this.params.data.map((i) => { return i.id })
    },
    cancelButtonText () {
      return this.step.currentStep === 0 ? this.$t('dialog.cancel') : this.$t('scope.text_252')
    },
  },
  methods: {
    handleSetupSSHTasks (tasks) {
      this.ansibleTasks = tasks
    },
    handleDetectStatusChange (e) {
      this.detecting = e
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.stepForm.submit()
        this.loading = false
        this.step.currentStep = 1
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
