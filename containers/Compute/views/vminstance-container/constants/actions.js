import { disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'
// import { POLICY_RES_NAME_KEY_MAP } from '@/constants/policy'
const getSingleActions = function () {
  return [
    // 终端
    {
      label: i18n.t('compute.repo.terminal'),
      actions: (obj) => {
        const containers = obj.containers || []
        return containers.map(item => {
          return {
            label: item.name,
            action: async () => {
              const connectRes = await this.fetchConnectUrl(item.id)
              this.openWebConsole(connectRes)
            },
          }
        })
      },
      meta: (obj) => {
        const ret = { validate: true }
        if (!obj.containers?.length) {
          ret.validate = false
          return ret
        }
        if (obj.status !== 'running' && obj.status !== 'probing') {
          ret.tooltip = this.$t('compute.repo.helper.terminal', [this.$t('compute.vminstance-container')])
          ret.validate = false
        }
        return ret
      },
    },
    {
      label: i18n.t('compute.text_352'),
      actions: (obj) => {
        return [
          // 同步状态
          {
            label: i18n.t('compute.perform_sync_status'),
            permission: 'server_perform_syncstatus',
            action: () => {
              this.onManager('performAction', {
                steadyStatus: ['running', 'ready'],
                id: obj.id,
                managerArgs: {
                  action: 'syncstatus',
                },
              })
            },
            hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_syncstatus'),
          },
          // 开机
          {
            label: i18n.t('compute.text_272'),
            action: () => {
              this.onManager('performAction', {
                steadyStatus: 'running',
                id: obj.id,
                managerArgs: {
                  action: 'start',
                },
              })
            },
            meta: () => {
              return {
                validate: obj.status === 'ready',
              }
            },
          },
          // 关机
          {
            label: i18n.t('compute.text_273'),
            action: () => {
              this.createDialog('VmShutDownDialog', {
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
              })
            },
            meta: () => {
              return {
                validate: obj.status === 'running',
              }
            },
          },
          // 重启
          {
            label: i18n.t('compute.text_274'),
            action: () => {
              this.createDialog('VmContainerRestartDialog', {
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
              })
            },
            meta: () => {
              return {
                validate: obj.status === 'running',
              }
            },
          },
          // 推送配置
          {
            label: i18n.t('compute.sync_config'),
            permission: 'server_perform_sync_config',
            action: () => {
              this.createDialog('VmSyncConfigDialog', {
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
              })
            },
            meta: () => {
              const ret = {
                validate: false,
                tooltip: null,
              }
              if (obj.status !== 'running' && obj.status !== 'ready') {
                ret.validate = false
                ret.tooltip = i18n.t('compute.text_1126')
                return ret
              }
              ret.validate = true
              return ret
            },
            hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_sync_config'),
          },
          // 更改项目
          {
            label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
            action: (obj) => {
              this.createDialog('ChangeOwenrDialog', {
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
                refresh: this.refresh,
                resource: 'servers',
              })
            },
          },
          // 到期释放
          {
            label: i18n.t('compute.text_1132'),
            action: () => {
              this.createDialog('SetDurationDialog', {
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
                name: i18n.t('compute.vminstance-container'),
                alert: i18n.t('compute.repo.helper.set_duration.alert'),
                refresh: this.refresh,
              })
            },
            meta: () => {
              const ret = { validate: true }
              if (obj.billing_type === 'prepaid') {
                ret.validate = false
                ret.tooltip = i18n.t('compute.text_285')
                return ret
              }
              return ret
            },
          },
          // 调整配置
          {
            label: i18n.t('compute.text_1100'),
            action: (obj) => {
              this.$router.push({
                name: 'VMContainerInstanceAdjustConfig',
                query: {
                  id: obj.id,
                },
              })
            },
            meta: (obj) => {
              const ret = {
                validate: true,
                tooltip: null,
              }
              if (obj.status !== 'ready') {
                ret.tooltip = this.$t('compute.repo.helper.change_config')
                ret.validate = false
              }
              return ret
            },
          },
          // 设置删除保护
          disableDeleteAction(Object.assign(this, {}), {
            name: i18n.t('compute.vminstance-container'),
            meta: () => {
              const ret = { validate: true }
              return ret
            },
          }),
          // 删除
          {
            label: i18n.t('compute.perform_delete'),
            action: () => {
              this.createDialog('DeleteVmContainerDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
                title: i18n.t('compute.perform_delete'),
                success: () => {
                  this.destroySidePages()
                },
              })
            },
            meta: () => {
              return this.$getDeleteResult(obj)
            },
          },
        ]
      },
      meta: (obj) => {
        let ret = {
          validate: true,
          tooltip: null,
        }
        ret = this.$isValidateResourceLock(obj)
        return ret
      },
    },
  ]
}
export default {
  // name: POLICY_RES_NAME_KEY_MAP.vminstance.key,
  getSingleActions,
}
