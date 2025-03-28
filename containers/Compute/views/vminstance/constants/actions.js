import qs from 'qs'
import { SERVER_TYPE } from '@Compute/constants'
import VncInfoFetcher from '@Compute/sections/VncInfoFetcher'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import i18n from '@/locales'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import { PROVIDER_MAP, BRAND_MAP } from '@/constants'
import { hasSetupKey } from '@/utils/auth'
import { KVM_SHARE_STORAGES } from '@/constants/storage'
import { POLICY_RES_NAME_KEY_MAP } from '@/constants/policy'
import { commonUnabled, cloudEnabled, cloudUnabledTip, commonEnabled, commonTip, validateRescueMode } from '../utils'

const getSingleActions = function () {
  return [
    {
      label: i18n.t('compute.text_341'),
      permission: 'server_get_vnc',
      actions: obj => {
        let ret = []
        const vncRemote = {
          label: i18n.t('compute.text_1274'),
          action: () => {
            const success = () => {
              const isValidURL = str => {
                const regex = /(\w+):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!-/]))?/
                if (!regex.test(str)) {
                  return false
                } else {
                  return true
                }
              }
              const params = {}
              if (obj.hypervisor === typeClouds.hypervisorMap.openstack.key) {
                params.origin = true
              }
              this.webconsoleManager.performAction({
                id: 'server',
                action: obj.id,
                data: params,
              }).then(({ data }) => {
                if (isValidURL(data.connect_params)) {
                  this.open(obj, data.connect_params)
                } else {
                  this.openWebConsole(obj, data)
                }
              })
            }
            if (this.enableMFA) {
              this.createDialog('SecretVertifyDialog', {
                success,
              })
            } else {
              success()
            }
          },
          meta: () => {
            const ret = {
              validate: obj.power_states === 'unknown' ? cloudEnabled('vnc', obj) : obj.power_states === 'on',
              tooltip: obj.power_states === 'unknown' ? cloudUnabledTip('vnc', obj) : '',
            }
            if (cloudEnabled('vnc', obj) === false) {
              ret.validate = false
              ret.tooltip = cloudUnabledTip('vnc', obj)
              return ret
            }
            return ret
          },
        }
        if (obj.provider === 'OneCloud' && obj.status === 'running') {
          vncRemote.render = (obj, params, h) => {
            return <VncInfoFetcher onManager={this.onManager} row={obj} buttonText={i18n.t('compute.text_1274')} buttonProps={params} />
          }
        }
        ret.push(vncRemote)
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
              const rescueModeValid = validateRescueMode(obj)
              if (!rescueModeValid.validate) return rescueModeValid
              // if (obj.os_type === 'Windows') {
              //   ret.tooltip = i18n.t('compute.text_344')
              //   return ret
              // }
              ret.validate = cloudEnabled(actionType, obj)
              ret.tooltip = cloudUnabledTip(actionType, obj)
              return ret
            }

            const openWebconsole = async (port, id) => {
              const params = {
                id: 'ssh',
                action: id,
                data: {
                  id,
                  ip: ipAddr,
                  port: port,
                  type: 'server',
                },
              }
              this.webconsoleManager.performAction(params).then(({ data }) => {
                const connectParams = qs.parse(data.connect_params)
                // 验证账号密码
                if (connectParams.is_need_login === 'true') {
                  this.createDialog('SshAuthDialog', {
                    manager: this.webconsoleManager,
                    params,
                    errorMsg: connectParams.login_error_message,
                    data: { name: obj.name, ip: ipAddr, id: obj.id, resource: 'servers' },
                    success: (data) => {
                      this.openWebConsole(obj, data, 'ws')
                    },
                  })
                  return
                }
                // 无需验证账号密码
                this.openWebConsole(obj, data, 'ws')
              })
            }
            if (obj.os_type !== 'Windows') {
              options.push({
                label: `SSH ${ipAddr}`,
                permission: 'server_perform_list_forward,server_perform_open_forward',
                meta,
                render: (obj, params, h) => {
                  let styleObj = {
                    padding: '0 10px',
                    fontSize: '12px',
                  }
                  const isRunning = obj.power_states === 'on'
                  if (!isRunning || obj.rescue_mode === true) {
                    styleObj = {
                      ...styleObj,
                      cursor: 'not-allowed',
                      color: 'rgba(0, 0, 0, 0.25)',
                    }
                  }
                  const sshConnectHandle = () => {
                    const success = () => {
                      openWebconsole(22, obj.id)
                    }
                    if (this.enableMFA) {
                      this.createDialog('SecretVertifyDialog', {
                        success,
                      })
                    } else {
                      success()
                    }
                  }
                  const sshSettingInfoHandle = () => {
                    this.createDialog('SmartFormDialog', {
                      title: i18n.t('compute.text_346'),
                      data: [obj],
                      callback: async (data) => {
                        openWebconsole(data.port, obj.id)
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
                  }
                  return <a-tooltip placement="left" title={obj.rescue_mode ? i18n.t('compute.start_rescue.validate_tooltip') : !isRunning ? i18n.t('compute.text_1309', [i18n.t('compute.text_574')]) : ''}>
                    <span style={styleObj} class='d-flex justify-content-between align-items-center'>
                      <span onClick={isRunning ? sshConnectHandle : () => { }}>{`SSH ${ipAddr}`}</span>
                      {
                        isRunning ? <span>
                          <a-tooltip title={i18n.t('compute.text_346')}>
                            <a-icon class="ml-2" type="edit" onClick={isRunning ? sshSettingInfoHandle : () => { }} />
                          </a-tooltip>
                        </span> : null
                      }
                    </span>
                  </a-tooltip>
                },
              })
            } else {
              const rdpSettingInfoHandle = () => {
                this.createDialog('SmartFormDialog', {
                  title: i18n.t('compute.text_346'),
                  data: [obj],
                  callback: async (data) => {
                    handleRdpConnect(obj, data.port, 'rdp')
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
              }
              const handleRdpConnect = (obj, port) => {
                const width = window.innerWidth
                const height = window.innerHeight - 37
                const params = {
                  id: 'server-rdp',
                  action: obj.id,
                  data: {
                    host: ipAddr,
                    port: +port,
                    width,
                    height,
                  },
                }
                this.webconsoleManager.performAction(params).then(({ data }) => {
                  this.openWebConsole(obj, data, 'rdp')
                }).catch((ex) => {
                  const { details } = ex.response.data
                  this.createDialog('RdpAuthDialog', {
                    manager: this.webconsoleManager,
                    params,
                    errorMsg: details,
                    data: { name: obj.name, ip: ipAddr },
                    success: (data) => {
                      this.openWebConsole(obj, data, 'rdp')
                    },
                  })
                })
              }
              const rdpConnectHandle = () => {
                const success = () => {
                  handleRdpConnect(obj)
                }
                if (this.enableMFA) {
                  this.createDialog('SecretVertifyDialog', {
                    success,
                  })
                } else {
                  success()
                }
              }
              options.push({
                label: `RDP ${ipAddr}`,
                permission: 'server_perform_list_forward,server_perform_open_forward',
                meta,
                render: (obj, params, h) => {
                  let styleObj = {
                    padding: '0 10px',
                    fontSize: '12px',
                  }
                  const isRunning = obj.power_states === 'on'
                  if (!isRunning || obj.rescue_mode === true) {
                    styleObj = {
                      ...styleObj,
                      cursor: 'not-allowed',
                      color: 'rgba(0, 0, 0, 0.25)',
                    }
                  }
                  return <a-tooltip placement="left" title={obj.rescue_mode ? i18n.t('compute.start_rescue.validate_tooltip') : !isRunning ? i18n.t('compute.text_1309', [i18n.t('compute.text_574')]) : ''}>
                    <span style={styleObj} class='d-flex justify-content-between align-items-center'>
                      <span onClick={isRunning ? rdpConnectHandle : () => { }}>{`RDP ${ipAddr}`}</span>
                      {
                        isRunning ? <span>
                          <a-tooltip title={!isRunning ? '' : i18n.t('compute.text_346')}>
                            <a-icon class="ml-2" type="edit" onClick={isRunning ? rdpSettingInfoHandle : () => { }} />
                          </a-tooltip>
                        </span> : null
                      }
                    </span>
                  </a-tooltip>
                },
              })
            }
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
            if ((obj.provider === 'OneCloud' || obj.vpc_id === 'default' || obj.provider === 'InCloudSphere') && nic.ip_addr) {
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
          // * 实例状态
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
              // 开机
              {
                label: i18n.t('compute.text_272'),
                permission: 'server_perform_start',
                action: (obj) => {
                  this.createDialog('VmStartDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: cloudEnabled('start', obj),
                  }
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
              },
              // 关机
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
                  return { validate: cloudEnabled('stop', obj) }
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop'),
              },
              // 重启
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
                    validate: cloudEnabled('restart', obj),
                  }
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_restart'),
              },
              // 重置
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
                  if (obj.hypervisor === typeClouds.hypervisorMap.bingocloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [typeClouds.hypervisorMap.bingocloud.label])
                    return ret
                  }
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                    return ret
                  }
                  return {
                    validate: (obj.status === 'running' || obj.status === 'stop_fail') && !commonUnabled(obj),
                  }
                },
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_reset'),
              },
              // 挂起
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
                  if (![BRAND_MAP.VMware.key, BRAND_MAP.OneCloud.key].includes(obj.brand)) {
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
                hidden: () => !(hasSetupKey(['vmware'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_suspend'),
              },
              // 恢复
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
                  if (obj.brand !== BRAND_MAP.VMware.key && obj.brand !== BRAND_MAP.OneCloud.key) {
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
                hidden: () => !(hasSetupKey(['vmware'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_resume'),
              },
              // 进入紧急模式
              {
                label: i18n.t('compute.start_rescue'),
                permission: 'server_perform_start_rescue',
                action: () => {
                  this.createDialog('VmStartRescueDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = { validate: true }
                  const provider = obj.provider
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                    return ret
                  }
                  if (obj.rescue_mode === true) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.start_rescue.validate_tooltip')
                    return ret
                  }
                  return ret
                },
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start_rescue'),
              },
              // 退出紧急模式
              {
                label: i18n.t('compute.stop_rescue'),
                permission: 'server_perform_stop_rescue',
                action: () => {
                  this.createDialog('VmStopRescueDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = { validate: true }
                  const provider = obj.provider
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                    return ret
                  }
                  if (obj.rescue_mode !== true) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.stop_rescue.validate_tooltip')
                    return ret
                  }
                  return ret
                },
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop_rescue'),
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
                  const provider = obj.provider
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
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
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_sync_config'),
              },
            ],
          },
          // * 属性设置
          {
            label: i18n.t('compute.text_356'),
            submenus: [
              // 修改属性
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  return {
                    validate: isOneCloud,
                    tooltip: !isOneCloud && i18n.t('compute.text_473', [PROVIDER_MAP[provider].label]),
                  }
                },
                hidden: (row) => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_update'),
              },
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.is_prepaid_recycle) {
                    ret.tooltip = i18n.t('compute.text_285')
                    return ret
                  }
                  if (obj.brand !== BRAND_MAP.OneCloud.key &&
                    obj.hypervisor !== typeClouds.hypervisorMap.esxi.key &&
                    findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                    ret.tooltip = i18n.t('compute.text_473', [typeClouds.hypervisorMap[obj.hypervisor]?.label || ''])
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
                hidden: () => !(hasSetupKey(['onecloud', 'public'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_create_same_config'),
              },
              // 更改项目
              {
                label: i18n.t('compute.perform_change_owner', [i18n.t('dictionary.project')]),
                permission: 'server_perform_change_owner',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    name: i18n.t('dictionary.server'),
                    resource: 'servers',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
              // 到期释放
              {
                label: i18n.t('compute.text_1132'),
                permission: 'server_perform_cancel_expire',
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    alert: i18n.t('compute.text_1391'),
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.billing_type === 'prepaid') {
                    ret.tooltip = i18n.t('compute.text_285')
                    return ret
                  }
                  if (obj.hypervisor === typeClouds.hypervisorMap.bingocloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [typeClouds.hypervisorMap.bingocloud.label])
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_cancel_expire'),
              },
              // 加入反亲和组
              {
                label: i18n.t('compute.text_1181', [i18n.t('dictionary.instancegroup')]),
                permission: 'server_perform_bind_groups,server_perform_unbind_groups',
                action: () => {
                  this.createDialog('VmBindInstanceGroupDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: i18n.t('dictionary.server'),
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
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_instancegroup'),
              },
              // 主机克隆
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
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_clone'),
              },
              // 添加到堡垒机
              {
                label: i18n.t('compute.bastionHost.add_bastion_host'),
                action: () => {
                  this.createDialog('VmAddBastionHostDialog', {
                    data: [obj],
                  })
                },
                meta: () => {
                  const rescueModeValid = validateRescueMode(obj)
                  return rescueModeValid
                },
                hidden: () => !this.$appConfig.isPrivate || this.$store.getters.isSysCE || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_add_to_bastion'),
              },
              // 续费
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
                hidden: () => !(hasSetupKey(['aliyun', 'qcloud', 'huawei', 'ucloud', 'ecloud', 'jdcloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_Renew'),
              },
              // 自动续费设置
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
                hidden: () => !(hasSetupKey(['aliyun', 'qcloud', 'huawei', 'ucloud', 'ecloud', 'jdcloud', 'ctyun'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_auto_renewal'),
              },
              // 更改计费模式
              {
                label: i18n.t('compute.change_billing_type'),
                permission: 'server_perform_change_billing_type',
                action: () => {
                  this.createDialog('VmChangeBillingTypeDialog', {
                    steadyStatus: ['running', 'ready'],
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.brand !== BRAND_MAP.Aliyun.key && obj.brand !== BRAND_MAP.Qcloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[obj.provider].label])
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
                hidden: () => !(hasSetupKey(['aliyun', 'qcloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_billing_type'),
              },
            ],
          },
          // * 配置修改
          {
            label: i18n.t('compute.group_action.update_config'),
            submenus: [
              // 重装系统
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.shutdown_mode === 'stop_charging' && obj.status === 'ready') {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.server.shutdown_mode.tooltip')
                    return ret
                  }
                  if (commonUnabled(obj)) return ret
                  ret.validate = cloudEnabled('rebuildRoot', obj)
                  ret.tooltip = cloudUnabledTip('rebuildRoot', obj)
                  return ret
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_rebuild_root'),
              },
              // 调整配置
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.backup_host_id) {
                    ret.tooltip = i18n.t('compute.text_1111')
                    return ret
                  }
                  if (obj.os_arch === HOST_CPU_ARCHS.arm.key && obj.status === 'running') {
                    ret.tooltip = i18n.t('compute.text_1371')
                    return ret
                  }
                  if (obj.shutdown_mode === 'stop_charging' && obj.status === 'ready') {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.server.shutdown_mode.tooltip')
                    return ret
                  }
                  if (commonUnabled(obj)) return ret
                  ret.validate = cloudEnabled('adjustConfig', obj)
                  ret.tooltip = cloudUnabledTip('adjustConfig', obj)
                  return ret
                },
                hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_config'),
              },
              // 设置GPU卡
              {
                label: i18n.t('compute.text_1112'),
                permission: 'server_perform_set_isolated_device,attach-isolated-device,server_perform_detach_isolated_device',
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_gpu'),
              },
              // 设置USB透传
              {
                label: i18n.t('compute.text_1399'),
                permission: 'server_perform_set_isolated_device,attach-isolated-device,server_perform_detach_isolated_device',
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
              // 修改启动顺序
              {
                label: i18n.t('compute.change_boot_index'),
                permission: 'server_perform_set_boot_index',
                action: () => {
                  this.createDialog('VmChangeBootIndexDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: (row) => {
                  const isOneCloud = row.brand === 'OneCloud'
                  const provider = obj.provider
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  return {
                    validate: isOneCloud,
                    tooltip: !isOneCloud && i18n.t('compute.text_473', [PROVIDER_MAP[provider].label]),
                  }
                },
                hidden: (row) => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_boot_index'),
              },
              // 更换块存储
              {
                label: i18n.t('compute.vminstance.change_disk_storage'),
                permission: 'server_perform_change_storage',
                action: () => {
                  this.createDialog('VmChangeBlockStorageDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const provider = obj.provider
                  const ret = {
                    validate: true,
                  }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                    return ret
                  }
                  return {
                    validate: cloudEnabled('changeBlockStorage', obj),
                    tooltip: cloudUnabledTip('changeBlockStorage', obj),
                  }
                },
                hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_change_disk_storage'),
              },
              // 绑定物理CPU
              {
                label: i18n.t('compute.bind_physical_cpu'),
                permission: 'server_perform_cpuset',
                action: () => {
                  this.createDialog('BindPhysicalCpuDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    alert: i18n.t('compute.text_1391'),
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[obj.provider].label])
                    return ret
                  }
                  return {
                    ...ret,
                    validate: true,
                  }
                },
                hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_cpuset_cores'),
              },
              // 设置磁盘速度
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
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
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_disk_speed'),
              },
            ],
          },
          // * 密码密钥
          {
            label: i18n.t('compute.text_360'),
            submenus: [
              // 重置密码
              {
                label: i18n.t('compute.text_276'),
                permission: 'server_perform_set_password',
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
              // 绑定密钥
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
              // 解绑密钥
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
              // 设置免密登录
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  const isLinux = obj.os_type && obj.os_type.toLowerCase() === 'linux'
                  if (!isLinux) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_362')
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
              // 探测免密登录
              {
                label: i18n.t('compute.vminstance.actions.detect_ssh_authentication'),
                permission: 'server_perform_make_sshable',
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
          // * 镜像与备份
          {
            label: i18n.t('compute.group_action.mirror_backup'),
            submenus: [
              // 保存镜像
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  // if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
                  //   ret.tooltip = i18n.t('compute.text_1286')
                  //   return ret
                  // }
                  const noSupportBrand = [
                    typeClouds.hypervisorMap.openstack?.brand,
                    typeClouds.hypervisorMap.zstack?.brand,
                    // typeClouds.hypervisorMap.dstack?.brand,
                    typeClouds.hypervisorMap.ucloud?.brand,
                    typeClouds.hypervisorMap.ctyun?.brand,
                    typeClouds.hypervisorMap.nutanix?.brand,
                    typeClouds.hypervisorMap.proxmox?.brand,
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
              // 挂载ISO
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
                hidden: () => !(hasSetupKey(['vmware', 'onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_mount_iso'),
              },
              // 卸载ISO
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
                hidden: () => !(hasSetupKey(['vmware', 'onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_unmount_iso'),
              },
              // 创建快照
              {
                label: i18n.t('compute.text_1276'),
                permission: 'snapshots_create,server_perform_instance_backup',
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
              // 创建备份
              {
                label: i18n.t('compute.create_disk_backup2'),
                permission: 'server_perform_instance_backup,diskbackups_create,instancebackups_create',
                action: () => {
                  this.createDialog('VmBackupCreateDialog', {
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.is_prepaid_recycle) {
                    ret.tooltip = i18n.t('compute.text_285')
                    return ret
                  }
                  if (obj.backup_host_id) {
                    ret.tooltip = i18n.t('compute.text_1277')
                    return ret
                  }
                  if (commonUnabled(obj)) return ret
                  ret.validate = cloudEnabled('createBackup', obj)
                  ret.tooltip = cloudUnabledTip('createBackup', obj)
                  return ret
                },
                hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_create_backup'),
              },
            ],
          },
          // * 网络与安全
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
                hidden: () => !(hasSetupKey(['onestack', 'onecloud', 'public', 'openstack', 'dstack', 'zstack', 'apsara', 'cloudpods', 'hcso', 'hcs'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_secgroup'),
              },
              // 绑定eip
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
                hidden: () => !(hasSetupKey(['onestack', 'onecloud', 'public', 'openstack', 'dstack', 'zstack', 'apsara', 'cloudpods', 'hcso', 'hcs'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_bind_elastic_public_ip'),
              },
              // 解绑eip
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
                hidden: () => !(hasSetupKey(['onestack', 'onecloud', 'public', 'openstack', 'dstack', 'zstack', 'apsara', 'cloudpods', 'hcso', 'hcs'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_unbind_elastic_public_ip'),
              },
              // 公网IP转EIP
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
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
                hidden: () => !(hasSetupKey(['aliyun', 'qcloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_public_ip_to_eip'),
              },
              // 设置源/目标检查
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
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_set_source_check'),
              },
              {
                label: i18n.t('compute.add_to_bastion'),
                permission: 'bastion_servers_create',
                action: () => {
                  this.createDialog('VmAddToBastionDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: (obj) => {
                  const ret = { validate: true }
                  if (obj.metadata?.bastion_server) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.already_in_bastion')
                    return ret
                  }
                  if (obj.status !== 'running') {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_1282')
                    return ret
                  }
                  return ret
                },
                hidden: () => {
                  if (!this.$appConfig.isPrivate || this.$isScopedPolicyMenuHidden('sub_hidden_menus.bastion_host')) {
                    return true
                  }
                  return false
                },
              },
              {
                label: i18n.t('compute.remove_from_bastion'),
                permission: 'bastion_servers_delete',
                action: () => {
                  this.createDialog('VmRemoveFromBastionDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: (obj) => {
                  const ret = { validate: true }
                  if (!obj.metadata?.bastion_server) {
                    ret.validate = false
                    return ret
                  }
                  if (!['running', 'ready'].includes(obj.status)) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_1126')
                    return ret
                  }
                  return ret
                },
                hidden: () => {
                  if (!this.$appConfig.isPrivate || this.$isScopedPolicyMenuHidden('sub_hidden_menus.bastion_host')) {
                    return true
                  }
                  return false
                },
              },
            ],
          },
          // * 高可用
          {
            label: i18n.t('compute.text_1295'),
            submenus: [
              // 添加备份机
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[provider].label])
                    return ret
                  }
                  if (!['ready'].includes(obj.status)) {
                    ret.tooltip = i18n.t('compute.text_1308')
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
                  const isLvm = obj.disks_info.some(item => item.storage_type.includes('lvm'))
                  if (isLvm) {
                    ret.tooltip = i18n.t('compute.lvm_shared_storage.validate_tooltip')
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_add_backup'),
              },
              // 删除备份机
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
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (!obj.backup_host_id) {
                    ret.tooltip = i18n.t('compute.text_1383')
                    return ret
                  }
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
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
                hidden: () => !(hasSetupKey(['onecloud'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_delete_backup'),
              },
              // 迁移
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
                  const ret = { validate: true, tooltip: null }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (!this.isAdminMode && !this.isDomainMode) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tooltip.check_domain_permission')
                    return ret
                  }
                  if (!['running', 'ready'].includes(obj.status)) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tooltip.check_status_transfer')
                    return ret
                  }
                  if (obj.backup_host_id) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tooltip.check_backup_host_transfer')
                    return ret
                  }
                  if (obj.is_gpu) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tooltip.check_gpu_transfer')
                    return ret
                  }
                  if (obj.cdrom) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tooltip.check_cdrom_transfer')
                    return ret
                  }
                  ret.validate = cloudEnabled('transfer', obj)
                  ret.tooltip = cloudUnabledTip('transfer', obj)
                  return ret
                },
                hidden: () => !(hasSetupKey(['openstack', 'onecloud', 'vmware'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_transfer'),
              },
              // V2V迁移
              {
                label: i18n.t('compute.v2vtransfer.label'),
                permission: 'server_perform_migrate',
                action: () => {
                  this.createDialog('VmV2vTransferDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    successCallback: this.refresh,
                  })
                },
                meta: () => {
                  const ret = { validate: true, tooltip: null }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (!this.isAdminMode && !this.isDomainMode) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tooltip.check_domain_permission')
                    return ret
                  }
                  if (![BRAND_MAP.Cloudpods.key, BRAND_MAP.VMware.key].includes(obj.brand)) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.brand_support', [`${BRAND_MAP.Cloudpods.label},${BRAND_MAP.VMware.label}`])
                    return ret
                  }
                  if (!['ready'].includes(obj.status)) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tooltip.check_ready_status_transfer')
                    return ret
                  }
                  if (obj.backup_host_id) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.tooltip.check_backup_host_transfer')
                    return ret
                  }
                  if (!obj.ips) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.fill_ip_tooltip')
                    return ret
                  }

                  ret.validate = cloudEnabled('v2vTransfer', obj)
                  ret.tooltip = cloudUnabledTip('v2vTransfer', obj)
                  return ret
                },
                hidden: () => !(hasSetupKey(['vmware'])) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_transfer'),
              },
              // 快速恢复
              {
                label: i18n.t('compute.server.quick.recovery'),
                action: () => {
                  this.createDialog('VmQuickRecoveryDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: '',
                  }
                  const rescueModeValid = validateRescueMode(obj)
                  if (!rescueModeValid.validate) return rescueModeValid
                  if (obj.brand !== BRAND_MAP.OneCloud.key) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.text_473', [PROVIDER_MAP[obj.provider].label])
                    return ret
                  }
                  if (obj.host_service_status !== 'offline') {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.quick.recovery.validate.host_status_tooltip')
                    return ret
                  }
                  const isAllKVMShareStorages = obj.disks_info.every(item => KVM_SHARE_STORAGES.includes(item.storage_type))
                  if (!isAllKVMShareStorages) {
                    ret.validate = false
                    ret.tooltip = i18n.t('compute.quick.recovery.validate.host_status_tooltip')
                    return ret
                  }
                  return ret
                },
                hidden: () => !hasSetupKey(['onecloud']) || this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_migrate'),
              },
            ],
          },
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
