import { disableDeleteAction } from '@/utils/common/tableActions'
import { typeClouds } from '@/utils/common/hypervisor'
import i18n from '@/locales'
import { POLICY_RES_NAME_KEY_MAP } from '@/constants/policy'

const getSingleActions = function () {
  return [
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
          ret.validate = false
        }
        return ret
      },
    },
    {
      label: i18n.t('compute.text_352'),
      actions: (obj) => {
        return [
          // * 删除
          {
            label: i18n.t('compute.perform_delete'),
            submenus: [
              // 设置删除保护
              disableDeleteAction(Object.assign(this, {
                permission: 'server_update',
              }), {
                name: i18n.t('dictionary.server'),
                meta: () => {
                  const ret = { validate: true }
                  if (obj.hypervisor === typeClouds.hypervisorMap.bingocloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [typeClouds.hypervisorMap.bingocloud.label])
                    ret.validate = false
                    return ret
                  }
                  return ret
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_set_delete_protection'),
              }),
              // 删除
              {
                label: i18n.t('compute.perform_delete'),
                permission: 'server_delete',
                action: () => {
                  this.$openNewWindowForMenuHook('vminstance_configured_callback_address.delete_callback_address', () => {
                    this.createDialog('DeleteVmDialog', {
                      vm: this,
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      title: i18n.t('compute.perform_delete'),
                      success: () => {
                        this.destroySidePages()
                      },
                    })
                  })
                },
                meta: () => {
                  const ret = { validate: false }
                  if (obj.hypervisor === typeClouds.hypervisorMap.bingocloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [typeClouds.hypervisorMap.bingocloud.label])
                    return ret
                  }
                  const { server_delete_limit = false } = this.$store.getters.globalSetting.value || {}
                  if (server_delete_limit && obj.status === 'running') {
                    ret.tooltip = i18n.t('compute.delete_limit')
                    return ret
                  }
                  return this.$getDeleteResult(obj)
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_delete'),
              },
            ],
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
