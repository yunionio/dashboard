import { disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { POLICY_RES_NAME_KEY_MAP } from '@/constants/policy'

const getSingleActions = function () {
  return [
    // 同步状态
    {
      label: this.$t('compute.perform_sync_status'),
      permission: 'server_perform_syncstatus',
      action: (obj) => {
        this.onManager('batchPerformAction', {
          steadyStatus: ['running', 'ready'],
          id: [obj.id],
          managerArgs: {
            action: 'syncstatus',
          },
        })
      },
      hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_syncstatus'),
    },
    {
      label: i18n.t('compute.text_352'),
      actions: (obj) => {
        return [
          // 更改项目
          {
            label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
            permission: 'servers_perform_public',
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
          // 更改配置
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
          // 开机
          {
            label: i18n.t('compute.text_272'),
            permission: 'server_perform_start',
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
            hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
          },
          // 关机
          {
            label: i18n.t('compute.text_273'),
            permission: 'server_perform_stop',
            action: () => {
              this.createDialog('VmContainerShutDownDialog', {
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
            hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop'),
          },
          // 重启
          {
            label: i18n.t('compute.text_274'),
            permission: 'server_perform_restart',
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
            hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_restart'),
          },
          // 设置删除保护
          disableDeleteAction(Object.assign(this, {
            permission: 'server_update',
          }), {
            name: i18n.t('compute.vminstance-container'),
            meta: () => {
              const ret = { validate: true }
              return ret
            },
            hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_set_delete_protection'),
          }),
          // 删除
          {
            label: i18n.t('compute.perform_delete'),
            permission: 'server_delete',
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
            hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_delete'),
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
  name: POLICY_RES_NAME_KEY_MAP.vminstance.key,
  getSingleActions,
}
