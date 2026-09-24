<template>
  <div class="install-agent-form">
    <div v-show="!installing" class="install-agent-form-status">
      <a-tooltip>
        <template slot="title" v-if="install_failed_reason">
          {{ install_failed_reason }}
        </template>
        {{ installTips }}
        <help-link :href="peHelpLink" v-if="showPEHelpLink && showDocsLink()">PE</help-link>
      </a-tooltip>
      <a-tooltip>
        <template slot="title" v-if="disableTips">
          {{ disableTips }}
        </template>
        <a-button class="ml-2" type="link" @click="handleInstallAgent" :disabled="disable">
          {{ buttonText }}
        </a-button>
      </a-tooltip>
    </div>
    <div v-show="installing" class="install-agent-form-status">
      {{ $t('compute.vminstance.monitor.install_agent.installing') }}
      <a-icon type="loading" />
    </div>
    <a-tooltip v-if="agent_record_id">
      <template slot="title">{{ $t('compute.vminstance.monitor.install_agent.view_log_tips') }}</template>
      <span class="install-agent-form-log">
        <a-button type="link" @click="handleViewLog">
          {{ $t('compute.vminstance.monitor.install_agent.view_log') }}
        </a-button>
      </span>
    </a-tooltip>
  </div>
</template>

<script>
import _ from 'lodash'
import WindowsMixin from '@/mixins/windows'
import { DOCS_MAP, showDocsLink } from '@/constants/docs'

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
    isPageDestroyed: Boolean,
  },
  data () {
    return {
      showDocsLink,
      /* install, installed, installing, install_failed */
      agent_install_status: this.resolveAgentInstallStatus(this.data),
    }
  },
  computed: {
    installing () {
      return this.agent_install_status === 'installing'
    },
    // The side page passes the id of the script apply record of the latest attempt;
    // it is absent for the install paths that are not driven by an ansible script
    // (for instance the deploy of a ready KVM guest) and for the container hosts.
    agent_record_id () {
      return this.data.agent_record_id
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
              return this.$t('compute.vminstance.monitor.install_agent.tips_failed.others')
            case 'NoReachInfluxdb':
              return showDocsLink() ? this.$t('compute.vminstance.monitor.install_agent.tips_failed.no_reach_influxdb') : this.$t('compute.vminstance.monitor.install_agent.tips_failed.no_reach_influxdb_1')
            case 'ServerNotSshable':
              return this.$t('compute.vminstance.monitor.install_agent.tips_failed.server_not_sshable')
            default:
              return this.$t('compute.vminstance.monitor.install_agent.tips_failed.others')
          }
        case 'install':
          return this.$t('compute.vminstance.monitor.install_agent.tips')
        default:
          return ''
      }
    },
    showPEHelpLink () {
      return this.agent_install_status === 'install_failed' && this.install_failed_code === 'NoReachInfluxdb'
    },
    peHelpLink () {
      return DOCS_MAP.sshProxy()
    },
    install_failed_code () {
      return this.agent_install_status === 'install_failed' && this.data.agent_fail_code
    },
    install_failed_reason () {
      return this.agent_install_status === 'install_failed' && this.data.agent_fail_reason
    },
    disable () {
      if (this.data?.os_type === 'Windows') {
        return this.data.status !== 'ready'
      }
      return !['running', 'ready'].includes(this.data.status)
    },
    buttonText () {
      if (this.showInstallButton) {
        return this.$t('compute.vminstance.monitor.install_agent')
      } else {
        return this.$t('compute.vminstance.monitor.reinstall_agent')
      }
    },
    disableTips () {
      if (this.data?.os_type === 'Windows') {
        if (this.data.status !== 'ready') {
          return this.$t('compute.vminstance.monitor.agent_install_tooltip')
        }
      } else {
        if (!['running', 'ready'].includes(this.data.status)) {
          return this.$t('compute.text_1397')
        }
      }
      return ''
    },
  },
  watch: {
    data: {
      handler (val) {
        const next = this.resolveAgentInstallStatus(val)
        if (this.agent_install_status === 'installing' && next === 'install') return
        this.agent_install_status = next
      },
    },
    'data.agent_status': {
      handler: function (val, oldval) {
        if (oldval === 'applying' || this.agent_install_status === 'installing') {
          if (val === 'succeed' || val === 'failed') {
            this.agent_install_status = val === 'succeed' ? 'installed' : 'install_failed'
            this.$emit('onInstall', { status: val })
          }
        }
      },
      immediate: true,
      deep: true,
    },
    'data.metadata.telegraf_deployed' (val, oldval) {
      if (val === 'true') {
        this.agent_install_status = 'installed'
        this.$emit('onInstall', { status: 'succeed' })
      }
    },
  },
  methods: {
    resolveAgentInstallStatus (data) {
      if (!data) return 'install'
      const deploy = _.get(data, ['metadata', 'telegraf_deployed'])
      const monitorAgent = _.get(data, ['metadata', 'sys:monitor_agent']) || _.get(data, ['metadata', '__monitor_agent'])
      const deployed = deploy === true || deploy === 'true'
      if (deployed || monitorAgent) return 'installed'
      if (Object.prototype.hasOwnProperty.call(data, 'agent_status')) {
        if (data.agent_status === 'succeed') return 'installed'
        if (data.agent_status === 'applying') return 'installing'
        if (data.agent_status === 'failed') return 'install_failed'
      }
      return 'install'
    },
    async handleInstallAgent (e) {
      if (this.data.hypervisor === 'kvm' || this.data.hypervisor === 'esxi') {
        if (this.data.status === 'running') {
          const data = {
            auto_choose_proxy_endpoint: true,
            server_id: this.data.id,
          }
          const ret = await new this.$Manager('scripts')
            .performAction({
              id: 'monitor agent',
              action: 'apply',
              data: data,
            })
          await this.handleInstallTask(ret.data.script_apply_id)
          return
        }
        if (this.data.status === 'ready') {
          const data = {
            deploy_telegraf: true,
          }
          await new this.$Manager('servers')
            .performAction({
              id: this.data.id,
              action: 'deploy',
              data: data,
            })
          this.agent_install_status = 'installing'
          const timer = setInterval(() => {
            this.$bus.$emit('VMInstanceListSingleRefresh', [this.data.id])
            if (this.data.metadata?.telegraf_deployed === 'true') {
              clearInterval(timer)
            }
          }, 5000)
          return
        }
      }

      this.createDialog('InstallAgentDialog', {
        data: [this.data],
        columns: this.serverColumns,
        callback: this.handleInstallTask,
      })
    },
    handleInstallTask (id) {
      if (!id) return
      this.agent_install_status = 'installing'
      this.$bus.$emit('agentStatusQuery', id)
    },
    handleViewLog () {
      this.createDialog('MonitorAgentAnsibleLogDialog', {
        recordId: this.agent_record_id,
      })
    },
    // async handleInstallTask (id) {
    //   if (!id) return
    //   this.agent_install_status = 'installing'
    //   try {
    //     const params = {
    //       script_apply_id: id,
    //     }
    //     let maxTry = 60
    //     while (maxTry > 0) {
    //       console.log('ispagedestroyed', this.isPageDestroyed)
    //       if (this.isPageDestroyed) {
    //         break
    //       }
    //       const { data: { data = [] } } = await new this.$Manager('scriptapplyrecords').list({ params: params })
    //       if (data) {
    //         if (data[0].status === 'succeed' || data[0].status === 'failed') {
    //           this.agent_install_status = data[0].status === 'succeed' ? 'installed' : 'install_failed'
    //           this.install_failed_reason = data[0].reason
    //           this.install_failed_code = data[0].fail_code || ''
    //           this.$emit('onInstall', data[0])
    //           break
    //         }
    //       }
    //       maxTry -= 1
    //       console.log('maxTry', maxTry)
    //       await new Promise(resolve => setTimeout(resolve, 6000))
    //     }
    //   } catch (e) {
    //     throw e
    //   }
    // },
  },
}
</script>

<style scoped>
/* Keep the install status, the install button and the deploy log link on a single
   line. The children are blocks by default, which used to push the log link onto a
   line of its own. The status text is the only part allowed to shrink, so the log
   link never breaks onto a separate line, the text wraps instead. */
.install-agent-form {
  display: flex;
  align-items: center;
}
.install-agent-form-status {
  flex: 0 1 auto;
  min-width: 0;
}
.install-agent-form-log {
  flex: 0 0 auto;
  white-space: nowrap;
  /* ml-2 equivalent, the install button next to it uses the same spacing */
  margin-left: 8px;
}
</style>
