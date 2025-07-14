import { mapGetters } from 'vuex'
// import { Base64 } from 'js-base64'
import qs from 'qs'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import i18n from '@/locales'
import { SMART_SSH_FORM_DECORATORS } from '@Compute/constants'
import { commonUnabled, cloudEnabled, cloudUnabledTip } from '../../vminstance/utils'
import { solWebConsole, jnlpConsole } from '../../../utils/webconsole'
import { hostServerActions } from '../../../utils/hostActions'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'auth', 'common']),
    enableMFA () {
      return this.userInfo.enable_mfa && this.auth.auth.system_totp_on
    },
    enableWaterMark () {
      const { globalConfig = {} } = this.common
      const { enable_watermark = true } = globalConfig
      return enable_watermark
    },
  },
  destroyed () {
    this.webconsoleManager = null
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')

    this.singleActions = [
      {
        label: i18n.t('compute.text_341'),
        permission: 'server_get_vnc',
        actions: obj => {
          let ret = []
          ret.push(solWebConsole(this.webconsoleManager, obj, this.openWebConsole, this.createDialog))
          const openWebConsole = (params) => {
            this.webconsoleManager.performAction(params).then(({ data }) => {
              const connectParams = qs.parse(data.connect_params)
              // 验证账号密码
              if (connectParams.is_need_login === 'true') {
                this.createDialog('SshAuthDialog', {
                  manager: this.webconsoleManager,
                  params,
                  errorMsg: connectParams.login_error_message,
                  data: { name: obj.name, ip: params.action, id: obj.id, resource: 'servers' },
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
                }
                ret.validate = cloudEnabled(type, obj)
                ret.tooltip = cloudUnabledTip(type, obj)
                return ret
              }
              options.push({
                label: `SSH ${v}`,
                action: () => {
                  const success = () => {
                    const params = {
                      id: 'ssh',
                      action: v,
                      data: {},
                    }
                    openWebConsole(params)
                  }
                  if (this.enableMFA) {
                    this.createDialog('SecretVertifyDialog', {
                      success,
                    })
                  } else {
                    success()
                  }
                },
                meta,
                render: (obj, params, h) => {
                  let styleObj = {
                    padding: '0 10px',
                    fontSize: '12px',
                  }
                  const isRunning = obj.power_states === 'on'
                  if (!isRunning) {
                    styleObj = {
                      ...styleObj,
                      cursor: 'not-allowed',
                      color: 'rgba(0, 0, 0, 0.25)',
                    }
                  }
                  const sshConnectHandle = () => {
                    const success = () => {
                      openWebConsole({
                        action: v,
                        data: { },
                        id: 'ssh',
                      })
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
                      title: i18n.t('compute.custom_ssh_connect', ['SSH']),
                      data: [obj],
                      callback: async (data) => {
                        const pms = {
                          action: v,
                          data: { port: data.port, username: data.username, password: data.password },
                          id: 'ssh',
                        }
                        openWebConsole(pms)
                      },
                      decorators: SMART_SSH_FORM_DECORATORS,
                    })
                  }
                  return <a-tooltip placement="left" title={!isRunning ? i18n.t('compute.text_1282') : ''}>
                    <span style={styleObj} class='d-flex justify-content-between align-items-center'>
                      <span onClick={isRunning ? sshConnectHandle : () => { }}>{`SSH ${v}`}</span>
                      {
                        isRunning ? <span>
                          <a-tooltip title={i18n.t('compute.custom_ssh_connect', ['SSH'])}>
                            <a-icon class="ml-2" type="edit" onClick={isRunning ? sshSettingInfoHandle : () => { }} />
                          </a-tooltip>
                        </span> : null
                      }
                    </span>
                  </a-tooltip>
                },
              })
              // options.push({
              //   label: i18n.t('compute.text_345', [v]),
              //   action: () => {
              //     this.createDialog('SmartFormDialog', {
              //       title: i18n.t('compute.text_346'),
              //       data: [obj],
              //       callback: async (data) => {
              //         const success = () => {
              //           const params = {
              //             action: v,
              //             data,
              //             id: 'ssh',
              //           }
              //           openWebConsole(params)
              //         }
              //         if (this.enableMFA) {
              //           this.createDialog('SecretVertifyDialog', {
              //             success,
              //           })
              //         } else {
              //           success()
              //         }
              //       },
              //       decorators: {
              //         port: [
              //           'port',
              //           {
              //             validateFirst: true,
              //             rules: [
              //               { required: true, message: i18n.t('compute.text_347') },
              //               {
              //                 validator: (rule, value, _callback) => {
              //                   const num = parseFloat(value)
              //                   if (!/^\d+$/.test(value) || !num || num > 65535) {
              //                     _callback(i18n.t('compute.text_348'))
              //                   }
              //                   _callback()
              //                 },
              //               },
              //             ],
              //           },
              //           {
              //             label: i18n.t('compute.text_349'),
              //             placeholder: i18n.t('compute.text_350'),
              //           },
              //         ],
              //       },
              //     })
              //   },
              //   meta,
              // })
            })
            return options
          }
          let eips = (obj.eip || '').split(',').filter(item => !!item)
          let ips = (obj.ips || '').split(',').filter(item => !!item)
          eips = eips.length ? mapIpActions(eips, 'EIP SSH') : []
          ips = ips.length ? mapIpActions(ips, 'IP SSH') : []
          ret = ret.concat(eips).concat(ips)
          ret.push({ ...jnlpConsole(new this.$Manager('servers', 'v2'), obj, this.createDialog), permission: 'server_get_jnlp' })
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
      },
      {
        label: i18n.t('compute.text_352'),
        actions: (obj) => {
          return [
            {
              label: i18n.t('compute.text_353'),
              submenus: hostServerActions(this.onManager, obj, this, false),
            },
            {
              label: i18n.t('compute.text_356'),
              submenus: [
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
                      validate: true,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') {
                      ret.tooltip = i18n.t('compute.tooltip.check_fake_baremetal_server')
                      ret.validate = false
                      return ret
                    }
                    if (obj.status !== 'ready' && obj.status !== 'admin') {
                      ret.tooltip = i18n.t('compute.text_358')
                      ret.validate = false
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('rebuildRoot', { ...obj, brand: 'baremetal' })
                    ret.tooltip = cloudUnabledTip('rebuildRoot', { ...obj, brand: 'baremetal' })
                    return ret
                  },
                },
                {
                  label: i18n.t('compute.perform_sync_status'),
                  permission: 'server_perform_syncstatus',
                  action: () => {
                    this.onManager('performAction', {
                      steadyStatus: Object.values(expectStatus.server).flat(),
                      id: obj.id,
                      managerArgs: {
                        action: 'syncstatus',
                      },
                    })
                  },
                },
                {
                  label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                  permission: 'server_perform_change_owner',
                  action: () => {
                    this.createDialog('ChangeOwenrDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      resource: 'servers',
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
                },
                {
                  label: i18n.t('compute.text_359'),
                  permission: 'server_create',
                  action: () => {
                    this.createDialog('VmCloneDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      type: 'baremetal',
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: true,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') {
                      ret.tooltip = i18n.t('compute.tooltip.check_fake_baremetal_server')
                      ret.validate = false
                      return ret
                    }
                    return ret
                  },
                },
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
                      validate: true,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') {
                      ret.tooltip = i18n.t('compute.tooltip.check_fake_baremetal_server')
                      ret.validate = false
                      return ret
                    }
                    if (obj.keypair_id && obj.keypair_id.toLowerCase() !== 'none') {
                      ret.tooltip = i18n.t('compute.text_277')
                      ret.validate = false
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('resetPassword', { ...obj, brand: 'baremetal' })
                    ret.tooltip = cloudUnabledTip('resetPassword', { ...obj, brand: 'baremetal' })
                    return ret
                  },
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
                      validate: true,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') {
                      ret.tooltip = i18n.t('compute.tooltip.check_fake_baremetal_server')
                      ret.validate = false
                      return ret
                    }
                    if (obj.os_type === 'Windows') {
                      ret.tooltip = i18n.t('compute.text_362')
                      ret.validate = false
                      return ret
                    }
                    if (obj.keypair) {
                      ret.tooltip = i18n.t('compute.text_363')
                      ret.validate = false
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('bindKeyPair', obj)
                    ret.tooltip = cloudUnabledTip('bindKeyPair', obj)
                    return ret
                  },
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
                      validate: true,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') {
                      ret.tooltip = i18n.t('compute.tooltip.check_fake_baremetal_server')
                      ret.validate = false
                      return ret
                    }
                    if (obj.os_type === 'Windows') {
                      ret.tooltip = i18n.t('compute.text_362')
                      ret.validate = false
                      return ret
                    }
                    if (!obj.keypair) {
                      ret.tooltip = i18n.t('compute.text_365')
                      ret.validate = false
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('unBindKeyPair', obj)
                    ret.tooltip = cloudUnabledTip('unBindKeyPair', obj)
                    return ret
                  },
                },
              ],
            },
            {
              label: i18n.t('compute.text_96'),
              submenus: [
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
                    return {
                      validate: obj.cdrom_support && !obj.cdrom,
                    }
                  },
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
                    return {
                      validate: obj.cdrom_support && obj.cdrom,
                    }
                  },
                },
              ],
            },
            {
              label: i18n.t('compute.perform_delete'),
              submenus: [
                disableDeleteAction(this),
                {
                  label: i18n.t('compute.perform_delete'),
                  permission: 'server_delete',
                  action: () => {
                    this.createDialog('DeleteResDialog', {
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (this.isAdminMode && obj.billing_type === 'prepaid') {
                      ret.tooltip = i18n.t('compute.text_285')
                      return ret
                    }
                    if (!obj.can_delete) {
                      ret.tooltip = i18n.t('compute.text_284')
                      return ret
                    }
                    ret.validate = true
                    return ret
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
  },
  methods: {
    openWebConsole (obj, data, protocol) {
      this.$openWebConsole(data)
    },
  },
}
