import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import qs from 'qs'
import { typeClouds } from '@/utils/common/hypervisor'
import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { HOST_CPU_ARCHS } from '@/constants/compute'

export default {
  destroyed () {
    this.manager = null
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo']),
    singleActions () {
      const _frontSingleActions = this.frontSingleActions ? this.frontSingleActions.bind(this)() || [] : []
      return _frontSingleActions.concat([
        {
          label: i18n.t('compute.text_567'),
          actions: obj => {
            const ret = []
            if (obj.host_type === 'baremetal') {
              ret.push({
                label: i18n.t('compute.text_568'),
                action: () => {
                  this.webconsoleManager.objectRpc({ methodname: 'DoBaremetalConnect', objId: obj.id }).then((res) => {
                    this.openWebConsole(obj, res.data)
                  }).catch((err) => {
                    throw err
                  })
                },
                meta: () => ({
                  validate: obj.status === 'running',
                }),
              })
            }
            let ips = (obj.server_ips || '').split(',').filter(item => !!item)
            if (obj.access_ip) {
              ips = [obj.access_ip, ...ips]
            }
            const actionGenerator = ip => {
              return (sshData) => {
                this.webconsoleManager.performAction({
                  action: ip,
                  data: sshData,
                  id: 'ssh',
                }).then(({ data }) => {
                  this.openWebConsole(obj, data)
                })
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
                },
                meta,
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
              ...getEnabledSwitchActions(this, obj, [], {
                metas: [
                  () => ({
                    validate: !obj.enabled && ownerDomain,
                  }),
                  () => ({
                    validate: obj.enabled && ownerDomain,
                  }),
                ],
              }),
              {
                label: i18n.t('compute.text_540'),
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
              },
              {
                label: i18n.t('compute.text_513'),
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
              },
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.host'),
                resource: 'hosts',
              }, {
                meta: function (obj) {
                  return {
                    validate: ownerDomain,
                  }
                },
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.host'),
                scope: 'domain',
                resource: 'hosts',
              }, {
                meta: function (obj) {
                  return {
                    validate: ownerDomain,
                  }
                },
              }),
              {
                label: i18n.t('compute.text_547'),
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
              },
              {
                label: i18n.t('compute.text_508'),
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
                      tooltip: 'ARM架构宿主机暂不支持该操作',
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: i18n.t('compute.text_550'),
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
                  return {
                    validate: ['running', 'maintain_fail'].includes(obj.status) && ownerDomain,
                    tooltip: obj.status !== 'running' ? i18n.t('compute.text_571') : '',
                  }
                },
              },
              {
                label: i18n.t('compute.text_559'),
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
              },
              {
                label: i18n.t('compute.text_514'),
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
              },
              {
                label: i18n.t('compute.text_261'),
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: [obj],
                    columns: this.columns,
                    title: i18n.t('compute.text_261'),
                    name: this.$t('dictionary.host'),
                    onManager: this.onManager,
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
              },
            ]
          },
        },
      ])
    },
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
  },
}
