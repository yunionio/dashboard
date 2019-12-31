<template>
  <page-list
    :id="id"
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
import { commonUnabled, cloudEnabled, cloudUnabledTip } from '../../vminstance/utils'
import SystemIcon from '@/sections/SystemIcon'
import { Manager } from '@/utils/manager'
import { sizestr } from '@/utils/utils'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { getProjectTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getIpsTableColumn, getNameDescriptionTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { typeClouds } from '@/utils/common/hypervisor'

export default {
  name: 'BaremetalList',
  mixins: [WindowsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          ips: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `guestnetworks.guest_id(id).ip_addr.contains(${val})`
            },
            jointFilter: true,
          },
          tenant: {
            label: '项目',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'extra_field',
              key: 'tenant',
            },
          },
        },
        steadyStatus: Object.values(expectStatus.server).flat(),
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '私网IP', key: 'ips' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: '内存(MB)', key: 'vmem_size' },
          { label: '磁盘(MB)', key: 'disk' },
          { label: '实例类型', key: 'instance_type' },
          { label: '操作系统', key: 'os_distribution' },
          { label: '状态', key: 'status' },
          { label: '项目', key: 'tenant' },
          { label: '平台', key: 'hypervisor' },
          { label: '云账号', key: 'manager' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
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
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'BaremetalSidePage') }>{ row.name }</side-page-trigger>
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
          field: 'sn',
          title: 'SN',
          width: 50,
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
          field: 'login_account',
          title: '密码',
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getProjectTableColumn(),
        getCopyWithContentTableColumn({ field: 'host', title: '物理机' }),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'server_create',
          action: () => {
            this.$router.push({
              path: '/baremetal/create',
              query: {
                type: 'baremetal',
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
              // {
              //   label: '修改属性',
              //   permission: 'server_update',
              //   action: () => {
              //     this.createDialog('VmUpdateDialog', {
              //       data: this.list.selectedItems,
              //       columns: this.columns,
              //       list: this.list,
              //     })
              //   },
              // },
              disableDeleteAction(this),
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
                  if (this.isSameHyper) {
                    const hasKeypair = this.list.selectedItems.some(obj => obj.keypair_id && obj.keypair_id.toLowerCase() !== 'none')
                    if (hasKeypair) {
                      return {
                        validate: false, // 已绑定密钥的云服务器无法重置密码
                        tooltip: '已绑定密钥的云服务器无法重置密码',
                      }
                    }
                    return {
                      validate: cloudEnabled('resetPassword', this.list.selectedItems),
                      tooltip: cloudUnabledTip('resetPassword', this.list.selectedItems),
                    }
                  }
                  return {
                    validate: false,
                    tooltip: '请选择同一平台下的资源',
                  }
                },
              },
              {
                label: '更改项目',
                permission: 'server_perform_change_owner',
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
                permission: 'server_perform_syncstatus',
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
                label: '编辑标签',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
              },
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
                    ret.tooltip = '点击【修改属性】解除删除保护后，重试'
                    return ret
                  }
                  if (this.list.selectedItems.some(item => item.billing_type === 'prepaid')) {
                    ret.validate = false
                    ret.tooltip = '包年包月机器，不支持此操作'
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
              label: 'SOL 远程终端',
              action: () => {
                this.webconsoleManager.objectRpc({
                  methodname: 'DoBaremetalConnect',
                  objId: obj.host_id,
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
                  meta: () => {
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
            ret.push({
              label: 'Java控制台',
              action: () => {
                const manager = new Manager('servers', 'v2')
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
                ],
              },
              {
                label: '实例设置',
                submenus: [
                  // {
                  //   label: '修改属性',
                  //   action: () => {
                  //     this.createDialog('VmUpdateDialog', {
                  //       data: [obj],
                  //       columns: this.columns,
                  //       list: this.list,
                  //     })
                  //   },
                  // },
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
                      this.list.onManager('performAction', {
                        steadyStatus: ['running', 'ready'],
                        id: obj.id,
                        managerArgs: {
                          action: 'syncstatus',
                        },
                      })
                    },
                  },
                  {
                    label: '更改项目',
                    permission: 'server_perform_change_owner',
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
                    label: '创建相同配置',
                    action: () => {
                      this.createDialog('VmCloneDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                        list: this.list,
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
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
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
  created () {
    this.initSidePageTab('baremetal-detail')
    this.webconsoleManager = new Manager('webconsole', 'v1')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        hypervisor: 'baremetal',
        ...this.getParams,
        details: true,
        with_meta: true,
      }
    },
  },
}
</script>
