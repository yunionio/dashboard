import i18n from '@/locales'
export default {
  data () {
    return {
      okButtonProps: {
        disabled: true,
      },
    }
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_41'),
        action: (obj) => {
          this.createDialog('AgentDeployDialog', {
            title: i18n.t('network.text_41'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: i18n.t('network.text_126'),
        action: (obj) => {
          this.createDialog('DisableDialog', {
            title: i18n.t('network.text_126'),
            columns: this.columns,
            data: [obj],
            alert: i18n.t('network.text_127'),
            ok: async () => {
              try {
                const { data } = await new this.$Manager('loadbalanceragents').performAction({
                  id: obj.id,
                  action: 'undeploy',
                  data: {
                    state: 'suspend',
                    // 'process-key': obj.key,
                  },
                })
                if (data && data.deployment && data.deployment.ansible_playbook_undeployment) {
                  // this.$router.push({
                  //   path: `/lbagent/asbook?ansiblePlaybookId=${data.deployment.ansible_playbook_undeployment}&loadbalanceragentId=${obj.id}`,
                  // })
                  this.createDialog('AnsibleplaybookDialog', {
                    title: i18n.t('network.text_128'),
                    ansiblePlaybookId: data.deployment.ansible_playbook_undeployment,
                    loadbalanceragentId: obj.id,
                  })
                }
                return data
              } catch (error) {
                throw error
              }
            },
          })
        },
        meta: (obj) => {
          if (!obj.deployment || !obj.deployment.host) {
            return {
              validate: false,
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: (obj) => {
          return [
            {
              label: i18n.t('network.text_130'),
              action: () => {
                this.$router.push({
                  name: 'AgentForm',
                  query: {
                    id: obj.id,
                  },
                })
              },
            },
            {
              label: i18n.t('network.text_74'),
              action: () => {
                this.createDialog('AgentUpdateDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
            },
            {
              label: i18n.t('network.text_131'),
              action: (obj) => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('network.text_131'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  alert: i18n.t('network.text_132'),
                  content: () => {
                    const change = (bool) => {
                      this.okButtonProps.disabled = !bool
                    }
                    return <a-checkbox value={this.isDelete} onInput={ change }>{ this.$t('network.text_736') }</a-checkbox>
                  },
                  okButtonProps: this.okButtonProps,
                })
              },
            },
          ]
        },
      },
    ]
  },
}
