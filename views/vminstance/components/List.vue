<template>
  <page-list
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import qs from 'qs'
import { mapGetters } from 'vuex'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { SERVER_TYPE } from '@Compute/constants'
import { commonUnabled, cloudEnabled, cloudUnabledTip, commonEnabled, commonTip } from '../utils'
import { Manager } from '@/utils/manager'
import { sizestr } from '@/utils/utils'
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getCopyWithContentTableColumn,
  getIpsTableColumn,
  getNameDescriptionTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getBrandFilter,
  getStatusFilter,
  getTenantFilter,
  getAccountFilter,
  getIpFilter,
  getHostFilter,
} from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import SystemIcon from '@/sections/SystemIcon'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import { typeClouds, findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceList',
  mixins: [WindowsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter('compute_engine_brands'),
          ips: getIpFilter(),
          status: getStatusFilter('server'),
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
              return `os_type.contains("${val}")`
            },
          },
          tenant: getTenantFilter(),
          billing_type: {
            label: '计费方式',
            dropdown: true,
            items: [
              { label: '按量付费', key: 'postpaid' },
              { label: '包年包月', key: 'prepaid' },
            ],
          },
          account: getAccountFilter(),
          host: getHostFilter(),
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
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
          addBackup: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'VmInstanceSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getTagTableColumn({ vm: this, needExt: true }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'instance_type',
          title: '配置',
          showOverflow: 'ellipsis',
          minWidth: 120,
          sortable: true,
          slots: {
            default: ({ row }) => {
              let ret = []
              if (row.instance_type) {
                ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        {
          field: 'os_type',
          title: '系统',
          width: 50,
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
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
            },
          },
        },
        {
          field: 'secgroups',
          title: '安全组',
          width: 80,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue = [] }) => {
            return cellValue.map(item => item.name).join(',')
          },
        },
        {
          field: 'billing_type',
          title: '计费方式',
          width: 100,
          showOverflow: 'ellipsis',
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
        getCopyWithContentTableColumn({ field: 'host', title: '宿主机', sortable: true }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.$router.push({
              path: '/vminstance/create',
              query: {
                type: this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv || 'idc',
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '开机',
          permission: 'server_perform_start',
          action: () => {
            const ids = this.list.selectedItems.map(item => item.id)
            this.list.onManager('batchPerformAction', {
              steadyStatus: 'running',
              id: ids,
              managerArgs: {
                action: 'start',
              },
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => item.status === 'ready')
            return ret
          },
        },
        {
          label: '关机',
          permission: 'server_perform_stop',
          action: () => {
            this.createDialog('VmShutDownDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => item.status === 'running')
            return ret
          },
        },
        {
          label: '重启',
          permission: 'server_perform_restart',
          action: () => {
            this.createDialog('VmRestartDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0 && this.list.selectedItems.every(item => ['running', 'stop_fail'].includes(item.status))
            return ret
          },
        },
        {
          label: '批量操作',
          actions: () => {
            return [
              {
                label: '修改属性',
                action: () => {
                  this.createDialog('VmUpdateDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },

              },
              {
                label: '重置密码',
                permission: 'server_perform_deploy',
                action: () => {
                  this.createDialog('VmResetPasswordDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (this.list.selectedItems.some(item => item.status !== 'ready')) {
                    ret.validate = false
                    ret.tooltip = '仅在云服务器状态为【关机】下可以进行该操作'
                  }
                  return ret
                },
              },
              {
                label: '调整配置',
                permission: 'server_perform_change_config',
                action: () => {
                  this.createDialog('VmAdjustConfigDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (this.isSameHyper) {
                    ret.validate = cloudEnabled('adjustConfig', this.list.selectedItems)
                    ret.tooltip = cloudUnabledTip('adjustConfig', this.list.selectedItems)
                    return ret
                  }
                  ret.validate = false
                  ret.tooltip = '请选择同一平台下的资源'
                  return ret
                },
              },
              {
                label: '更改项目',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const domains = this.list.selectedItems.map(item => item.domain_id)
                  if (R.uniq(domains).length !== 1) {
                    ret.validate = false
                    ret.tooltip = '请选择同一个域下的机器'
                    return ret
                  }
                  return ret
                },
              },
              {
                label: '同步状态',
                action: () => {
                  this.list.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: '设置GPU卡',
                action: () => {
                  this.createDialog('VmAttachGpuDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const isAllReady = this.list.selectedItems.every((item) => { return item.status === 'ready' })
                  const isAllIdc = this.list.selectedItems.every((item) => {
                    return findPlatform(item.hypervisor, 'hypervisor') === SERVER_TYPE.idc && this.isAdminMode
                  })
                  // 如果是 VMware提示不支持
                  const isSomeVMware = this.list.selectedItems.some((item) => {
                    return item.hypervisor === 'esxi'
                  })
                  if (!isAllReady) {
                    ret.validate = false
                    ret.tooltip = '请选择关机的机器进行操作'
                    return ret
                  }
                  if (!isAllIdc) {
                    ret.validate = false
                    ret.tooltip = '请选择本地IDC的机器进行操作'
                    return ret
                  }
                  if (isSomeVMware) {
                    ret.validate = false
                    ret.tooltip = 'VMware暂不支持该操作'
                    return ret
                  }
                  return ret
                },
              },
              {
                label: '关联安全组',
                permission: 'server_perform_add_secgroup',
                action: () => {
                  this.createDialog('VmSetSecgroupDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: cloudEnabled('assignSecgroup', this.list.selectedItems),
                    tooltip: cloudUnabledTip('assignSecgroup', this.list.selectedItems),
                  }
                  return ret
                },
              },
              {
                label: '加入资源池',
                action: () => {
                  this.createDialog('VmJoinResourceDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const isAllPublic = this.list.selectedItems.every(item => findPlatform(item.hypervisor) === SERVER_TYPE.public)
                  const isAllPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                  if (!isAllPublic) {
                    ret.validate = false
                    ret.tooltip = '仅公有云支持此操作'
                  }
                  if (!isAllPrepaid) {
                    ret.validate = false
                    ret.tooltip = '仅包年包月的资源支持此操作'
                  }
                  return ret
                },
              },
              {
                label: '续费',
                action: () => {
                  this.createDialog('VmResourceFeeDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  const isAllPublic = this.list.selectedItems.every(item => findPlatform(item.hypervisor) === SERVER_TYPE.public)
                  const isAllPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                  if (!isAllPublic) {
                    ret.validate = false
                    ret.tooltip = '仅公有云支持此操作'
                  }
                  if (!isAllPrepaid) {
                    ret.validate = false
                    ret.tooltip = '仅包年包月的资源支持此操作'
                  }
                  return ret
                },
              },
              {
                label: '迁移',
                action: () => {
                  this.createDialog('VmTransferDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  let isOk = this.list.selectedItems.every((item) => {
                    return ['running', 'ready', 'unknown'].includes(item.status)
                  })
                  if (isOk) {
                    isOk = this.list.selectedItems.every((item) => {
                      if (item.status === 'running') {
                        return !item.is_gpu && !item.cdrom
                      }
                      return !item.backup_host_id
                    })
                  }
                  if (!isOk) {
                    ret.validate = false
                    return ret
                  }
                  if (!this.isAdminMode) {
                    ret.validate = false
                    return ret
                  }
                  if (this.list.selectedItems.some(item => item.hypervisor !== 'kvm')) {
                    ret.validate = false
                    return ret
                  }
                  return ret
                },
              },
              {
                label: '挂起',
                permission: 'server_perform_suspend',
                action: () => {
                  this.createDialog('VmSuspendDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const isAllVMware = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.esxi.key)
                  const isAllRunning = this.list.selectedItems.every(item => item.status === 'running')
                  if (!isAllVMware) {
                    ret.validate = false
                    ret.tooltip = '仅VMware支持此操作'
                    return ret
                  }
                  if (!isAllRunning) {
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
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  const isAllVMware = this.list.selectedItems.every(item => item.hypervisor === typeClouds.hypervisorMap.esxi.key)
                  const isAllSuspend = this.list.selectedItems.every(item => item.status === 'suspend')
                  if (!isAllVMware) {
                    ret.validate = false
                    ret.tooltip = '仅VMware支持此操作'
                    return ret
                  }
                  if (!isAllSuspend) {
                    ret.validate = false
                    ret.tooltip = '请选择挂起的机器进行操作'
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
              disableDeleteAction(this),
              {
                label: '删除',
                permission: 'server_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                    title: '删除',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (this.list.selectedItems.some(item => !item.can_delete)) {
                    ret.validate = false
                    return ret
                  }
                  return ret
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
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
                    const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
                    open(href)
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
                      const connectParams = qs.parse(data.connect_params)
                      const query = {
                        ...connectParams,
                        session: data.session,
                        hypervisor: obj.hypervisor,
                        os_type: obj.os_type,
                      }
                      const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
                      open(href)
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
                      list: this.list,
                      callback: async (data) => {
                        await this.webconsoleManager.performAction({
                          id: 'ssh',
                          action: v,
                          data,
                        })
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
                    permission: 'server_perform_stop',
                    action: () => {
                      this.createDialog('VmShutDownDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
                      })
                    },
                  },
                  {
                    label: '重装系统',
                    permission: 'server_perform_rebuild_root',
                    action: () => {
                      this.createDialog('VmRebuildRootDialog', {
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
                      ret.validate = cloudEnabled('rebuildRoot', obj)
                      ret.tooltip = cloudUnabledTip('rebuildRoot', obj)
                      return ret
                    },
                  },
                  {
                    label: '调整配置',
                    permission: 'server_perform_change_config',
                    action: () => {
                      this.createDialog('VmAdjustConfigDialog', {
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
                    label: '更改项目',
                    action: () => {
                      this.createDialog('ChangeOwenrDialog', {
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
                  {
                    label: '创建相同配置',
                    action: () => {
                      this.createDialog('VmCloneDialog', {
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
                      if (obj.status !== 'ready' && obj.status !== 'running') {
                        ret.tooltip = '仅运行中、关机的机器支持此操作'
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
                        list: this.list,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (!this.isAdminMode) {
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
                        list: this.list,
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
                    action: () => {
                      this.createDialog('VmSetDurationDialog', {
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
                      if (obj.billing_type === 'prepaid') {
                        ret.tooltip = '包年包月机器，不支持此操作'
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
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                      this.createDialog('VmBindEipDialog', {
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
                      if (obj.eip && obj.eip_mode !== 'public_ip') {
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
                      this.createDialog('VmUnbindEipDialog', {
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
                        list: this.list,
                      })
                    },
                    meta: () => {
                      const ret = {
                        validate: false,
                        tooltip: null,
                      }
                      if (!this.isAdminMode) {
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
                        list: this.list,
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
                      if (!this.isAdminMode) {
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
                        list: this.list,
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
                      if (!this.isAdminMode) {
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
                        list: this.list,
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
                      if (!this.isAdminMode) {
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
                  disableDeleteAction(this),
                  {
                    label: '删除',
                    permission: 'server_delete',
                    action: () => {
                      this.createDialog('DeleteResDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
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
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode']),
    isSameHyper () {
      if (this.list.selectedItems.length > 0) {
        const arr = this.list.selectedItems.map(v => v.hypervisor)
        const noRepeatArr = Array.from(new Set(arr))
        return noRepeatArr.length === 1
      }
      return true
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('vm-instance-detail')
    this.webconsoleManager = new Manager('webconsole', 'v1')
    this.list.fetchData()
    this.$bus.$on('VMInstanceListSingleUpdate', args => {
      this.list.singleUpdate(...args)
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container)',
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
  },
}
</script>
