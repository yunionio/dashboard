import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import qs from 'qs'
import protocolCheck from 'custom-protocol-detection'
import { commonUnabled, cloudEnabled, cloudUnabledTip, commonEnabled, commonTip } from '../utils'
import { SERVER_TYPE } from '@Compute/constants'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import i18n from '@/locales'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import { PROVIDER_MAP } from '@/constants'
import { hasSetupKey } from '@/utils/auth'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode']),
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
    this.singleActions = [
      {
        label: i18n.t('compute.text_341'),
        actions: obj => {
          let ret = []
          ret.push({
            label: i18n.t('compute.text_1274'),
            action: () => {
              const isValidURL = str => {
                const regex = /(\w+):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!-/]))?/
                if (!regex.test(str)) {
                  return false
                } else {
                  return true
                }
              }
              this.webconsoleManager.performAction({
                id: 'server',
                action: obj.id,
              }).then(({ data }) => {
                if (isValidURL(data.connect_params)) {
                  this.open(obj, data.connect_params)
                } else {
                  this.openWebConsole(obj, data)
                }
              })
            },
            meta: () => {
              const ret = {
                validate: cloudEnabled('vnc', obj),
                tooltip: cloudUnabledTip('vnc', obj),
              }
              return ret
            },
          })
          const mapIpActions = (ipInfoList) => {
            const options = []
            ipInfoList.forEach(ipInfo => {
              const actionType = ipInfo.actionType
              const ipAddr = ipInfo.ipAddr
              const meta = () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.os_type === 'Windows') {
                  ret.tooltip = i18n.t('compute.text_344')
                  return ret
                }
                ret.validate = cloudEnabled(actionType, obj)
                ret.tooltip = cloudUnabledTip(actionType, obj)
                return ret
              }

              const fetchWebconsoleAddr = async (port) => {
                if (ipInfo.vpcId === 'default' || ipInfo.ipType === 'eip') {
                  return {
                    ipAddr: ipAddr,
                    port: port,
                  }
                }
                if (ipInfo.provider === 'OneCloud') {
                  return new this.$Manager('servers').performAction({
                    id: obj.id,
                    action: 'list-forward',
                    data: {
                      proto: 'tcp',
                      port: port,
                    },
                  }).then(data => {
                    const fwds = data.data.forwards
                    if (fwds && fwds.length > 0) {
                      const fwd = fwds[0]
                      return {
                        ipAddr: fwd.proxy_addr,
                        port: fwd.proxy_port,
                      }
                    }
                    return new this.$Manager('servers').performAction({
                      id: obj.id,
                      action: 'open-forward',
                      data: {
                        proto: 'tcp',
                        port: port,
                      },
                    }).then(data => {
                      const fwd = data.data
                      return {
                        ipAddr: fwd.proxy_addr,
                        port: fwd.proxy_port,
                      }
                    })
                  })
                }
                return Promise.reject(Error(`unexpected ${ipInfo}`))
              }

              const openWebconsole = (port) => {
                fetchWebconsoleAddr(port).then(addr => {
                  return this.webconsoleManager.performAction({
                    id: 'ssh',
                    action: addr.ipAddr,
                    data: {
                      port: addr.port,
                    },
                  })
                }).then(({ data }) => {
                  this.openWebConsole(obj, data)
                })
              }

              options.push({
                label: `SSH ${ipAddr}`,
                action: () => {
                  openWebconsole(22)
                },
                meta,
              })
              options.push({
                label: i18n.t('compute.text_345', [ipAddr]),
                action: () => {
                  this.createDialog('SmartFormDialog', {
                    title: i18n.t('compute.text_346'),
                    data: [obj],
                    callback: async (data) => {
                      openWebconsole(data.port)
                    },
                    decorators: {
                      port: [
                        'port',
                        {
                          validateFirst: true,
                          rules: [
                            { required: true, message: i18n.t('compute.text_347') },
                            {
                              validator: (rule, value, _callback) => {
                                const num = parseFloat(value)
                                if (!/^\d+$/.test(value) || !num || num > 65535) {
                                  _callback(i18n.t('compute.text_348'))
                                }
                                _callback()
                              },
                            },
                          ],
                        },
                        {
                          label: i18n.t('compute.text_349'),
                          placeholder: i18n.t('compute.text_350'),
                        },
                      ],
                    },
                  })
                },
                meta,
              })
            })
            return options
          }

          const ipInfoList = []
          if (obj.eip) {
            obj.eip.split(',').filter(item => !!item).map(ip => {
              ipInfoList.push({
                actionType: 'EIP SSH',
                ipType: 'eip',
                ipAddr: ip,
              })
            })
          }
          if (obj.nics) {
            obj.nics.map(nic => {
              if (obj.provider === 'OneCloud' || obj.vpc_id === 'default') {
                ipInfoList.push({
                  actionType: 'IP SSH',
                  ipType: 'nicIP',
                  ipAddr: nic.ip_addr,
                  vpcId: nic.vpc_id,
                  provider: obj.provider,
                })
              }
            })
          }
          const sshActions = mapIpActions(ipInfoList)
          ret = ret.concat(sshActions)
          return ret
        },
        meta: (obj) => {
          let ret = {
            validate: true,
            tooltip: null,
          }
          ret = this.$isValidateResourceLock(obj)
          return ret
        },
        hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_web_console'),
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
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_syncstatus'),
                },
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
                      validate: obj.status === 'ready' && !commonUnabled(obj),
                    }
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
                },
                {
                  label: i18n.t('compute.text_273'),
                  permission: 'server_perform_stop',
                  action: () => {
                    this.createDialog('VmShutDownDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    return {
                      validate: obj.status === 'running' && !commonUnabled(obj),
                    }
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop'),
                },
                {
                  label: i18n.t('compute.text_274'),
                  permission: 'server_perform_restart',
                  action: () => {
                    this.createDialog('VmRestartDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    return {
                      validate: (obj.status === 'running' || obj.status === 'stop_fail') && !commonUnabled(obj),
                    }
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_restart'),
                },
                {
                  label: i18n.t('compute.text_354'),
                  permission: 'server_perform_reset',
                  action: () => {
                    this.createDialog('VmResetDialog', {
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
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    return {
                      validate: (obj.status === 'running' || obj.status === 'stop_fail') && !commonUnabled(obj),
                    }
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_reset'),
                },
                {
                  label: i18n.t('compute.text_1128'),
                  permission: 'server_perform_suspend',
                  action: () => {
                    this.createDialog('VmSuspendDialog', {
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
                    if (obj.hypervisor !== typeClouds.hypervisorMap.esxi.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (obj.status !== 'running') {
                      ret.validate = false
                      ret.tooltip = i18n.t('compute.text_1130')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_suspend'),
                },
                {
                  label: i18n.t('compute.text_478'),
                  permission: 'server_perform_resume',
                  action: () => {
                    this.createDialog('VmResumeDialog', {
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
                    if (obj.hypervisor !== typeClouds.hypervisorMap.esxi.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (obj.status !== 'suspend') {
                      ret.validate = false
                      ret.tooltip = i18n.t('compute.text_1131')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_resume'),
                },
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
                    const provider = obj.provider
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
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
                {
                  label: i18n.t('compute.text_247'),
                  permission: 'server_update',
                  action: () => {
                    this.createDialog('VmUpdateDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: (row) => {
                    const isOneCloud = row.brand === 'OneCloud'
                    const provider = obj.provider
                    return {
                      validate: isOneCloud,
                      tooltip: !isOneCloud && i18n.t('compute.text_473', [PROVIDER_MAP[provider].label]),
                    }
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_update'),
                },
                {
                  label: i18n.t('compute.text_357'),
                  permission: 'server_perform_rebuild_root',
                  action: () => {
                    this.createDialog('VmRebuildRootDialog', {
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
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('rebuildRoot', obj)
                    ret.tooltip = cloudUnabledTip('rebuildRoot', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_rebuild_root'),
                },
                {
                  label: i18n.t('compute.text_1100'),
                  permission: 'server_perform_change_config',
                  action: () => {
                    this.$openNewWindowForMenuHook('vminstance_configured_callback_address.adjust_configuration_callback_address', () => {
                      this.$router.push({
                        name: 'VMInstanceAdjustConfig',
                        query: {
                          id: obj.id,
                        },
                      })
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = i18n.t('compute.text_1111')
                      return ret
                    }
                    if (obj.os_arch === HOST_CPU_ARCHS.arm.key && obj.status === 'running') {
                      ret.tooltip = i18n.t('compute.text_1371')
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('adjustConfig', obj)
                    ret.tooltip = cloudUnabledTip('adjustConfig', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_config'),
                },
                {
                  label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                  permission: 'server_perform_change_owner',
                  action: () => {
                    this.createDialog('ChangeOwenrDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      name: this.$t('dictionary.server'),
                      resource: 'servers',
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('compute.text_613')
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_owner'),
                },
                {
                  label: i18n.t('compute.text_1276'),
                  permission: 'snapshots_create',
                  action: () => {
                    this.$openNewWindowForMenuHook('vminstance_configured_callback_address.create_snapshot_callback_address', () => {
                      this.createDialog('VmSnapshotCreateDialog', {
                        data: [obj],
                        columns: this.columns,
                        onManager: this.onManager,
                        refresh: this.refresh,
                      })
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.is_prepaid_recycle) {
                      ret.tooltip = i18n.t('compute.text_285')
                      return ret
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = i18n.t('compute.text_1277')
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('createSnapshot', obj)
                    ret.tooltip = cloudUnabledTip('createSnapshot', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_create_snapshot'),
                },
                // {
                //   label: '加入资源池',
                //   action: () => {
                //     this.createDialog('VmJoinResourceDialog', {
                //       data: [obj],
                //       columns: this.columns,
                //       onManager: this.onManager,
                //     })
                //   },
                //   meta: () => {
                //     const ret = {
                //       validate: false,
                //       tooltip: null,
                //     }
                //     if (!this.isAdminMode && !this.isDomainMode) {
                //       return ret
                //     }
                //     if (commonUnabled(obj)) return ret
                //     if (findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                //       ret.tooltip = '仅公有云支持此操作'
                //       return ret
                //     }
                //     if (obj.billing_type !== 'prepaid') {
                //       ret.tooltip = '仅包年包月的资源支持此操作'
                //       return ret
                //     }
                //     ret.validate = true
                //     return ret
                //   },
                // },
                // 创建相同配置
                {
                  label: i18n.t('compute.text_359'),
                  permission: 'server_create',
                  action: () => {
                    this.$openNewWindowForMenuHook('vminstance_configured_callback_address.create_same_configuration_callback_address', () => {
                      this.createDialog('VmCloneDialog', {
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
                    if (obj.is_prepaid_recycle) {
                      ret.tooltip = i18n.t('compute.text_285')
                      return ret
                    }
                    if (obj.hypervisor !== 'kvm' && findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                      ret.tooltip = i18n.t('compute.text_1278')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_create_same_config'),
                },
                {
                  label: i18n.t('compute.text_1112'),
                  permission: 'attach-isolated-device,server_perform_detach_isolated_device,server_perform_set_isolated_device',
                  action: () => {
                    this.createDialog('VmAttachGpuDialog', {
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
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('compute.text_1279', [i18n.t('dictionary.domain')])
                      return ret
                    }
                    if (findPlatform(obj.hypervisor, 'hypervisor') !== SERVER_TYPE.idc) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    ret.validate = cloudEnabled('acttachGpu', obj)
                    ret.tooltip = cloudUnabledTip('acttachGpu', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_gpu'),
                },
                {
                  label: i18n.t('compute.text_1399'),
                  permission: 'attach-isolated-device,server_perform_detach_isolated_device,server_perform_set_isolated_device',
                  action: () => {
                    this.createDialog('VmAttachUsbDialog', {
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
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('compute.text_1279', [i18n.t('dictionary.domain')])
                      return ret
                    }
                    if (findPlatform(obj.hypervisor, 'hypervisor') !== SERVER_TYPE.idc) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    ret.validate = cloudEnabled('acttachUsb', obj)
                    ret.tooltip = cloudUnabledTip('acttachUsb', obj)
                    return ret
                  },
                  hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_usb'),
                },
                {
                  label: i18n.t('compute.text_1249'),
                  permission: 'server_perform_io_throttle',
                  action: () => {
                    this.createDialog('VmSetSpeedDialog', {
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
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (obj.status !== 'running') {
                      ret.tooltip = i18n.t('compute.text_1282')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_disk_speed'),
                },
                {
                  label: i18n.t('compute.text_1132'),
                  permission: 'server_perform_cancel_expire',
                  action: () => {
                    this.createDialog('SetDurationDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      alert: this.$t('compute.text_1391'),
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.billing_type === 'prepaid') {
                      ret.tooltip = i18n.t('compute.text_285')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_cancel_expire'),
                },
                {
                  label: i18n.t('compute.text_1208'),
                  permission: 'server_perform_snapshot_and_clone',
                  action: () => {
                    this.$openNewWindowForMenuHook('vminstance_configured_callback_address.host_clone_callback_address', () => {
                      this.createDialog('VmCloneDeepDialog', {
                        data: [obj],
                        columns: this.columns,
                        onManager: this.onManager,
                        refresh: this.refresh,
                      })
                    })
                  },
                  meta: () => {
                    const provider = obj.provider
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
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
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_clone'),
                },
                {
                  label: i18n.t('compute.text_1181', [i18n.t('dictionary.instancegroup')]),
                  permission: 'server_perform_bind_groups,server_perform_unbind_groups',
                  action: () => {
                    this.createDialog('VmBindInstanceGroupDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                      name: this.$t('dictionary.server'),
                    })
                  },
                  meta: () => {
                    const provider = obj.provider
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
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
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_instancegroup'),
                },
                {
                  label: i18n.t('compute.text_1117'),
                  permission: 'server_perform_renew',
                  action: () => {
                    this.$openNewWindowForMenuHook('vminstance_configured_callback_address.renew_callback_address', () => {
                      this.createDialog('VmResourceFeeDialog', {
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
                    if (findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                      ret.tooltip = i18n.t('compute.text_1118')
                      return ret
                    }
                    if (obj.billing_type !== 'prepaid') {
                      ret.tooltip = i18n.t('compute.text_1119')
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('compute.text_613')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_Renew'),
                },
                {
                  label: i18n.t('compute.text_1120'),
                  permission: 'server_perform_aet_auto_renew',
                  action: () => {
                    this.createDialog('VmResourceRenewFeeDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                      ret.tooltip = i18n.t('compute.text_1118')
                      return ret
                    }
                    if (obj.billing_type !== 'prepaid') {
                      ret.tooltip = i18n.t('compute.text_1119')
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('compute.text_613')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_auto_renewal'),
                },
                // {
                //   label: '保存主机模板',
                //   action: () => {
                //     this.createDialog('VmAddTemplateDialog', {
                //       data: [obj],
                //       columns: this.columns,
                //       onManager: this.onManager,
                //       refresh: this.refresh,
                //     })
                //   },
                // },
              ],
            },
            {
              label: i18n.t('compute.text_360'),
              submenus: [
                {
                  label: i18n.t('compute.text_276'),
                  permission: 'server_perform_deploy',
                  action: () => {
                    this.createDialog('VmResetPasswordDialog', {
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
                    if (commonUnabled(obj)) return ret
                    if (obj.keypair_id && obj.keypair_id.toLowerCase() !== 'none') {
                      ret.tooltip = i18n.t('compute.text_277')
                      return ret
                    }
                    ret.validate = cloudEnabled('resetPassword', obj)
                    ret.tooltip = cloudUnabledTip('resetPassword', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_reset_password'),
                },
                {
                  label: i18n.t('compute.text_361'),
                  permission: 'server_perform_deploy',
                  action: () => {
                    this.createDialog('VmBindKeypairDialog', {
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
                    if (obj.hypervisor === typeClouds.hypervisorMap.openstack.key) {
                      ret.tooltip = i18n.t('compute.text_1284')
                      return ret
                    }
                    if (obj.os_type === 'Windows') {
                      ret.tooltip = i18n.t('compute.text_1285')
                      return ret
                    }
                    const osType = obj.metadata && obj.metadata.os_name
                    if (['aws', 'azure', 'google', 'aliyun'].includes(obj.hypervisor) && osType === 'Windows') {
                      ret.tooltip = i18n.t('compute.text_1285')
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    if (obj.keypair) {
                      ret.tooltip = i18n.t('compute.text_363')
                      return ret
                    }
                    ret.validate = cloudEnabled('bindKeyPair', obj)
                    ret.tooltip = cloudUnabledTip('bindKeyPair', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_bind_key'),
                },
                {
                  label: i18n.t('compute.text_364'),
                  permission: 'server_perform_deploy',
                  action: () => {
                    this.createDialog('VmUnbindKeypairDialog', {
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
                    if (commonUnabled(obj)) return ret
                    if (!obj.keypair) {
                      ret.tooltip = i18n.t('compute.text_365')
                      return ret
                    }
                    ret.validate = cloudEnabled('unBindKeyPair', obj)
                    ret.tooltip = cloudUnabledTip('unBindKeyPair', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_unbind_key'),
                },
                /* 设置免密登录 */
                {
                  label: i18n.t('compute.vminstance.actions.setup_ssh_authentication'),
                  permission: 'server_perform_setup_ssh_proxy',
                  action: () => {
                    this.createDialog('SetupSSHDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: true,
                      tooltip: null,
                    }
                    const isLinux = obj.os_type && obj.os_type.toLowerCase() === 'linux'
                    if (!isLinux) {
                      ret.validate = false
                      ret.tooltip = this.$t('compute.text_362')
                      return ret
                    }
                    if (!commonEnabled(obj, ['running'])) {
                      ret.validate = false
                      ret.tooltip = i18n.t('db.text_156')
                      return ret
                    }
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_setup_ssh_proxy'),
                },
                /* 探测免密登录 */
                {
                  label: i18n.t('compute.vminstance.actions.detect_ssh_authentication'),
                  permission: 'server_perform_detect_ssh_proxy',
                  action: () => {
                    this.createDialog('DetectSSHDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: true,
                      tooltip: null,
                    }
                    if (!commonEnabled(obj, ['running'])) {
                      ret.validate = false
                      ret.tooltip = i18n.t('db.text_156')
                      return ret
                    }
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_detect_ssh_proxy'),
                },
              ],
            },
            {
              label: i18n.t('compute.text_96'),
              submenus: [
                {
                  label: i18n.t('compute.text_1236'),
                  permission: 'server_perform_save_image',
                  action: () => {
                    this.createDialog('VmSaveImageDialog', {
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
                    // if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
                    //   ret.tooltip = i18n.t('compute.text_1286')
                    //   return ret
                    // }
                    const noSupportBrand = [
                      typeClouds.hypervisorMap.openstack.brand,
                      typeClouds.hypervisorMap.zstack.brand,
                      typeClouds.hypervisorMap.dstack.brand,
                      typeClouds.hypervisorMap.ucloud.brand,
                      typeClouds.hypervisorMap.ctyun.brand,
                    ]
                    if (noSupportBrand.includes(obj.brand)) {
                      ret.tooltip = i18n.t('compute.text_1287', [obj.brand])
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = commonEnabled(obj)
                    ret.tooltip = commonTip(obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_save_image'),
                },
                {
                  label: i18n.t('compute.text_366'),
                  permission: 'server_perform_insertiso',
                  action: () => {
                    this.createDialog('VmMountIsoDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const provider = obj.provider
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor === typeClouds.hypervisorMap.esxi.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    if (obj.cdrom) {
                      ret.tooltip = i18n.t('compute.text_1288')
                      return ret
                    }
                    ret.validate = cloudEnabled('insertiso', obj)
                    ret.tooltip = cloudUnabledTip('insertiso', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_mount_iso'),
                },
                {
                  label: i18n.t('compute.text_367'),
                  permission: 'server_perform_ejectiso',
                  action: () => {
                    this.createDialog('VmUnmountIsoDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const provider = obj.provider
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor === typeClouds.hypervisorMap.esxi.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    if (!obj.cdrom) {
                      ret.tooltip = i18n.t('compute.text_1289')
                      return ret
                    }
                    ret.validate = cloudEnabled('ejectiso', obj)
                    ret.tooltip = cloudUnabledTip('ejectiso', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_unmount_iso'),
                },
              ],
            },
            {
              label: i18n.t('compute.text_1290'),
              submenus: [
                {
                  label: i18n.t('compute.text_1116'),
                  permission: 'server_perform_add_secgroup',
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
                    const ret = {
                      validate: cloudEnabled('assignSecgroup', obj),
                      tooltip: cloudUnabledTip('assignSecgroup', obj),
                    }
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_secgroup'),
                },
                {
                  label: i18n.t('compute.text_1179'),
                  permission: 'server_perform_create_eip',
                  action: () => {
                    this.createDialog('VmBindEipDialog', {
                      data: [obj],
                      columns: this.columns,
                      refresh: this.refresh,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (commonUnabled(obj)) return ret
                    if (obj.eip_mode === 'public_ip' && obj.hypervisor !== 'aws') {
                      ret.tooltip = i18n.t('compute.public_ip_tooltip')
                      return ret
                    }
                    if (obj.eip_mode !== 'public_ip' && obj.eip) {
                      ret.tooltip = i18n.t('compute.text_1291')
                      return ret
                    }
                    if (obj.brand === 'OneCloud' && obj.vpc_id === 'default') {
                      ret.tooltip = i18n.t('compute.text_1292')
                      return ret
                    }
                    if (obj.vpc_external_access_mode === 'none') {
                      ret.tooltip = i18n.t('compute.disable_bind_eip')
                      return ret
                    }
                    ret.validate = cloudEnabled('bindEip', obj)
                    ret.tooltip = cloudUnabledTip('bindEip', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_bind_elastic_public_ip'),
                },
                // 解绑弹性公网IP
                {
                  label: i18n.t('compute.text_1264'),
                  permission: 'server_perform_dissociate_eip',
                  action: () => {
                    this.createDialog('VmUnbindEipDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (commonUnabled(obj)) return ret
                    if (obj.eip_mode !== 'elastic_ip') {
                      ret.tooltip = i18n.t('compute.text_1293')
                      return ret
                    }
                    if (obj.eip_mode === 'public_ip') {
                      ret.tooltip = i18n.t('compute.text_1294')
                      return ret
                    }
                    ret.validate = cloudEnabled('unbindEip', obj)
                    ret.tooltip = cloudUnabledTip('unbindEip', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_unbind_elastic_public_ip'),
                },
                {
                  label: i18n.t('compute.text_1121'),
                  permission: 'server_perform_publicip_to_eip',
                  action: () => {
                    this.createDialog('VmPublicIpToEipDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.eip && obj.eip_mode === 'elastic_ip') {
                      ret.tooltip = i18n.t('compute.text_1122')
                      return ret
                    }
                    if (obj.eip_mode !== 'public_ip') {
                      ret.tooltip = i18n.t('compute.text_1123')
                      return ret
                    }
                    ret.validate = cloudEnabled('publicIpToEip', obj)
                    ret.tooltip = cloudUnabledTip('publicIpToEip', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_public_ip_to_eip'),
                },
                {
                  label: i18n.t('compute.text_1124'),
                  permission: 'server_perform_modify_src_check',
                  action: () => {
                    this.createDialog('VmSourceTargetCheckDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const provider = obj.provider
                    const ret = { validate: true, tooltip: null }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
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
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_source_check'),
                },
              ],
            },
            {
              label: i18n.t('compute.text_1295'),
              submenus: [
                {
                  label: i18n.t('compute.text_1162'),
                  permission: 'server_perform_create_backup',
                  action: () => {
                    this.createDialog('VmAddBackupDialog', {
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
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = i18n.t('compute.text_1296')
                      return ret
                    }
                    if (obj.is_gpu) {
                      ret.tooltip = i18n.t('compute.gpu_not_support_add_host')
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('migration.project.error')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_backup'),
                },
                {
                  label: i18n.t('compute.text_1209'),
                  permission: 'server_perform_delete_backup',
                  action: () => {
                    this.createDialog('VmDeleteBackupDialog', {
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
                    if (!obj.backup_host_id) {
                      ret.tooltip = i18n.t('compute.text_1383')
                      return ret
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('migration.project.error')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_delete_backup'),
                },
                {
                  label: i18n.t('compute.text_1127'),
                  permission: 'server_perform_migrate,server_perform_live_migrate',
                  action: () => {
                    this.createDialog('VmTransferDialog', {
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
                    if (obj.backup_host_id) {
                      ret.tooltip = i18n.t('compute.text_1299')
                      return ret
                    }
                    if (obj.is_gpu) {
                      ret.tooltip = i18n.t('compute.text_1300')
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('migration.project.error')
                      return ret
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key && obj.hypervisor !== typeClouds.hypervisorMap.openstack.key) {
                      ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                      return ret
                    }
                    ret.validate = true
                    ret.tooltip = cloudUnabledTip('transfer', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_transfer'),
                },
              ],
            },
            {
              label: i18n.t('compute.perform_delete'),
              submenus: [
                disableDeleteAction(Object.assign(this, {
                  permission: 'server_update',
                }), {
                  name: this.$t('dictionary.server'),
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_set_delete_protection'),
                }),
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
                  meta: () => this.$getDeleteResult(obj),
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
  },
  destroyed () {
    this.webconsoleManager = null
  },
  methods: {
    openWebConsole (obj, data) {
      let connectParams = qs.parse(data.connect_params)
      if (!connectParams.access_token) {
        connectParams = {
          data: data.connect_params,
        }
      } else {
        connectParams = {
          data: Base64.encode(data.connect_params),
        }
      }
      const query = {
        ...connectParams,
        session: data.session,
        hypervisor: obj.hypervisor,
        os_type: obj.os_type,
        ips: obj.ips,
        instanceName: obj.name,
      }
      // const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
      const href = `${this.$store.getters.auth.regions.api_server}/web-console/?${qs.stringify(query)}`
      window.open(href)
    },
    open (obj, url) {
      if (obj.hypervisor === typeClouds.hypervisorMap.esxi.key) {
        protocolCheck(url, () => {
          this.createDialog('VmrcDownload', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        }, () => {
          window.location.href = url
        })
      } else {
        window.open(url)
      }
    },
  },
}
