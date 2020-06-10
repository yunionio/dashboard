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
        label: '部署',
        action: (obj) => {
          this.createDialog('AgentDeployDialog', {
            title: '部署',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: '下线',
        action: (obj) => {
          this.createDialog('DisableDialog', {
            title: '下线',
            columns: this.columns,
            data: [obj],
            alert: '提示：下线操作会把节点配置从部署主机中删除',
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
                  this.$router.push({
                    path: `/lbagent/asbook?ansiblePlaybookId=${data.deployment.ansible_playbook_undeployment}&loadbalanceragentId=${obj.id}`,
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
        label: '更多',
        actions: (obj) => {
          return [
            {
              label: '修改',
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
              label: '删除',
              action: (obj) => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: '删除',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  alert: '提示：删除操作仅涉及数据库记录，实际节点的下线计划需要管理员计划实施',
                  content: () => {
                    const change = (bool) => {
                      this.okButtonProps.disabled = !bool
                    }
                    return <a-checkbox value={this.isDelete} onInput={ change }>确认已经实际操作下线</a-checkbox>
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
