<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import { Base64 } from 'js-base64'
import qs from 'qs'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { Manager } from '@/utils/manager'
import { sizestr, percentstr } from '@/utils/utils'
import { getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getEnabledTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter, getEnabledFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import globalSearchMixins from '@/mixins/globalSearch'

export default {
  name: 'HostList',
  mixins: [WindowsMixin, globalSearchMixins],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
    frontGroupActions: {
      type: Function,
    },
    frontSingleActions: {
      type: Function,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'hosts',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('host'),
          enabled: getEnabledFilter(),
          host_status: {
            label: '服务',
            dropdown: true,
            items: Object.keys(this.$t('status.host_status')).map(key => {
              return { label: this.$t('status.host_status')[key], key }
            }),
          },
          sn: {
            label: 'SN',
            distinctField: {
              type: 'extra_field',
              key: 'account',
            },
          },
          access_ip: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `access_ip.contains("${val}")`
            },
          },
          brand: getBrandFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '启用状态', key: 'enabled' },
          { label: '状态', key: 'status' },
          { label: '管理IP', key: 'access_ip' },
          { label: '带外IP', key: 'ipmi_ip' },
          { label: '服务', key: 'host_status' },
          { label: '#VM', key: 'nonsystem_guests' },
          { label: 'CPU', key: 'cpu_count' },
          { label: '内存', key: 'mem_size' },
          { label: '存储', key: 'storage_size' },
          { label: 'SN', key: 'sn' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'HostSidePage') }>{ row.name }</side-page-trigger>
            )
          },
          cellWrapSlots: row => {
            return {
              append: () => row.is_baremetal ? (<a-tooltip title="有IPMI信息，可转换为物理机"><icon class='ml-2' type='res-host' style={{ 'color': '#1890ff' }} /></a-tooltip>) : null,
            }
          },
        }),
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'host' }),
        {
          field: 'custom_ip',
          title: 'IP',
          width: 160,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              let cellWrap = []
              if (row.access_ip) {
                cellWrap.push(
                  <div class="d-flex">
                   管理IP：<list-body-cell-wrap row={row} field="access_ip" copy />
                  </div>
                )
              }
              if (row.ipmi_ip) {
                cellWrap.push(
                  <div class="d-flex">
                    带外IP：<list-body-cell-wrap row={row} field="ipmi_ip" copy />
                  </div>
                )
              }
              return cellWrap
            },
          },
        },
        getStatusTableColumn({ field: 'host_status', title: '服务', statusModule: 'host_status' }),
        {
          field: 'nonsystem_guests',
          title: '#VM',
          width: 60,
          formatter: ({ cellValue }) => {
            return cellValue || '0'
          },
        },
        {
          field: 'cpu_count',
          title: 'CPU',
          minWidth: 60,
          showOverflow: 'title',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return '' + cellValue + '/' + percentstr(row.cpu_commit_rate)
            } else {
              return 'N/A'
            }
          },
        },
        {
          field: 'mem_size',
          title: '内存',
          minWidth: 60,
          showOverflow: 'title',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return sizestr(cellValue, 'M', 1024) + '/' + percentstr(row.mem_commit_rate)
            } else {
              return 'N/A'
            }
          },
        },
        {
          field: 'storage_size',
          title: '存储',
          minWidth: 60,
          showOverflow: 'title',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return sizestr(cellValue, 'M', 1024) + '/' + percentstr(row.storage_commit_rate)
            } else {
              return 'N/A'
            }
          },
        },
        {
          field: 'sn',
          title: 'SN',
          width: 100,
          showOverflow: 'title',
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
        {
          field: 'id',
          title: 'IPMI',
          width: 60,
          slots: {
            default: ({ cellValue, row }) => {
              if (!row.is_baremetal) {
                return '-'
              } else {
                return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
              }
            },
          },
        },
        {
          field: 'server_id',
          title: '初始账号',
          width: 70,
          slots: {
            default: ({ cellValue, row }) => {
              if (!row.is_baremetal) {
                return '-'
              } else {
                return [<PasswordFetcher serverId={ row.server_id } resourceType='servers' />]
              }
            },
          },
        },
      ],
    }
  },
  computed: {
    groupActions () {
      const _frontGroupActions = this.frontGroupActions ? this.frontGroupActions.bind(this)() || [] : []
      return _frontGroupActions.concat(
        [
          {
            label: '启用',
            action: () => {
              this.list.batchPerformAction('enable', null, this.list.steadyStatus)
            },
            meta: (obj) => {
              const validate = this.list.selectedItems.length && this.list.selectedItems.some(item => !item.enabled)
              return {
                validate,
                tooltip: !validate ? '请选择已经禁用的实例' : '',
              }
            },
          },
          {
            label: '禁用',
            action: () => {
              this.list.batchPerformAction('disable', null, this.list.steadyStatus)
            },
            meta: (obj) => {
              const validate = this.list.selectedItems.length && this.list.selectedItems.some(item => item.enabled)
              return {
                validate,
                tooltip: !validate ? '请选择已经启用的实例' : '',
              }
            },
          },
          {
            label: this.$t('common.batchAction'),
            actions: () => {
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
                  label: '回收为物理机',
                  action: () => {
                    this.list.batchPerformAction('disable', null)
                  },
                  meta: () => {
                    if (!this.list.selectedItems.length) {
                      return {
                        validate: false,
                        tooltip: '请选择要操作的数据',
                      }
                    }
                    for (let i = 0; i < this.list.selectedItems.length; i++) {
                      let obj = this.list.selectedItems[i]
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
                    }
                  },
                },
                {
                  label: '调整超售比',
                  action: () => {
                    this.createDialog('HostAdjustOversoldRatioDialog', {
                      data: this.list.selectedItems,
                      columns: this.columns,
                      list: this.list,
                    })
                  },
                  meta: () => ({
                    validate: this.list.selectedItems.every(item => { return item.brand.toLowerCase() !== 'zstack' }),
                  }),
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
        ]
      )
    },
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
                    label: '调整超售比',
                    action: () => {
                      this.createDialog('HostAdjustOversoldRatioDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
                      })
                    },
                    meta: () => ({
                      validate: obj.brand.toLowerCase() !== 'zstack',
                    }),
                  },
                  {
                    label: '回收为物理机',
                    action: () => {
                      this.createDialog('HostUnconvertDialog', {
                        data: [obj],
                        columns: this.columns,
                        list: this.list,
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
                      }
                      // else if (!obj.is_baremetal) {
                      //   return {
                      //     validate: false,
                      //     tooltip: '',
                      //   }
                      // }
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
                        list: this.list,
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
                        list: this.list,
                      })
                    },
                    meta: () => {
                      if (obj.host_type !== 'hypervisor') {
                        return {
                          validate: false,
                        }
                      }
                      // else if (!obj.is_baremetal) {
                      //   return {
                      //     validate: false,
                      //   }
                      // }
                      return {
                        validate: ['maintaining', 'maintain_fail'].includes(obj.status),
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
      ])
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
    this.initSidePageTab('host-detail')
    this.webconsoleManager = new Manager('webconsole', 'v1')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
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
</script>
