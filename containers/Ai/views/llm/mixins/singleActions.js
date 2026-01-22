
export default {
  created () {
    this.singleActions = [
      // 同步状态
      {
        label: this.$t('common.text00043'),
        action: (obj) => {
          this.onManager('batchPerformAction', {
            steadyStatus: ['running', 'ready'],
            id: [obj.id],
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
      },
      {
        label: this.$t('compute.text_352'),
        actions: obj => {
          return [
            // 开机
            {
              label: this.$t('compute.text_272'),
              action: (obj) => {
                this.createDialog('LlmBatchConfirmDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  action: 'start',
                  actionText: this.$t('compute.text_272'),
                  steadyStatus: 'running',
                })
              },
              meta: (obj) => {
                const ret = {
                  validate: (obj.status === 'ready'),
                  tooltip: null,
                }
                return ret
              },
              // hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
            },
            {
              label: this.$t('aice.install_instant_model'),
              action: (obj) => {
                this.createDialog('LlmQuickModelDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  actionText: this.$t('aice.install_instant_model'),
                })
              },
              meta: (obj) => {
                const ret = {
                  validate: (obj.status === 'running'),
                  tooltip: null,
                }
                return ret
              },
            },
            // 重启
            // {
            //   label: this.$t('aice.action.restart'),
            //   permission: 'server_perform_restart',
            //   action: (obj) => {
            //     this.createDialog('LlmBatchConfirmDialog', {
            //       data: [obj],
            //       columns: this.columns,
            //       onManager: this.onManager,
            //       action: 'restart',
            //       actionText: this.$t('aice.action.restart'),
            //       steadyStatus: 'running',
            //     })
            //   },
            //   meta: (obj) => {
            //     const ret = {
            //       validate: ['running', 'stop_fail', 'ready'].includes(obj.status),
            //       tooltip: null,
            //     }
            //     return ret
            //   },
            //   hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_restart'),
            // },
            // 更改项目
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              permission: 'llms_perform_public',
              action: (obj) => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  resource: 'llms',
                })
              },
            },
            // 关机
            {
              label: this.$t('compute.text_273'),
              permission: 'server_perform_stop',
              action: (obj) => {
                this.createDialog('LlmBatchConfirmDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  action: 'stop',
                  actionText: this.$t('compute.text_273'),
                  steadyStatus: 'ready',
                })
              },
              meta: (obj) => {
                const ret = {
                  validate: (obj.status === 'running'),
                  tooltip: null,
                }
                return ret
              },
              hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.phone_perform_stop'),
            },
            // 删除
            {
              label: this.$t('table.action.delete'),
              action: (obj) => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: this.$t('aice.llm'),
                  onManager: this.onManager,
                })
              },
              meta: obj => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
  methods: {
    openWebConsole (data) {
      this.$openWebConsole(data)
    },
    async fetchConnectUrl (obj, conn) {
      const { data } = await new this.$Manager('webconsole', 'v1').objectRpc({
        methodname: 'DoAdbShell',
        objId: obj.cmp_id,
        params: {
          server_id: obj.cmp_id,
          conn: conn,
        },
      })
      return Promise.resolve(data)
    },
  },
}
