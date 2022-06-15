import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import qs from 'qs'
import { canIpmiProbe } from '../utils/status'
import expectStatus from '@/constants/expectStatus'
import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { solWebConsole, jnlpConsole } from '../../../utils/webconsole'

export default {
  destroyed () {
    this.manager = null
  },
  computed: {
    ...mapGetters(['userInfo', 'auth']),
    enableMFA () {
      return this.userInfo.enable_mfa && this.auth.auth.system_totp_on
    },
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
    this.singleActions = [
      {
        label: i18n.t('compute.text_567'),
        actions: obj => {
          const ret = []
          if (obj.host_type === 'baremetal') {
            ret.push(solWebConsole(this.webconsoleManager, obj, this.openWebConsole, this.createDialog))
          }
          let ips = (obj.server_ips || '').split(',').filter(item => !!item)
          if (obj.access_ip) {
            ips = [obj.access_ip, ...ips]
          }
          const actionGenerator = ip => {
            return (sshData) => {
              const success = () => {
                this.webconsoleManager.performAction({
                  action: ip,
                  data: sshData,
                  id: 'ssh',
                }).then(({ data }) => {
                  this.openWebConsole(obj, data)
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
          }
          ips.forEach(ip => {
            const meta = () => ({ validate: obj.status === 'running' })
            ret.push({
              label: `SSH ${ip}`,
              action: actionGenerator(ip),
              meta,
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
                      const response = await this.webconsoleManager.performAction({
                        id: 'ssh',
                        action: ip,
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
            })
          })
          ret.push({ ...jnlpConsole(new this.$Manager('hosts', 'v2'), obj, this.createDialog), permission: 'server_get_jnlp' })
          return ret
        },
      },
      {
        label: i18n.t('compute.text_352'),
        actions: (obj) => {
          return [
            ...getEnabledSwitchActions(Object.assign({}, this, { resource: 'physicalmachine' }), obj, ['hosts_perform_enable', 'hosts_perform_disable'], { resourceName: this.$t('dictionary.physicalmachine') }),
            {
              label: i18n.t('compute.text_541'),
              permission: 'hosts_perform_set_schedtag',
              action: () => {
                this.createDialog('HostsAdjustLabelDialog', {
                  data: [obj],
                  columns: this.columns,
                  name: this.$t('dictionary.physicalmachine'),
                })
              },
            },
            {
              label: i18n.t('compute.perform_sync_status'),
              permission: 'hosts_perform_syncstatus',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus: Object.values(expectStatus.host).flat(),
                  managerArgs: {
                    action: 'syncstatus',
                  },
                })
              },
              meta: () => {
                if (obj.status === 'ready') {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_850'),
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.physicalmachine'),
              resource: 'hosts',
            }, {
              permission: 'hosts_perform_change_owner',
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.physicalmachine'),
              scope: 'domain',
              resource: 'hosts',
            }, {
              permission: 'hosts_perform_public',
            }),
            {
              label: i18n.t('compute.text_298'),
              permission: 'server_create',
              action: () => {
                let wire_id = ''
                if (obj.nic_info) {
                  const arr = obj.nic_info.filter(item => {
                    return item.nic_type !== 'ipmi' && item.wire_id
                  })
                  arr.map(item => {
                    wire_id += `${item.wire_id},`
                  })
                  wire_id = wire_id.substr(0, wire_id.length - 1)
                }
                this.$router.push({
                  path: '/baremetal/create',
                  query: {
                    id: obj.id,
                    type: 'baremetal',
                    zone_id: obj.zone_id,
                    host_id: obj.id,
                    region_id: obj.cloudregion_id,
                    domain_id: obj.domain_id,
                    wire_id,
                  },
                })
              },
              meta: () => {
                if (!obj.is_baremetal) {
                  return {
                    validate: false,
                  }
                }
                if (obj.host_type !== 'baremetal') {
                  return {
                    validate: false,
                  }
                }
                if (obj.server_id) {
                  return {
                    validate: false,
                  }
                }
                if (!obj.enabled) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_851'),
                  }
                }
                if (['running', 'ready'].indexOf(obj.status) < 0) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_852'),
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: i18n.t('compute.text_828'),
              permission: 'hosts_perform_convert_hypervisor',
              action: () => {
                this.createDialog('HostsConvertDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (!obj.is_baremetal) {
                  return {
                    validate: false,
                  }
                }
                if (obj.host_type !== 'baremetal') {
                  return {
                    validate: false,
                  }
                }
                if (obj.server_id) {
                  return {
                    validate: false,
                  }
                }
                if (!obj.enabled) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_851'),
                  }
                }
                if (['running', 'ready'].indexOf(obj.status) < 0) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_852'),
                  }
                }
                if (obj.spec && !obj.spec.disk) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.host_convert'),
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: i18n.t('compute.host_ipmi_probe'),
              permission: 'hosts_perform_ipmi_probe',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus: Object.values(expectStatus.host).flat(),
                  managerArgs: {
                    action: 'ipmi-probe',
                  },
                })
              },
              meta: () => ({ validate: canIpmiProbe(obj) }),
            },
            {
              label: i18n.t('compute.host_prepare'),
              permission: 'hosts_perform_prepare',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus: Object.values(expectStatus.host).flat(),
                  managerArgs: {
                    action: 'prepare',
                  },
                })
              },
              meta: () => ({ validate: obj.can_prepare }),
            },
            {
              label: i18n.t('compute.text_272'),
              permission: 'hosts_perform_start',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus: Object.values(expectStatus.host).flat(),
                  managerArgs: {
                    action: 'start',
                  },
                })
              },
              meta: () => {
                if (obj.server_id && obj.host_type === 'baremetal') {
                  return {
                    validate: false,
                  }
                }
                return {
                  validate: obj.status === 'ready',
                }
              },
            },
            {
              label: i18n.t('compute.text_273'),
              permission: 'hosts_perform_stop',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus: Object.values(expectStatus.host).flat(),
                  managerArgs: {
                    action: 'stop',
                  },
                })
              },
              meta: () => {
                if (!obj.is_baremetal) {
                  return {
                    validate: false,
                  }
                }
                if (obj.server_id && obj.host_type === 'baremetal') {
                  return {
                    validate: false,
                  }
                }
                if (obj.status !== 'running') {
                  return {
                    validate: false,
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: i18n.t('compute.text_550'),
              permission: 'hosts_perform_maintenance',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus: Object.values(expectStatus.host).flat(),
                  managerArgs: {
                    action: 'maintenance',
                  },
                })
              },
              meta: () => {
                if (obj.server) {
                  return {
                    validate: false,
                  }
                }
                if (!obj.is_baremetal) {
                  return {
                    validate: false,
                  }
                }
                if (!obj.server_id) {
                  return {
                    validate: false,
                  }
                }
                if (obj.is_maintenance) {
                  return {
                    validate: false,
                  }
                }
                if (['running', 'ready'].indexOf(obj.status) < 0) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_853'),
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: i18n.t('compute.text_559'),
              permission: 'hosts_perform_unmaintenance',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus: Object.values(expectStatus.host).flat(),
                  managerArgs: {
                    action: 'unmaintenance',
                  },
                })
              },
              meta: () => {
                if (obj.server) {
                  return {
                    validate: false,
                  }
                }
                if (!obj.is_baremetal) {
                  return {
                    validate: false,
                  }
                }
                if (!obj.server_id) {
                  return {
                    validate: false,
                  }
                }
                if (!obj.is_maintenance) {
                  return {
                    validate: false,
                  }
                }
                if (['running', 'ready'].indexOf(obj.status) < 0) {
                  return {
                    validate: false,
                    tooltip: i18n.t('compute.text_853'),
                  }
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: i18n.t('compute.perform_delete'),
              permission: 'hosts_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  name: this.$t('dictionary.physicalmachine'),
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  title: i18n.t('compute.perform_delete'),
                })
              },
              meta: () => {
                return {
                  validate: this.$getDeleteResult(obj).validate,
                  tooltip: this.$getDeleteResult(obj).validate ? '' : i18n.t('compute.text_854'),
                }
              },
            },
          ]
        },
      },
    ]
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
        ips: obj.access_ip,
        instanceName: obj.name,
      }
      // const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
      const href = `${this.$store.getters.auth.regions.api_server}/web-console/?${qs.stringify(query)}`
      window.open(href)
    },
  },
}
