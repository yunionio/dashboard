<template>
  <page-list
    show-tag-columns
    show-tag-filter
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
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getStatusFilter, getEnabledFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'PhysicalmachineList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
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
        resource: 'hosts',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.host).flat(),
        },
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
              return `access_ip.contains("${val}")`
            },
          },
          ipmi_ip: {
            label: '带外IP',
            filter: true,
            formatter: val => {
              return `ipmi_ip.contains("${val}")`
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
          project_domain: getProjectDomainFilter(),
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
          { label: 'SN', key: 'sn' },
          { label: '分配', key: 'server' },
          { label: '维护模式', key: 'is_maintenance' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '共享范围', key: 'public_scope' },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'project_domain' },
        ],
      },
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
                    if (obj.server_id && obj.host_type === 'baremetal') {
                      return {
                        validate: false,
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
                    if (obj.server_id && obj.host_type === 'baremetal') {
                      return {
                        validate: false,
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
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.host'),
                resource: 'hosts',
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.host'),
                scope: 'domain',
              }),
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
                label: '调度标签',
                action: (obj) => {
                  this.createDialog('HostsAdjustLabelDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    name: this.$t('dictionary.physicalmachine'),
                  })
                },
                meta: () => ({
                  validate: this.list.selectedItems.length,
                }),
              },
              {
                label: '编辑标签',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'host',
                    },
                    mode: 'add',
                  })
                },
              },
              {
                label: '删除',
                permission: 'hosts_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    onManager: this.onManager,
                  })
                },
                meta: () => ({
                  validate: this.$getDeleteResult(this.list.selectedItems).validate,
                  tooltip: this.$getDeleteResult(this.list.selectedItems).validate ? '' : '操作对象的当前状态不支持该操作: 物理机没有被禁用或未删除分配的裸金属服务器',
                }),
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
    }
  },
  created () {
    this.initSidePageTab('physicalmachine-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        with_meta: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'PhysicalmachineSidePage', {
        id: row.id,
        resource: 'hosts',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.host).flat(),
        },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
