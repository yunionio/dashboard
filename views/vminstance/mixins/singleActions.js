import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import qs from 'qs'
import { commonUnabled, cloudEnabled, cloudUnabledTip, commonEnabled, commonTip } from '../utils'
import { SERVER_TYPE } from '@Compute/constants'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import i18n from '@/locales'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode']),
  },
  data () {
    return {
      readyToBlur: false,
      hashPlugin: false,
      timer: null,
    }
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
          const mapIpActions = (ipArr, type) => {
            if (!['IP SSH', 'EIP SSH'].includes(type)) throw Error(i18n.t('compute.text_343'))
            const options = []
            ipArr.forEach(v => {
              const meta = () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.os_type === 'Windows') {
                  ret.tooltip = i18n.t('compute.text_344')
                  return ret
                }
                ret.validate = cloudEnabled(type, obj)
                ret.tooltip = cloudUnabledTip(type, obj)
                return ret
              }
              options.push({
                label: `SSH ${v}`,
                action: () => {
                  this.webconsoleManager.performAction({
                    id: 'ssh',
                    action: v,
                  }).then(({ data }) => {
                    this.openWebConsole(obj, data)
                  })
                },
                meta,
              })
              options.push({
                label: i18n.t('compute.text_345', [v]),
                action: () => {
                  this.createDialog('SmartFormDialog', {
                    title: i18n.t('compute.text_346'),
                    data: [obj],
                    callback: async (data) => {
                      const response = await this.webconsoleManager.performAction({
                        id: 'ssh',
                        action: v,
                        data,
                      })
                      this.openWebConsole(obj, response.data)
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
          let eips = (obj.eip || '').split(',').filter(item => !!item)
          let ips = (obj.nics || []).filter(item => {
            return item.vpc_id === 'default'
          }).map(item => item.ip_addr)
          eips = eips.length ? mapIpActions(eips, 'EIP SSH') : []
          ips = ips.length ? mapIpActions(ips, 'IP SSH') : []
          ret = ret.concat(eips).concat(ips)
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_355')
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.esxi.key) {
                      ret.tooltip = i18n.t('compute.text_1275')
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.esxi.key) {
                      ret.tooltip = i18n.t('compute.text_1275')
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
                  label: i18n.t('compute.text_282'),
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
              ],
            },
            {
              label: i18n.t('compute.text_356'),
              submenus: [
                {
                  label: i18n.t('compute.text_247'),
                  action: () => {
                    this.createDialog('VmUpdateDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: (row) => {
                    const isOneCloud = row.brand === 'OneCloud'
                    return {
                      validate: isOneCloud,
                      tooltip: !isOneCloud && i18n.t('compute.text_355'),
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
                    if (obj.billing_type === 'prepaid') {
                      ret.tooltip = this.isAdminMode ? i18n.t('compute.text_285') : i18n.t('compute.text_1110')
                      return ret
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = i18n.t('compute.text_1111')
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
                  label: this.$t('compute.text_279', [this.$t('dictionary.project')]),
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
                {
                  label: i18n.t('compute.text_359'),
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
                  action: () => {
                    this.createDialog('VmAttachGpuDialog', {
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
                    if (!this.isAdminMode && !this.isDomainMode) {
                      ret.tooltip = i18n.t('compute.text_1279', [i18n.t('dictionary.domain')])
                      return ret
                    }
                    if (findPlatform(obj.hypervisor, 'hypervisor') !== SERVER_TYPE.idc) {
                      ret.tooltip = i18n.t('compute.text_1281')
                      return ret
                    }
                    ret.validate = cloudEnabled('acttachGpu', obj)
                    ret.tooltip = cloudUnabledTip('acttachGpu', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_gpu'),
                },
                {
                  label: i18n.t('compute.text_1249'),
                  action: () => {
                    this.createDialog('VmSetSpeedDialog', {
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
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_355')
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_355')
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_355')
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
                    if (!this.isAdminMode && !this.isDomainMode) {
                      return ret
                    }
                    if (findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                      ret.tooltip = i18n.t('compute.text_1118')
                      return ret
                    }
                    if (obj.billing_type !== 'prepaid') {
                      ret.tooltip = i18n.t('compute.text_1119')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_Renew'),
                },
                {
                  label: i18n.t('compute.text_1120'),
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
                    if (!this.isAdminMode && !this.isDomainMode) {
                      return ret
                    }
                    if (findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                      ret.tooltip = i18n.t('compute.text_1118')
                      return ret
                    }
                    if (obj.billing_type !== 'prepaid') {
                      ret.tooltip = i18n.t('compute.text_1119')
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
                    if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
                      ret.tooltip = i18n.t('compute.text_1286')
                      return ret
                    }
                    const noSupportBrand = [
                      typeClouds.hypervisorMap.openstack.brand,
                      typeClouds.hypervisorMap.zstack.brand,
                      typeClouds.hypervisorMap.dstack.brand,
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
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
                    if (obj.eip && obj.eip_mode !== 'public_ip') {
                      ret.tooltip = i18n.t('compute.text_1291')
                      return ret
                    }
                    if (obj.brand === 'OneCloud' && obj.vpc_id === 'default') {
                      ret.tooltip = i18n.t('compute.text_1292')
                      return ret
                    }
                    ret.validate = cloudEnabled('bindEip', obj)
                    ret.tooltip = cloudUnabledTip('bindEip', obj)
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_bind_elastic_public_ip'),
                },
                {
                  label: i18n.t('compute.text_1264'),
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
                  action: () => {
                    this.createDialog('VmSourceTargetCheckDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    const ret = { validate: true, tooltip: null }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.validate = false
                      ret.tooltip = i18n.t('compute.text_1125')
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
                  action: () => {
                    this.createDialog('VmAddBackupDialog', {
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
                    if (!this.isAdminMode && !this.isDomainMode) {
                      return ret
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_355')
                      return ret
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = i18n.t('compute.text_1296')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_backup'),
                },
                {
                  label: i18n.t('compute.text_1209'),
                  action: () => {
                    this.createDialog('VmDeleteBackupDialog', {
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
                    if (!obj.backup_host_id) {
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      return ret
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_355')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_delete_backup'),
                },
                {
                  label: i18n.t('compute.text_1127'),
                  action: () => {
                    this.createDialog('VmTransferDialog', {
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
                    if (obj.backup_host_id) {
                      ret.tooltip = i18n.t('compute.text_1299')
                      return ret
                    }
                    if (obj.is_gpu) {
                      ret.tooltip = i18n.t('compute.text_1300')
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      return ret
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = i18n.t('compute.text_355')
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
              label: i18n.t('compute.text_261'),
              submenus: [
                disableDeleteAction(this, {
                  name: this.$t('dictionary.server'),
                  hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_set_delete_protection'),
                }),
                {
                  label: i18n.t('compute.text_261'),
                  permission: 'server_delete',
                  action: () => {
                    this.$openNewWindowForMenuHook('vminstance_configured_callback_address.delete_callback_address', () => {
                      this.createDialog('DeleteVmDialog', {
                        vm: this,
                        data: [obj],
                        columns: this.columns,
                        onManager: this.onManager,
                        title: i18n.t('compute.text_261'),
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
    window.removeEventListener('blur', this.blurHandle)
    clearTimeout(this.timer)
  },
  mounted () {
    window.addEventListener('blur', this.blurHandle)
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
      }
      const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
      window.open(href)
    },
    open (obj, url) {
      if (obj.hypervisor === typeClouds.hypervisorMap.esxi.key) {
        this.readyToBlur = true
        window.location.href = url

        this.timer = setTimeout(() => {
          if (!this.hashPlugin) {
            this.createDialog('VmrcDownload', {
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
            })
          }
        }, 1000)
      } else {
        window.open(url)
      }
    },
    blurHandle () {
      if (this.readyToBlur) {
        this.hashPlugin = true
      }
    },
  },
}
