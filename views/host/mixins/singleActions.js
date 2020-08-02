import { Base64 } from 'js-base64'
import qs from 'qs'
import { typeClouds } from '@/utils/common/hypervisor'
import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  destroyed () {
    this.manager = null
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
  },
  computed: {
    singleActions () {
      const _frontSingleActions = this.frontSingleActions ? this.frontSingleActions.bind(this)() || [] : []
      return _frontSingleActions.concat([
        {
          label: '远程终端',
          actions: obj => {
            const ret = []
            if (obj.host_type === 'baremetal') {
              ret.push({
                label: 'SOL远程终端',
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
                label: `SSH ${ip} 自定义端口`,
                action: () => {
                  this.createDialog('SmartFormDialog', {
                    title: '自定义端口',
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
                            { required: true, message: '请输入端口' },
                            {
                              validator: (rule, value, _callback) => {
                                const num = parseFloat(value)
                                if (!/^\d+$/.test(value) || !num || num > 65535) {
                                  _callback('端口范围在 0-65535 之间')
                                }
                                _callback()
                              },
                            },
                          ],
                        },
                        {
                          label: '端口',
                          placeholder: '请输入端口号',
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
          label: '更多',
          actions: (obj) => {
            return [
              {
                label: '禁用',
                submenus: [
                  ...getEnabledSwitchActions(this, obj),
                ],
              },
              {
                label: '设置',
                submenus: [
                  {
                    label: '调整标签',
                    action: () => {
                      this.createDialog('HostsAdjustLabelDialog', {
                        data: [obj],
                        columns: this.columns,
                        name: this.$t('dictionary.host'),
                        onManager: this.onManager,
                      })
                    },
                  },
                  {
                    label: '调整超售比',
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
                      validate: obj.brand.toLowerCase() !== 'zstack',
                    }),
                  },
                  getDomainChangeOwnerAction(this, {
                    name: this.$t('dictionary.host'),
                    resource: 'hosts',
                  }),
                  getSetPublicAction(this, {
                    name: this.$t('dictionary.host'),
                    scope: 'domain',
                    resource: 'hosts',
                  }),
                  {
                    label: '宕机自动迁移',
                    action: () => {
                      this.createDialog('DowntimeMigrateDialog', {
                        data: [obj],
                        columns: this.columns,
                        onManager: this.onManager,
                        name: '宕机自动迁移',
                        refresh: this.refresh,
                      })
                    },
                    meta: () => {
                      if (obj.provider.toLowerCase() === 'onecloud' && obj.allow_health_check) {
                        return {
                          validate: true,
                        }
                      }
                      return {
                        validate: false,
                        tooltip: obj.provider.toLowerCase() !== 'onecloud' ? '只有OneCloud平台宿主机支持该操作' : '',
                      }
                    },
                  },
                  {
                    label: '回收为物理机',
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
                          tooltip: '必须为KVM类型的宿主机才可回收',
                        }
                      } else if (obj.nonsystem_guests > 0) {
                        return {
                          validate: false,
                          tooltip: '虚拟化机器大于0不可回收',
                        }
                      } else if (obj.enabled) {
                        return {
                          validate: false,
                          tooltip: '已启用的宿主机不可回收',
                        }
                      } else if (!obj.is_baremetal) {
                        return {
                          validate: false,
                          tooltip: '',
                        }
                      }
                      return {
                        validate: true,
                      }
                    },
                  },
                  {
                    label: '进入维护模式',
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
                        validate: ['running', 'maintain_fail'].includes(obj.status),
                        tooltip: obj.status !== 'running' ? '状态为运行中的宿主机支持该操作' : '',
                      }
                    },
                  },
                  {
                    label: '退出维护模式',
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
                        validate: ['maintaining', 'maintain_fail'].includes(obj.status),
                      }
                    },
                  },
                  {
                    label: '设置GPU卡预留资源',
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
                        ret.tooltip = '只有OneCloud宿主机支持此操作'
                        return ret
                      }
                      if (!obj.reserved_resource_for_gpu) {
                        ret.tooltip = '该宿主机没有GPU资源，暂不支持该操作'
                        return ret
                      }
                      return {
                        validate: true,
                      }
                    },
                  },
                ],
              },
              {
                label: '删除',
                submenus: [
                  {
                    label: '删除',
                    action: () => {
                      this.createDialog('DeleteResDialog', {
                        vm: this,
                        data: [obj],
                        columns: this.columns,
                        title: '删除',
                        name: this.$t('dictionary.host'),
                        onManager: this.onManager,
                      })
                    },
                    meta: () => this.$getDeleteResult(obj),
                  },
                ],
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
