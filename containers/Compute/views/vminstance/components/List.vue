<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import qs from 'qs'
import { mapGetters } from 'vuex'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { SERVER_TYPE } from '@Compute/constants'
import { commonUnabled, cloudEnabled, cloudUnabledTip, commonEnabled, commonTip } from '../utils'
import { Manager } from '@/utils/manager'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getCopyWithContentTableColumn, getIpsTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceList',
  mixins: [WindowsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: {
            label: '实例名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: {
            label: '实例状态',
            dropdown: true,
            multiple: true,
            items: [
              { label: '运行中', key: 'running' },
              { label: '关机', key: 'ready' },
              { label: '未知', key: 'unknown' },
              { label: '调度失败', key: 'sched_fail' },
            ],
            filter: true,
            formatter: val => {
              return `status.in(${val.join(',')})`
            },
          },
          brand: {
            label: '平台',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'OneCloud', key: 'OneCloud' },
              { label: 'OpenStack', key: 'OpenStack' },
            ],
          },
          os_type: {
            label: '系统类型',
            dropdown: true,
            multiple: true,
            items: [
              { label: 'Windows', key: 'windows' },
              { label: 'Linux', key: 'linux' },
              { label: 'VMware', key: 'VMWare' },
            ],
            filter: true,
            formatter: val => {
              return `os_type.contains(${val})`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '外部ID', key: 'external_id' },
          { label: '名称', key: 'name' },
          { label: '私网IP', key: 'ips' },
          { label: '外网IP', key: 'eip' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: '内存(MB)', key: 'vmem_size' },
          { label: '磁盘(MB)', key: 'disk' },
          { label: '实例类型', key: 'instance_type' },
          { label: '操作系统', key: 'os_distribution' },
          { label: '状态', key: 'status' },
          { label: '项目', key: 'tenant' },
          { label: '平台', key: 'hypervisor' },
          { label: '宿主机', key: 'host' },
          { label: '云账号', key: 'manager' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '计费方式', key: 'billing_type' },
          { label: '用户标签', key: 'user_tags' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({ addLock: true, vm: this }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'instance_type',
          title: '配置',
          slots: {
            default: ({ row }) => {
              let ret = []
              if (row.instance_type) {
                ret.push(<div style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        {
          field: 'os_type',
          title: '系统',
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = (version.includes(name) ? version : `${name} ${version}`) || '未知' // 去重
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        {
          field: 'password',
          title: '密码',
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
            },
          },
        },
        {
          field: 'secgroups',
          title: '安全组',
          formatter: ({ cellValue }) => {
            return cellValue.map(item => item.name).join(',')
          },
        },
        {
          field: 'billing_type',
          title: '计费方式',
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.billing_type === 'postpaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>按量付费</div>)
              } else if (row.billing_type === 'prepaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>包年包月</div>)
              }
              if (row.expired_at) {
                let dateArr = this.$moment(row.expired_at).fromNow().split(' ')
                let date = dateArr.join('')
                let seconds = this.$moment(row.expired_at).diff(new Date()) / 1000
                let textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
                let text = seconds < 0 ? '已过期' : `${date.substring(0, date.length - 1)}后到期`
                ret.push(<div style={{ color: textColor }}>{ text }</div>)
              }
              return ret
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
        getCopyWithContentTableColumn({ field: 'host', title: '宿主机' }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createServer()
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
      singleActions: [
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
                    const connectParams = qs.parse(data.connect_params)
                    const query = {
                      ...connectParams,
                      session: data.session,
                      hypervisor: obj.hypervisor,
                      os_type: obj.os_type,
                    }
                    const href = `https://console.yunion.cn/web-console?${qs.stringify(query)}`
                    open(href)
                  }
                })
              },
              meta: () => {
                return {
                  validate: true,
                }
              },
            })
            const mapIpActions = (ipArr, type) => {
              if (!['IP SSH', 'EIP SSH'].includes(type)) throw Error('ssh 类型必须为 IP SSH,EIP SSH 中的一种')
              const options = []
              ipArr.forEach(v => {
                options.push({
                  label: `SSH ${v}`,
                  action: () => {
                    this.webconsoleManager.performAction({
                      id: 'ssh',
                      action: v,
                    }).then(({ data }) => {
                      const connectParams = qs.parse(data.connect_params)
                      const query = {
                        ...connectParams,
                        session: data.session,
                        hypervisor: obj.hypervisor,
                        os_type: obj.os_type,
                      }
                      const href = `https://console.yunion.cn/web-console?${qs.stringify(query)}`
                      open(href)
                    })
                  },
                  meta: () => {
                    return {
                      tooltip: obj.os_type === 'Windows' ? 'Windows 不支持 SSH 连接' : null,
                      validate: obj.os_type !== 'Windows',
                    }
                  },
                })
              })
              return options
            }
            let eips = (obj.eip || '').split(',').filter(item => !!item)
            let ips = (obj.ips || '').split(',').filter(item => !!item)
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
                    action: () => {
                      this.list.onManager('performAction', {
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
                    action: () => {
                      this.list.onManager('performAction', {
                        steadyStatus: 'ready',
                        id: obj.id,
                        managerArgs: {
                          action: 'stop',
                        },
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
                    action: () => {
                      this.list.onManager('performAction', {
                        steadyStatus: 'running',
                        id: obj.id,
                        managerArgs: {
                          action: 'restart',
                        },
                      })
                    },
                    meta: () => {
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
                    label: '修改属性',
                    action: () => {
                      this.createDialog('VmUpdateDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
                      })
                    },
                  },
                  {
                    label: '更改项目',
                    action: () => {
                      this.createDialog('VmChangeProjectDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
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
                      this.list.onManager('performAction', {
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
                        list: this.list,
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
                  {
                    label: '续费',
                    action: () => {
                      this.createDialog('VmResourceFeeDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (!this.isAdminMode && !this.isDomainMode) {
                        ret.tooltip = '无权限操作'
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
                    label: '加入资源池',
                    action: () => {
                      this.createDialog('VmJoinResourceDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (!this.isAdminMode && !this.isDomainMode) {
                        ret.tooltip = '无权限操作'
                        return ret
                      }
                      if (commonUnabled(obj)) return ret
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
                        list: this.list,
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
                        list: this.list,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      const osType = obj.metadata && obj.metadata.os_name
                      if (['aws', 'azure'].includes(obj.hypervisor) && osType === 'Windows') {
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
                        list: this.list,
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
                        list: this.list,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
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
                        list: this.list,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
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
                        list: this.list,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
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
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
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
                      // this.createDialog('VmResetPasswordDialog', {
                      //   data: [obj],
                      //   columns: this.columns,
                      //   list: this.list,
                      // })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (commonUnabled(obj)) return ret
                      if (obj.eip) {
                        ret.tooltip = '已绑定，解绑后重试'
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
                      // this.createDialog('VmResetPasswordDialog', {
                      //   data: [obj],
                      //   columns: this.columns,
                      //   list: this.list,
                      // })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (commonUnabled(obj)) return ret
                      if (obj.eip_mode === 'public_ip') {
                        ret.tooltip = 'Public IP无法解绑'
                        return ret
                      }
                      ret.validate = cloudUnabledTip('unbindEip', obj)
                      ret.tooltip = cloudEnabled('unbindEip', obj)
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
                      // this.createDialog('VmResetPasswordDialog', {
                      //   data: [obj],
                      //   columns: this.columns,
                      //   list: this.list,
                      // })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (!this.isAdminMode) {
                        ret.tooltip = '无权限操作'
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
                      // this.createDialog('VmResetPasswordDialog', {
                      //   data: [obj],
                      //   columns: this.columns,
                      //   list: this.list,
                      // })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (!this.isAdminMode) {
                        ret.tooltip = '无权限操作'
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
                      // this.createDialog('VmResetPasswordDialog', {
                      //   data: [obj],
                      //   columns: this.columns,
                      //   list: this.list,
                      // })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (!this.isAdminMode) {
                        ret.tooltip = '无权限操作'
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
                      // this.createDialog('VmResetPasswordDialog', {
                      //   data: [obj],
                      //   columns: this.columns,
                      //   list: this.list,
                      // })
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
                      if (!this.isAdminMode) {
                        ret.tooltip = '无权限操作'
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
                  {
                    label: '删除',
                    action: () => {
                      this.createDialog('DeleteResDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
                        title: '删除',
                      })
                    },
                    meta: () => this.$getDeleteResult(obj),
                  },
                ],
              },
            ]
          },
        },
      ],
    }
  },
  computed: mapGetters(['isAdminMode', 'isDomainMode']),
  created () {
    this.webconsoleManager = new Manager('webconsole', 'v1')
    this.list.fetchData()
  },
  methods: {
    createServer () {
      this.$router.push('/vminstance/create')
    },
    getParams () {
      return {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container)',
      }
    },
  },
}
</script>
