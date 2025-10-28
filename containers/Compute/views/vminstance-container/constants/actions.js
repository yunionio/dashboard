import { disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { BRAND_MAP, PROVIDER_MAP } from '@/constants'
import { typeClouds } from '@/utils/common/hypervisor'
import { validateRescueMode, cloudEnabled, cloudUnabledTip } from '../utils'
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
          {
            label: i18n.t('compute.text_353'),
            submenus: [
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
                    name: i18n.t('compute.vminstance-container'),
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
              // 重置
              {
                label: i18n.t('compute.text_354'),
                permission: 'server_perform_reset',
                action: () => {
                  this.createDialog('VmContainerResetDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const provider = obj.provider
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                    return ret
                  }
                  return {
                    validate: obj.status === 'running' || obj.status === 'stop_fail',
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
            ],
          },
          {
            label: i18n.t('compute.text_356'),
            submenus: [
              // 创建相同配置
              {
                label: i18n.t('compute.text_359'),
                permission: 'server_create',
                action: () => {
                  this.$openNewWindowForMenuHook('vminstance_configured_callback_address.create_same_configuration_callback_address', () => {
                    this.createDialog('VmContainerCloneDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.is_prepaid_recycle) {
                    ret.tooltip = i18n.t('compute.text_285')
                    return ret
                  }
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [typeClouds.hypervisorMap[obj.hypervisor]?.label || ''])
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
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
              // 加入反亲和组
              {
                label: i18n.t('compute.text_1181', [i18n.t('dictionary.instancegroup')]),
                permission: 'server_perform_bind_groups,server_perform_unbind_groups',
                action: () => {
                  this.createDialog('VmContainerBindInstanceGroupDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: i18n.t('dictionary.server_container'),
                  })
                },
                meta: () => {
                  const provider = obj.provider
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                    return ret
                  }
                  if (!['running', 'ready'].includes(obj.status)) {
                    ret.tooltip = i18n.t('compute.text_1126')
                    return ret
                  }
                  if (obj.backup_host_id) {
                    ret.tooltip = i18n.t('compute.text_1283')
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
            ],
          },
          {
            label: i18n.t('compute.group_action.update_config'),
            submenus: [
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
              // 设置GPU卡
              {
                label: i18n.t('compute.text_1112'),
                permission: 'server_perform_set_isolated_device,attach-isolated-device,server_perform_detach_isolated_device',
                action: () => {
                  this.createDialog('VmContainerAttachGpuDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                // meta: () => {
                //   const provider = obj.provider
                //   const ret = {
                //     validate: false,
                //     tooltip: null,
                //   }
                //   const rescueModeValid = validateRescueMode(obj)
                //   if (!rescueModeValid.validate) return rescueModeValid
                //   if (!this.isAdminMode && !this.isDomainMode) {
                //     ret.tooltip = i18n.t('compute.text_1279', [i18n.t('dictionary.domain')])
                //     return ret
                //   }
                //   if (obj.brand !== BRAND_MAP.OneCloud.key) {
                //     ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                //     return ret
                //   }
                //   ret.validate = cloudEnabled('acttachGpu', obj)
                //   ret.tooltip = cloudUnabledTip('acttachGpu', obj)
                //   return ret
                // },
              },
            ],
          },
          {
            label: i18n.t('compute.text_1290'),
            submenus: [
              // 关联安全组
              {
                label: i18n.t('compute.text_1116'),
                permissionLabels: [i18n.t('compute.text_1116'), i18n.t('compute.revoke_secgroup'), i18n.t('compute.set_secgroup')],
                permission: 'server_perform_add_secgroup,server_perform_revoke_secgroup,server_perform_set_secgroup',
                action: () => {
                  this.createDialog('VmSetSecgroupDialog', {
                    vm: this,
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  const ret = {
                    validate: cloudEnabled('assignSecgroup', obj),
                    tooltip: cloudUnabledTip('assignSecgroup', obj),
                  }
                  return ret
                },
              },
              // 设置源/目标检查
              {
                label: i18n.t('compute.text_1124'),
                permission: 'server_perform_modify_src_check',
                action: () => {
                  this.createDialog('VmContainerSourceTargetCheckDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const provider = obj.provider
                  const ret = { validate: true, tooltip: null }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                    return ret
                  }
                  if (!['running', 'ready'].includes(obj.status)) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_1126')
                    return ret
                  }
                  return ret
                },
              },
            ],
          },
          {
            label: i18n.t('compute.perform_delete'),
            submenus: [
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
  // name: POLICY_RES_NAME_KEY_MAP.vminstance.key,
  getSingleActions,
}
