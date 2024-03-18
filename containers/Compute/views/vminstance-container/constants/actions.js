import qs from 'qs'
import { SERVER_TYPE } from '@Compute/constants'
import VncInfoFetcher from '@Compute/sections/VncInfoFetcher'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'
import i18n from '@/locales'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import { PROVIDER_MAP } from '@/constants'
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
                    data: { name: obj.name, ip: ipAddr },
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
