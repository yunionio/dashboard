import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import qs from 'qs'
import { SERVER_TYPE } from '@Compute/constants'
import { commonUnabled, cloudEnabled, cloudUnabledTip, commonEnabled, commonTip } from '../utils'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'

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
            label: 'VNC 远程终端',
            action: () => {
              const isValidURL = str => {
                let regex = /(\w+):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!-/]))?/
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
                  open(data.connect_params)
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
            if (!['IP SSH', 'EIP SSH'].includes(type)) throw Error('ssh 类型必须为 IP SSH,EIP SSH 中的一种')
            const options = []
            ipArr.forEach(item => {
              const v = item.ip_addr
              const meta = () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.os_type === 'Windows') {
                  ret.tooltip = 'Windows 不支持 SSH 连接'
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
          let ips = (obj.nics || []).filter(item => {
            return item.vpc_id === 'default'
          })
          eips = eips.length ? mapIpActions(eips, 'EIP SSH') : []
          ips = ips.length ? mapIpActions(ips, 'IP SSH') : []
          ret = ret.concat(eips).concat(ips)
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
                {
                  label: '挂起',
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
                      ret.tooltip = '只有VMware主机支持此操作'
                      return ret
                    }
                    if (obj.status !== 'running') {
                      ret.validate = false
                      ret.tooltip = '请选择开机的机器进行操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '恢复',
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
                      ret.tooltip = '只有VMware主机支持此操作'
                      return ret
                    }
                    if (obj.status !== 'suspend') {
                      ret.validate = false
                      ret.tooltip = '请选择挂起的机器进行操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
              ],
            },
            {
              label: '实例设置',
              submenus: [
                {
                  label: '修改属性',
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
                      tooltip: !isOneCloud && '只有OneCloud主机支持此操作',
                    }
                  },
                },
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
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('rebuildRoot', obj)
                    ret.tooltip = cloudUnabledTip('rebuildRoot', obj)
                    return ret
                  },
                },
                {
                  label: '调整配置',
                  permission: 'server_perform_change_config',
                  action: () => {
                    this.$router.push({
                      name: 'VMInstanceAdjustConfig',
                      query: {
                        id: obj.id,
                      },
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (commonUnabled(obj)) return ret
                    if (obj.billing_type === 'prepaid') {
                      ret.tooltip = this.isAdminMode ? '包年包月机器，不支持此操作' : '包年包月资源池的资源不支持此操作'
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = '高可用机器，不支持此操作'
                    }
                    ret.validate = cloudEnabled('adjustConfig', obj)
                    ret.tooltip = cloudUnabledTip('adjustConfig', obj)
                    return ret
                  },
                },
                {
                  label: `更改${this.$t('dictionary.project')}`,
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
                    if (commonUnabled(obj)) return ret
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '同步状态',
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
                },
                {
                  label: '创建快照',
                  action: () => {
                    this.createDialog('VmSnapshotCreateDialog', {
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
                    if (obj.is_prepaid_recycle) {
                      ret.tooltip = '包年包月机器，不支持此操作'
                      return ret
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = '高可用的机器不支持创建快照'
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('createSnapshot', obj)
                    ret.tooltip = cloudUnabledTip('createSnapshot', obj)
                    return ret
                  },
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
                  label: '创建相同配置',
                  action: () => {
                    this.createDialog('VmCloneDialog', {
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
                    if (obj.is_prepaid_recycle) {
                      ret.tooltip = '包年包月机器，不支持此操作'
                      return ret
                    }
                    if (obj.hypervisor !== 'kvm' && findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                      ret.tooltip = '仅公有云、OneCloud支持此操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '设置GPU卡',
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
                      ret.tooltip = `仅系统或${this.$t('dictionary.domain')}管理员支持该操作`
                      return ret
                    }
                    if (findPlatform(obj.hypervisor, 'hypervisor') !== SERVER_TYPE.idc) {
                      ret.tooltip = '仅本地IDC支持此操作'
                      return ret
                    }
                    ret.validate = cloudEnabled('acttachGpu', obj)
                    ret.tooltip = cloudUnabledTip('acttachGpu', obj)
                    return ret
                  },
                },
                {
                  label: '设置磁盘速度',
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
                      ret.tooltip = '只有OneCloud主机支持此操作'
                      return ret
                    }
                    if (obj.status !== 'running') {
                      ret.tooltip = '仅在运行中状态下支持此操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '到期释放',
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
                      ret.tooltip = '包年包月机器，不支持此操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '主机克隆',
                  action: () => {
                    this.createDialog('VmCloneDeepDialog', {
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
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = '只有OneCloud主机支持此操作'
                      return ret
                    }
                    if (!['running', 'ready'].includes(obj.status)) {
                      ret.tooltip = '只有运行中或关机状态的主机支持此操作'
                      return ret
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = '高可用的主机不支持此操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '加入主机组',
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
                      ret.tooltip = '只有OneCloud主机支持此操作'
                      return ret
                    }
                    if (!['running', 'ready'].includes(obj.status)) {
                      ret.tooltip = '只有运行中或关机状态的主机支持此操作'
                      return ret
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = '高可用的主机不支持此操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '续费',
                  action: () => {
                    this.createDialog('VmResourceFeeDialog', {
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
                    if (findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
                      ret.tooltip = '仅公有云支持此操作'
                      return ret
                    }
                    if (obj.billing_type !== 'prepaid') {
                      ret.tooltip = '仅包年包月的资源支持此操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '自动续费设置',
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
                      ret.tooltip = '仅公有云支持此操作'
                      return ret
                    }
                    if (obj.billing_type !== 'prepaid') {
                      ret.tooltip = '仅包年包月的资源支持此操作'
                      return ret
                    }
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
                    if (obj.hypervisor === typeClouds.hypervisorMap.openstack.key) {
                      ret.tooltip = 'OpenStack机器在创建后不支持该操作'
                      return ret
                    }
                    const osType = obj.metadata && obj.metadata.os_name
                    if (['aws', 'azure', 'google', 'aliyun'].includes(obj.hypervisor) && osType === 'Windows') {
                      ret.tooltip = 'Windows操作系统不支持该功能'
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
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
                    if (commonUnabled(obj)) return ret
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
                  label: '保存镜像',
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
                      ret.tooltip = `公有云不支持该操作`
                      return ret
                    }
                    const noSupportBrand = [
                      typeClouds.hypervisorMap.openstack.brand,
                      typeClouds.hypervisorMap.zstack.brand,
                      typeClouds.hypervisorMap.dstack.brand,
                    ]
                    if (noSupportBrand.includes(obj.brand)) {
                      ret.tooltip = `${obj.brand}暂不支持该操作`
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = commonEnabled(obj)
                    ret.tooltip = commonTip(obj)
                    return ret
                  },
                },
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    if (obj.cdrom) {
                      ret.tooltip = '该服务器已经挂载ISO镜像'
                      return ret
                    }
                    ret.validate = cloudEnabled('insertiso', obj)
                    ret.tooltip = cloudUnabledTip('insertiso', obj)
                    return ret
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
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (findPlatform(obj.hypervisor) === SERVER_TYPE.public) {
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    if (!obj.cdrom) {
                      ret.tooltip = '该服务器未挂载ISO镜像'
                      return ret
                    }
                    ret.validate = cloudEnabled('ejectiso', obj)
                    ret.tooltip = cloudUnabledTip('ejectiso', obj)
                    return ret
                  },
                },
              ],
            },
            {
              label: '网络安全',
              submenus: [
                {
                  label: '关联安全组',
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
                },
                {
                  label: '绑定弹性公网IP',
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
                      ret.tooltip = '已绑定，解绑后重试'
                      return ret
                    }
                    if (obj.brand === 'OneCloud' && obj.vpc_id === 'default') {
                      ret.tooltip = '经典网络的虚拟机不支持此操作'
                      return ret
                    }
                    ret.validate = cloudEnabled('bindEip', obj)
                    ret.tooltip = cloudUnabledTip('bindEip', obj)
                    return ret
                  },
                },
                {
                  label: '解绑弹性公网IP',
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
                      ret.tooltip = '未绑定，无法解绑'
                      return ret
                    }
                    if (obj.eip_mode === 'public_ip') {
                      ret.tooltip = 'Public IP无法解绑'
                      return ret
                    }
                    ret.validate = cloudEnabled('unbindEip', obj)
                    ret.tooltip = cloudUnabledTip('unbindEip', obj)
                    return ret
                  },
                },
                {
                  label: '公网IP转EIP',
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
                      ret.tooltip = '已绑定弹性公网IP的虚拟机不支持该操作'
                      return ret
                    }
                    if (obj.eip_mode !== 'public_ip') {
                      ret.tooltip = '只有已分配公网IP的虚拟机支持该操作'
                      return ret
                    }
                    ret.validate = cloudEnabled('publicIpToEip', obj)
                    ret.tooltip = cloudUnabledTip('publicIpToEip', obj)
                    return ret
                  },
                },
                {
                  label: '设置源/目标检查',
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
                      ret.tooltip = '暂只有OneCloud平台支持该操作'
                      return ret
                    }
                    return ret
                  },
                },
              ],
            },
            {
              label: '高可用',
              submenus: [
                {
                  label: '添加备份机',
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
                      ret.tooltip = '只有OneCloud主机支持此操作'
                      return ret
                    }
                    if (obj.backup_host_id) {
                      ret.tooltip = '已经添加备份机'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '删除备份机',
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
                      ret.tooltip = '只有OneCloud主机支持此操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '切换',
                  action: () => {
                    this.createDialog('VmSwitchBackupDialog', {
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
                    if (obj.backup_host_status !== 'online') {
                      ret.tooltip = '备份机的宿主机离线不允许切换'
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      return ret
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = '只有OneCloud主机支持此操作'
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: '迁移',
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
                      ret.tooltip = '高可用机器不允许迁移'
                      return ret
                    }
                    if (obj.is_gpu) {
                      ret.tooltip = '仅通用型云服务器支持该操作'
                      return ret
                    }
                    if (!this.isAdminMode && !this.isDomainMode) {
                      return ret
                    }
                    if (obj.hypervisor !== typeClouds.hypervisorMap.kvm.key) {
                      ret.tooltip = '只有OneCloud主机支持此操作'
                      return ret
                    }
                    ret.validate = true
                    ret.tooltip = cloudUnabledTip('transfer', obj)
                    return ret
                  },
                },
              ],
            },
            {
              label: '删除',
              submenus: [
                disableDeleteAction(this, {
                  name: this.$t('dictionary.server'),
                }),
                {
                  label: '删除',
                  permission: 'server_delete',
                  action: () => {
                    this.createDialog('DeleteVmDialog', {
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
                  meta: () => this.$getDeleteResult(obj),
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
