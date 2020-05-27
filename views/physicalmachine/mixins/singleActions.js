import { Base64 } from 'js-base64'
import qs from 'qs'
import expectStatus from '@/constants/expectStatus'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  destroyed () {
    this.manager = null
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
    this.singleActions = [
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
                          { validator: (rule, value, _callback) => {
                            const num = parseFloat(value)
                            if (!/^\d+$/.test(value) || !num || num > 65535) {
                              _callback('端口范围在 0-65535 之间')
                            }
                            _callback()
                          } },
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
          ret.push({
            label: 'Java控制台',
            action: () => {
              return new this.$Manager('hosts').getSpecific({ id: obj.id, spec: 'jnlp' }).then(res => {
                let blob = new Blob([res.data.jnlp], { type: 'application/x-java-jnlp-file' })
                let url = window.URL.createObjectURL(blob)
                let fileName = `${obj.name}.jnlp`
                let linkDom = document.createElement('a')
                linkDom.href = url
                linkDom.setAttribute('download', fileName)
                document.body.appendChild(linkDom)
                linkDom.click()
                document.body.removeChild(linkDom)
                window.URL.revokeObjectURL(url)
              })
            },
          })
          return ret
        },
      },
      {
        label: '更多',
        actions: (obj) => {
          return [
            {
              label: '启用/禁用',
              submenus: [
                {
                  label: '启用',
                  action: () => {
                    this.onManager('performAction', {
                      steadyStatus: 'running',
                      id: obj.id,
                      managerArgs: {
                        action: 'enable',
                      },
                    })
                  },
                  meta: () => ({
                    validate: !obj.enabled,
                    tooltip: obj.enabled ? '请选择已禁用的实例' : '',
                  }),
                },
                {
                  label: '禁用',
                  action: () => {
                    this.onManager('performAction', {
                      steadyStatus: 'ready',
                      id: obj.id,
                      managerArgs: {
                        action: 'disable',
                      },
                    })
                  },
                  meta: () => ({
                    validate: obj.enabled,
                    tooltip: !obj.enabled ? '请选择已启用的实例' : '',
                  }),
                },
              ],
            },
            {
              label: '设置',
              submenus: [
                {
                  label: '调度标签',
                  action: () => {
                    this.createDialog('HostsAdjustLabelDialog', {
                      data: [obj],
                      columns: this.columns,
                      name: this.$t('dictionary.physicalmachine'),
                    })
                  },
                },
                {
                  label: '同步状态',
                  action: () => {
                    this.onManager('batchPerformAction', {
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
                        tooltip: '处于关机状态的物理机不支持该操作',
                      }
                    }
                    return {
                      validate: true,
                    }
                  },
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
                  label: '安装操作系统',
                  action: () => {
                    this.$router.push({
                      path: '/baremetal/create',
                      query: { id: obj.id, type: 'baremetal', zone_id: obj.zone_id, host_id: obj.id, region_id: obj.cloudregion_id },
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
                        tooltip: '请启用物理机后重试',
                      }
                    }
                    if (['running', 'ready'].indexOf(obj.status) < 0) {
                      return {
                        validate: false,
                        tooltip: '处于关机或开机状态下的物理机支持该操作',
                      }
                    }
                    return {
                      validate: true,
                    }
                  },
                },
                {
                  label: '转换为宿主机',
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
                        tooltip: '请启用物理机后重试',
                      }
                    }
                    if (['running', 'ready'].indexOf(obj.status) < 0) {
                      return {
                        validate: false,
                        tooltip: '处于关机或开机状态下的物理机支持该操作',
                      }
                    }
                    return {
                      validate: true,
                    }
                  },
                },
                {
                  label: '同步硬件配置',
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
              ],
            },
            {
              label: '状态',
              submenus: [
                {
                  label: '开机',
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
                  label: '关机',
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
              ],
            },
            {
              label: 'PXE',
              submenus: [
                {
                  label: '进入维护模式',
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
                        tooltip: '处于开机或关机状态物理机支持该操作',
                      }
                    }
                    return {
                      validate: true,
                    }
                  },
                },
                {
                  label: '退出维护模式',
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
                        tooltip: '处于开机或关机状态物理机支持该操作',
                      }
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
                      onManager: this.onManager,
                      title: '删除',
                    })
                  },
                  meta: () => {
                    return {
                      validate: this.$getDeleteResult(obj).validate,
                      tooltip: this.$getDeleteResult(obj).validate ? '' : '操作对象的当前状态不支持该操作: 物理机没有被禁用',
                    }
                  },
                },
              ],
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
      }
      const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
      window.open(href)
    },
  },
}
