<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import qs from 'qs'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getRegionTableColumn, getStatusTableColumn, getEnabledTableColumn, getNameDescriptionTableColumn, getCopyWithContentTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import { sizestr } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'PhysicalmachineList',
  mixins: [DialogMixin, WindowsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'hosts',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          status: getStatusFilter('host'),
          enabled: getEnabledFilter(),
          sn: {
            label: 'SN',
            distinctField: {
              type: 'extra_field',
              key: 'sn',
            },
          },
          access_ip: {
            label: '管理IP',
            filter: true,
            formatter: val => {
              return `access_ip.contains(${val})`
            },
          },
          ipmi_ip: {
            label: '外带IP',
            filter: true,
            formatter: val => {
              return `ipmi_ip.contains(${val})`
            },
          },
          is_maintenance: {
            label: '维护模式',
            dropdown: true,
            items: [
              { label: '维护模式', key: true },
              { label: '正常', key: false },
            ],
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'PhysicalmachineSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getTagTableColumn({ vm: this, needExt: true }),
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'host' }),
        {
          field: 'custom_ip',
          title: 'IP',
          width: 120,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              let cellWrap = []
              if (row.access_ip) {
                cellWrap.push(<list-body-cell-wrap row={row} field="access_ip" copy />)
              }
              if (row.ipmi_ip) {
                cellWrap.push(<list-body-cell-wrap row={row} field="ipmi_ip" copy />)
              }
              return cellWrap
            },
          },
        },
        {
          field: 'spec',
          title: '规格',
          width: 120,
          showOverflow: 'ellipsis',
          formatter: ({ row }) => {
            if (!row.spec) return '-'
            let g = function (sz, prefix) {
              if (!prefix || prefix.length === 0) {
                prefix = ''
              }
              if (sz && sz > 0) {
                return `${prefix}${sizestr(sz, 'M', 1024)}`
              } else {
                return ''
              }
            }
            let spec = row.spec
            let cpu = ''
            if (spec.cpu && spec.cpu > 0) {
              cpu = `${spec.cpu}C`
            }
            let mem = g(spec.mem)
            let ssd = ''
            let hdd = ''
            if (spec.disk) {
              if (spec.disk.SSD) {
                ssd = 'SSD'
                for (let key in spec.disk.SSD) {
                  ssd += `${g(spec.disk.SSD[key])}x${spec.disk.SSD[key]}`
                }
              }
              if (spec.disk.HDD) {
                hdd = 'HDD'
                for (let key in spec.disk.HDD) {
                  hdd += `${g(key)}x${spec.disk.HDD[key]}`
                }
              }
            }
            let driver = ''
            if (spec && spec.driver && spec.driver !== 'Linux') {
              driver = 'RAID'
            }
            return `${cpu}${mem}${hdd}${ssd}${driver}`
          },
        },
        {
          field: 'manufacture',
          title: '品牌',
          width: 70,
          slots: {
            default: ({ row }) => {
              if (row.sys_info && row.sys_info.oem_name) {
                const imgSrc = require(`../assets/${row.sys_info.oem_name}.svg`)
                return [
                  <img src={ imgSrc } style='width: 25px;' />,
                ]
              }
            },
          },
        },
        getCopyWithContentTableColumn({ field: 'sn', title: 'SN' }),
        getCopyWithContentTableColumn({ field: 'server', title: '分配' }),
        {
          field: 'login_ssh',
          title: '初始账号',
          width: 70,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='baremetal_ssh' />]
            },
          },
        },
        {
          field: 'ipmi',
          title: 'IPMI',
          width: 70,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
            },
          },
        },
        {
          field: 'is_maintenance',
          title: '维护模式',
          width: 70,
          formatter: ({ row }) => {
            return row.is_maintenance ? '维护模式' : '正常'
          },
        },
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '添加',
          action: () => {
            this.$router.push('/physicalmachine/add')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '启用',
          action: () => {
            this.list.batchPerformAction('enable', null, this.list.steadyStatus)
          },
          meta: () => {
            if (this.list.selectedItems.length <= 0) {
              return {
                validate: false,
                tooltip: '请选择已经禁用的实例',
              }
            }
            if (this.list.selectedItems.some(item => item.enabled)) {
              return {
                validate: false,
                tooltip: '请选择已经禁用的实例',
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: '禁用',
          action: () => {
            this.list.batchPerformAction('disable', null, this.list.steadyStatus)
          },
          meta: () => {
            if (this.list.selectedItems.length <= 0) {
              return {
                validate: false,
                tooltip: '请选择已经启用的实例',
              }
            }
            if (this.list.selectedItems.some(item => !item.enabled)) {
              return {
                validate: false,
                tooltip: '请选择已经启用的实例',
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: '批量操作',
          actions: (obj) => {
            return [
              {
                label: '调整标签',
                action: (obj) => {
                  this.createDialog('HostsAdjustLabelDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: '开机',
                action: (obj) => {
                  this.list.batchPerformAction('start', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                      tooltip: '请选择处于关机状态的物理机',
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    let obj = this.list.selectedItems[i]
                    if (!obj.is_baremetal) {
                      return {
                        validate: false,
                        tooltip: '请选择处于关机状态的物理机',
                      }
                    }
                    if (obj.status !== 'ready') {
                      return {
                        validate: false,
                        tooltip: '请选择处于关机状态的物理机',
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: '关机',
                action: (obj) => {
                  this.list.batchPerformAction('stop', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                      tooltip: '请选择处于运行中状态的物理机',
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    let obj = this.list.selectedItems[i]
                    if (!obj.is_baremetal) {
                      return {
                        validate: false,
                        tooltip: '请选择处于运行中状态的物理机',
                      }
                    }
                    if (obj.status !== 'running') {
                      return {
                        validate: false,
                        tooltip: '请选择处于运行中状态的物理机',
                      }
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
                  this.list.batchPerformAction('maintenance', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    let obj = this.list.selectedItems[i]
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
                      }
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
                  this.list.batchPerformAction('unmaintenance', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    let obj = this.list.selectedItems[i]
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
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: '同步状态',
                action: () => {
                  this.list.batchPerformAction('syncstatus', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    let obj = this.list.selectedItems[i]
                    if (!obj.is_baremetal) {
                      return {
                        validate: false,
                      }
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
                  this.list.batchPerformAction('prepare', null, this.list.steadyStatus)
                },
                meta: () => {
                  if (this.list.selectedItems.length <= 0) {
                    return {
                      validate: false,
                    }
                  }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    let obj = this.list.selectedItems[i]
                    if (!obj.can_prepare) {
                      return {
                        validate: false,
                      }
                    }
                  }
                  return {
                    validate: true,
                  }
                },
              },
              {
                label: '删除',
                permission: 'hosts_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    list: this.list,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
        },
      ],
      singleActions: [
        {
          label: '远程终端',
          actions: obj => {
            const ret = []
            const webconsoleM = new this.$Manager('webconsole', 'v1')
            if (obj.host_type === 'baremetal') {
              ret.push({
                label: 'SOL远程终端',
                action: () => {
                  webconsoleM.objectRpc({ methodname: 'DoBaremetalConnect', objId: obj.id }).then((res) => {
                    const connectParams = qs.parse(res.data.connect_params)
                    const query = {
                      ...connectParams,
                      session: res.data.session,
                      hypervisor: obj.host_type,
                    }
                    const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
                    open(href)
                  })
                    .catch((err) => {
                      console.error(err)
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
                webconsoleM.performAction({
                  action: ip,
                  data: sshData,
                  id: 'ssh',
                }).then(({ data }) => {
                  const connectParams = qs.parse(data.connect_params)
                  const query = {
                    ...connectParams,
                    session: data.session,
                    hypervisor: obj.host_type,
                  }
                  const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
                  open(href)
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
                action: () => {},
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
                label: '禁用',
                submenus: [
                  {
                    label: '启用',
                    action: () => {
                      this.list.onManager('performAction', {
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
                      this.list.onManager('performAction', {
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
                    label: '调整标签',
                    action: () => {
                      this.createDialog('HostsAdjustLabelDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
                      })
                    },
                  },
                  {
                    label: '同步状态',
                    action: () => {
                      this.list.batchPerformAction('syncstatus', null, this.list.steadyStatus, [obj.id])
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
                  {
                    label: '安装操作系统',
                    action: () => {
                      let installPath = this.$router.resolve({
                        path: '/physicalmachine/install',
                        query: { id: obj.id, type: 'baremetal', zone_id: obj.zone_id, host_id: obj.id },
                      })
                      window.location.href = installPath.href
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
                        list: this.list,
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
                      this.list.singlePerformAction('prepare', { id: obj.id }, this.list.steadyStatus)
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
                      this.list.singlePerformAction('start', { id: obj.id }, this.list.steadyStatus)
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
                      this.list.singlePerformAction('stop', { id: obj.id }, this.list.steadyStatus)
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
                      this.list.singlePerformAction('maintenance', { id: obj.id }, this.list.steadyStatus)
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
                      this.list.singlePerformAction('unmaintenance', { id: obj.id }, this.list.steadyStatus)
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
  created () {
    this.initSidePageTab('physicalmachine-detail')
    this.list.fetchData()
  },
}
</script>
