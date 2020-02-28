export default {
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
                const response = await new this.$Manager('loadbalanceragents').performAction({
                  id: obj.id,
                  action: 'undeploy',
                  data: {
                    'state': 'suspend',
                    'process-key': obj.key,
                  },
                })
                if (response.data && response.data.deployment) {
                  this.$router.push({
                    path: `/lbagent/asbook?ansiblePlaybookId=${response.data.deployment.ansible_playbook}`,
                  })
                }
                return response
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
        label: '删除',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            title: '删除',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            alert: '提示：删除操作仅涉及数据库记录，实际节点的下线计划需要管理员计划实施',
            success: () => {
              this.destroySidePages()
            },
          })
        },
      },
    ]
  },
}
