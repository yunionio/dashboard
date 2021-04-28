<template>
  <div>
    <div v-show="!installing">
      <a-tooltip>
        <template slot="title" v-if="install_failed_reason">
          {{ install_failed_reason }}
        </template>
        {{ installTips }}
        <help-link href="/docs/en/docs/user/network/ssh/sshproxy" v-if="showPEHelpLink">PE</help-link>
      </a-tooltip>
      <a-tooltip>
        <template slot="title" v-if="disableTips">
          {{ disableTips }}
        </template>
        <a-button class="ml-2" type="link" @click="handleInstallAgent" :disabled="disable" v-show="showInstallButton">
          {{ $t('compute.vminstance.monitor.install_agent') }}
        </a-button>
      </a-tooltip>
    </div>
    <div v-show="installing">
      {{ $t('compute.vminstance.monitor.install_agent.installing') }}
      <a-icon type="loading" />
    </div>
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'InstallAgentForm',
  mixins: [WindowsMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
    serverColumns: {
      type: Array,
      required: true,
    },
  },
  data () {
    let agent_install_status
    if (!this.data.metadata || this.data.metadata['sys:monitor_agent'] !== true) {
      agent_install_status = 'install'
    } else {
      agent_install_status = 'installed'
    }
    const disable = this.data.os_type && this.data.os_type === 'Windows'
    let disableTips = ''
    if (disable) disableTips = this.$t('compute.text_1285')
    return {
      disable: disable,
      disableTips: disableTips,
      /* install, installed, installing, install_failed */
      agent_install_status: agent_install_status,
      install_failed_reason: '',
      install_failed_code: '',
    }
  },
  computed: {
    installing () {
      return this.agent_install_status === 'installing'
    },
    showInstallButton () {
      return this.agent_install_status === 'install' || this.agent_install_status === 'install_failed'
    },
    installTips () {
      switch (this.agent_install_status) {
        case 'installed':
          return this.$t('compute.vminstance.monitor.install_agent.installed')
        case 'install_failed':
          switch (this.install_failed_code) {
            case 'Others':
              return this.$t('compute.vminstance.monitor.install_agent.tips_failed')
            case 'NoReachInfluxdb':
              return this.$t('compute.vminstance.monitor.install_agent.tips_failed.no_reach_influxdb')
            case 'ServerNotSshable':
              return this.$t('compute.vminstance.monitor.install_agent.tips_failed.server_not_sshable')
            default:
              return this.$t('compute.vminstance.monitor.install_agent.tips_failed')
          }
        case 'install':
          return this.$t('compute.vminstance.monitor.install_agent.tips')
        default:
          return ''
      }
    },
    showPEHelpLink () {
      return this.agent_install_status === 'install_failed' && this.install_failed_code === 'ServerNotSshable'
    },
  },
  methods: {
    handleInstallAgent (e) {
      this.createDialog('InstallAgentDialog', {
        data: [this.data],
        columns: this.serverColumns,
        callback: this.handleInstallTask,
      })
    },
    async handleInstallTask (id) {
      if (!id) return
      this.agent_install_status = 'installing'
      try {
        const params = {
          script_apply_id: id,
        }
        let maxTry = 60
        while (maxTry > 0) {
          const { data: { data = [] } } = await new this.$Manager('scriptapplyrecords').list({ params: params })
          if (data) {
            if (data[0].status === 'succeed' || data[0].status === 'failed') {
              this.agent_install_status = data[0].status === 'succeed' ? 'installed' : 'install_failed'
              this.install_failed_reason = data.reason
              this.install_failed_code = data.fail_code || ''
              this.$emit('onInstall', data[0])
              break
            }
          }
          maxTry -= 1
          await new Promise(resolve => setTimeout(resolve, 6000))
        }
      } catch (e) {
        throw e
      }
    },
  },
}
</script>

<style scoped>

</style>
