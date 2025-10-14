import { mapGetters } from 'vuex'
// import { Base64 } from 'js-base64'
import qs from 'qs'
import { typeClouds, getDisabledProvidersActionMeta } from '@/utils/common/hypervisor'
import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import { solWebConsole, jnlpConsole } from '../../../utils/webconsole'

export default {
  destroyed () {
    this.manager = null
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'auth', 'common']),
    enableMFA () {
      return this.userInfo.enable_mfa && this.auth.auth.system_totp_on
    },
    singleActions () {
      const _frontSingleActions = this.frontSingleActions ? this.frontSingleActions.bind(this)() || [] : []
      return _frontSingleActions.concat([
        {
          label: i18n.t('compute.text_567'),
          permission: 'hosts_perform_login_info',
          actions: obj => {
            const ret = []
            if (obj.is_baremetal || obj.host_type === 'baremetal') {
              ret.push(solWebConsole(this.webconsoleManager, obj, this.openWebConsole, this.createDialog))
              ret.push({ ...jnlpConsole(this.onManager, obj, this.createDialog), permission: 'server_get_jnlp' })
            }
            let ips = (obj.server_ips || '').split(',').filter(item => !!item)
            if (obj.access_ip) {
              ips = [obj.access_ip, ...ips]
            }
            const openWebConsole = (params) => {
              this.webconsoleManager.performAction(params).then(({ data }) => {
                const connectParams = qs.parse(data.connect_params)
                // 验证账号密码
                if (connectParams.is_need_login === 'true') {
                  this.createDialog('SshAuthDialog', {
                    manager: this.webconsoleManager,
                    params,
                    errorMsg: connectParams.login_error_message,
                    data: { name: obj.name, ip: params.action },
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
            const actionGenerator = ip => {
              return (sshData) => {
                const success = () => {
                  const params = {
                    action: ip,
                    data: { type: 'host', ...sshData },
                    id: 'ssh',
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
              }
            }
            ips.forEach(ip => {
              const meta = () => ({ validate: true })
              ret.push({
                label: `SSH ${ip}`,
                action: actionGenerator(ip),
                meta,
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              })
              ret.push({
                label: i18n.t('compute.text_345', [ip]),
                action: () => {
                  const success = () => {
                    this.createDialog('SmartFormDialog', {
                      title: i18n.t('compute.text_346'),
                      data: [obj],
                      list: this.list,
                      callback: async (data) => {
                        const success = () => {
                          const params = {
                            action: ip,
                            data: { type: 'host', id: obj.id, ...data },
                            id: 'ssh',
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
                  if (this.enableMFA) {
                    this.createDialog('SecretVertifyDialog', {
                      success,
                    })
                  } else {
                    success()
                  }
                },
                meta,
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              })
            })
            return ret
          },
        },
        {
          label: i18n.t('compute.text_352'),
          actions: (obj) => {
            const ownerDomain = this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId
            return [
              ...getEnabledSwitchActions(this, obj, ['hosts_perform_enable', 'hosts_perform_disable'], {
                actions: [
                  async (obj) => {
                    await this.onManager('batchPerformAction', {
                      id: [obj.id],
                      managerArgs: {
                        action: 'enable',
                      },
                    })
                    this.$store.dispatch('auth/getCapabilities')
                  },
                  async (obj) => {
                    await this.onManager('batchPerformAction', {
                      id: [obj.id],
                      managerArgs: {
                        action: 'disable',
                      },
                    })
                    this.$store.dispatch('auth/getCapabilities')
                  },
                ],
                metas: [
                  () => ({
                    validate: !obj.enabled && ownerDomain,
                  }),
                  () => ({
                    validate: obj.enabled && ownerDomain,
                  }),
                ],
                extraMetas: [
                  obj => {
                    return getDisabledProvidersActionMeta({
                      row: obj,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                  obj => {
                    return getDisabledProvidersActionMeta({
                      row: obj,
                      disabledProviders: ['BingoCloud'],
                    })
                  },
                ],
              }),
              {
                label: i18n.t('compute.text_540'),
                permission: 'hosts_perform_set_schedtag',
                action: () => {
                  this.createDialog('HostsAdjustLabelDialog', {
                    data: [obj],
                    columns: this.columns,
                    name: this.$t('dictionary.host'),
                    onManager: this.onManager,
                  })
                },
                meta: obj => ({
                  validate: ownerDomain,
                }),
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              {
                label: i18n.t('compute.text_513'),
                permission: 'hosts_update,hosts_perform_set_commit_bound',
                action: () => {
                  this.createDialog('HostAdjustOversoldRatioDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.host'),
                    refresh: this.refresh,
                  })
                },
                meta: obj => ({
                  validate: obj.brand.toLowerCase() !== 'zstack' && ownerDomain,
                }),
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.host'),
                resource: 'hosts',
              }, {
                permission: 'hosts_perform_change_owner',
                meta: (obj) => {
                  if (!this.$store.getters.l3PermissionEnable) {
                    return {
                      validate: false,
                      tooltip: i18n.t('common_281'),
                    }
                  }
                  return {
                    validate: ownerDomain,
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.host'),
                scope: 'domain',
                resource: 'hosts',
              }, {
                permission: 'hosts_perform_public',
                meta: function (obj) {
                  return {
                    validate: ownerDomain,
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              }),
              {
                label: i18n.t('compute.text_547'),
                permission: 'hosts_perform_auto_migrate_on_host_down',
                action: () => {
                  this.createDialog('DowntimeMigrateDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    name: i18n.t('compute.text_547'),
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  if (obj.provider.toLowerCase() === 'onecloud' && obj.allow_health_check && ownerDomain) {
                    return {
                      validate: true,
                    }
                  }
                  return {
                    validate: false,
                    tooltip: obj.provider.toLowerCase() !== 'onecloud' ? i18n.t('compute.text_570') : '',
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              {
                label: i18n.t('compute.text_508'),
                permission: 'hosts_perform_undo_convert',
                action: () => {
                  this.createDialog('HostUnconvertDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.host'),
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  if (obj.host_type !== 'hypervisor') {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_510'),
                    }
                  } else if (obj.nonsystem_guests > 0) {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_511'),
                    }
                  } else if (obj.enabled) {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_512'),
                    }
                  } else if (!obj.is_baremetal) {
                    return {
                      validate: false,
                      tooltip: '',
                    }
                  } else if (!ownerDomain) {
                    return {
                      validate: false,
                      tooltip: '',
                    }
                  } else if (obj.cpu_architecture === HOST_CPU_ARCHS.arm.capabilityKey) {
                    return {
                      validate: false,
                      tooltip: i18n.t('compute.text_1364'),
                    }
                  }
                  return {
                    validate: true,
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              {
                label: i18n.t('compute.text_550'),
                permission: 'hosts_perform_host_maintenance',
                action: () => {
                  this.createDialog('HostMaintenanceInDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.host'),
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  if (obj.host_type !== 'hypervisor') {
                    return {
                      validate: false,
                    }
                  }
                  if (obj.host_type === 'hypervisor' && obj.host_status === 'offline') {
                    return {
                      validate: false,
                      tooltip: this.$t('compute.text_1377'),
                    }
                  }
                  return {
                    validate: ['running', 'maintain_fail'].includes(obj.status) && ownerDomain,
                    tooltip: obj.status !== 'running' ? i18n.t('compute.text_571') : '',
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              {
                label: i18n.t('compute.text_559'),
                permission: 'hosts_perform_host_maintenance',
                action: () => {
                  this.createDialog('HostMaintenanceOutDialog', {
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.host'),
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  if (obj.host_type !== 'hypervisor') {
                    return {
                      validate: false,
                    }
                  }
                  return {
                    validate: ['maintaining', 'maintain_fail'].includes(obj.status) && ownerDomain,
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              {
                label: this.$t('compute.host.cpu.revert.resource'),
                action: obj => {
                  this.createDialog('SetHostCpuReserveResourceDialog', {
                    onManager: this.onManager,
                    data: [obj],
                    columns: this.columns,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  if (!ownerDomain) {
                    ret.tooltip = this.$t('compute.host.cpu.revert.share')
                    return ret
                  }
                  if (obj.provider !== typeClouds.providerMap.OneCloud.key) {
                    ret.tooltip = i18n.t('compute.text_515')
                    return ret
                  }
                  if (obj.running_guests > 0) {
                    ret.tooltip = i18n.t('compute.host.cpu.revert.running_guest_tooltip')
                    return ret
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: i18n.t('compute.setup_passthrough_reserve'),
                permission: 'hosts_perform_set_reserved_resource_for_isolated_device',
                action: obj => {
                  this.createDialog('SetHostReserveResourceDialog', {
                    onManager: this.onManager,
                    data: [obj],
                    columns: this.columns,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  if (obj.provider !== typeClouds.providerMap.OneCloud.key) {
                    ret.tooltip = i18n.t('compute.text_515')
                    return ret
                  }
                  if (!obj.reserved_resource_for_gpu) {
                    ret.tooltip = i18n.t('compute.text_516')
                    return ret
                  }
                  return {
                    validate: ownerDomain,
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
              {
                label: i18n.t('compute.perform_delete'),
                permission: 'hosts_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: [obj],
                    columns: this.columns,
                    title: i18n.t('compute.perform_delete'),
                    name: this.$t('dictionary.host'),
                    onManager: this.onManager,
                    success: () => {
                      this.$store.dispatch('auth/getCapabilities')
                    },
                  })
                },
                meta: () => {
                  const deleteResult = this.$getDeleteResult(obj)
                  if (!deleteResult.validate) {
                    return deleteResult
                  }
                  return {
                    validate: ownerDomain,
                  }
                },
                extraMeta: obj => {
                  return getDisabledProvidersActionMeta({
                    row: obj,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              },
            ]
          },
        },
      ])
    },
    enableWaterMark () {
      const { globalConfig = {} } = this.common
      const { enable_watermark = true } = globalConfig
      return enable_watermark
    },
  },
  methods: {
    openWebConsole (obj, data, protocol) {
      // const href = `${this.$appConfig.webConsolePath}${data.access_url.replace(/^.*?web-console\//, '')}`
      const href = `${data.access_url}${data.extra_param_str || ''}`
      window.open(href)
    },
  },
}
