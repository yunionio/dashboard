import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import qs from 'qs'
import { commonUnabled, cloudEnabled, cloudUnabledTip } from '../../vminstance/utils'
import { typeClouds } from '@/utils/common/hypervisor'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode']),
  },
  destroyed () {
    this.webconsoleManager = null
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')

    this.singleActions = [
      {
        label: '远程控制',
        actions: obj => {
          let ret = []
          ret.push({
            label: 'SOL 远程终端',
            action: () => {
              this.webconsoleManager.objectRpc({
                methodname: 'DoBaremetalConnect',
                objId: obj.host_id,
              }).then(({ data }) => {
                this.openWebConsole(obj, data)
              })
            },
            meta: () => {
              const ret = {
                validate: obj.status === 'running',
              }
              return ret
            },
          })
          const mapIpActions = (ipArr, type) => {
            if (!['IP SSH', 'EIP SSH'].includes(type)) throw Error('ssh 类型必须为 IP SSH,EIP SSH 中的一种')
            const options = []
            ipArr.forEach(v => {
              const meta = () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.os_type === 'Windows') {
                  ret.tooltip = 'Windows 不支持 SSH 连接'
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
                label: `SSH ${v} 自定义端口`,
                action: () => {
                  this.createDialog('SmartFormDialog', {
                    title: '自定义端口',
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
            return options
          }
          let eips = (obj.eip || '').split(',').filter(item => !!item)
          let ips = (obj.ips || '').split(',').filter(item => !!item)
          eips = eips.length ? mapIpActions(eips, 'EIP SSH') : []
          ips = ips.length ? mapIpActions(ips, 'IP SSH') : []
          ret = ret.concat(eips).concat(ips)
          ret.push({
            label: 'Java控制台',
            action: () => {
              const manager = new this.$Manager('servers', 'v2')
              manager.getSpecific({
                id: obj.id,
                spec: 'jnlp',
              }).then(res => {
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
              label: '实例状态',
              submenus: [
                {
                  label: '开机',
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
                },
                {
                  label: '关机',
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
                },
                {
                  label: '重启',
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
                },
                {
                  label: '重置',
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
                      ret.tooltip = '只有OneCloud主机支持此操作'
                      return ret
                    }
                    return {
                      validate: (obj.status === 'running' || obj.status === 'stop_fail') && !commonUnabled(obj),
                    }
                  },
                },
              ],
            },
            {
              label: '实例设置',
              submenus: [
                {
                  label: '重装系统',
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
                    if (obj.status !== 'ready') {
                      ret.tooltip = '仅在云服务器状态为【关机】下可以进行该操作'
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('rebuildRoot', obj)
                    ret.tooltip = cloudUnabledTip('rebuildRoot', obj)
                    return ret
                  },
                },
                {
                  label: '同步状态',
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
                  label: `更改${this.$t('dictionary.project')}`,
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
                  label: '创建相同配置',
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
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') ret.validate = false
                    ret.validate = true
                    return ret
                  },
                },
              ],
            },
            {
              label: '密码密钥',
              submenus: [
                {
                  label: '重置密码',
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
                    if (obj.metadata.is_fake_baremetal_server === 'true') return ret
                    if (commonUnabled(obj)) return ret
                    if (obj.keypair_id && obj.keypair_id.toLowerCase() !== 'none') {
                      ret.tooltip = '已绑定密钥的云服务器无法重置密码'
                      return ret
                    }
                    ret.validate = cloudEnabled('resetPassword', obj)
                    ret.tooltip = cloudUnabledTip('resetPassword', obj)
                    return ret
                  },
                },
                {
                  label: '绑定密钥',
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
                    if (obj.metadata.is_fake_baremetal_server === 'true') return ret
                    if (commonUnabled(obj)) return ret
                    if (obj.os_type === 'Windows') {
                      ret.tooltip = 'Windows系统不支持该功能'
                      return ret
                    }
                    if (obj.keypair) {
                      ret.tooltip = '该服务器已关联密钥'
                      return ret
                    }
                    ret.validate = cloudEnabled('bindKeyPair', obj)
                    ret.tooltip = cloudUnabledTip('bindKeyPair', obj)
                    return ret
                  },
                },
                {
                  label: '解绑密钥',
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
                    if (obj.metadata.is_fake_baremetal_server === 'true') return ret
                    if (commonUnabled(obj)) return ret
                    if (obj.os_type === 'Windows') {
                      ret.tooltip = 'Windows系统不支持该功能'
                      return ret
                    }
                    if (!obj.keypair) {
                      ret.tooltip = '该服务器未关联密钥'
                      return ret
                    }
                    ret.validate = cloudEnabled('unBindKeyPair', obj)
                    ret.tooltip = cloudUnabledTip('unBindKeyPair', obj)
                    return ret
                  },
                },
              ],
            },
            {
              label: '镜像',
              submenus: [
                {
                  label: '挂载ISO',
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
                  label: '卸载ISO',
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
              label: '删除',
              submenus: [
                disableDeleteAction(this),
                {
                  label: '删除',
                  permission: 'server_delete',
                  action: () => {
                    this.createDialog('DeleteResDialog', {
                      vm: this,
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      title: '删除',
                      success: () => {
                        this.destroySidePages()
                      },
                    })
                  },
                  meta: () => {
                    let ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (this.isAdminMode && obj.billing_type === 'prepaid') {
                      ret.tooltip = '包年包月机器，不支持此操作'
                      return ret
                    }
                    if (!obj.can_delete) {
                      ret.tooltip = '点击【修改属性】解除删除保护后，重试'
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
