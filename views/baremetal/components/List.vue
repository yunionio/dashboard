<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :id="id"
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
import { cloudEnabled, cloudUnabledTip } from '../../vminstance/utils'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { disableDeleteAction } from '@/utils/common/tableActions'
import { getTenantFilter, getStatusFilter, getOsTypeFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'BaremetalList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
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
              return `name.contains("${val}")`
            },
          },
          ips: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `guestnetworks.guest_id(id).ip_addr.contains("${val}")`
            },
            jointFilter: true,
          },
          host_sn: {
            label: 'SN',
            distinctField: {
              type: 'extra_field',
              key: 'account',
            },
          },
          host: {
            label: '物理机',
          },
          projects: getTenantFilter(),
          status: getStatusFilter({ statusModule: 'server' }),
          os_type: getOsTypeFilter(),
        },
        steadyStatus: Object.values(expectStatus.server).flat(),
        responseData: this.responseData,
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
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'hypervisor' },
          { label: '云账号', key: 'manager' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '用户标签', key: 'user_tags' },
        ],
        getParams: () => ({ hypervisor: 'baremetal' }),
      },
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
            this.onManager('batchPerformAction', {
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
              onManager: this.onManager,
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
              onManager: this.onManager,
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
                label: '重置密码',
                permission: 'server_perform_deploy',
                action: () => {
                  this.createDialog('VmResetPasswordDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
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
                label: `更改${this.$t('dictionary.project')}`,
                permission: 'server_perform_change_owner',
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    resource: 'servers',
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
                    ret.tooltip = `请选择同一个${this.$t('dictionary.domain')}下的机器`
                    return ret
                  }
                  return ret
                },
              },
              {
                label: '同步状态',
                permission: 'server_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: Object.values(expectStatus.server).flat(),
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
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'server',
                    },
                  })
                },
              },
              disableDeleteAction(this),
              {
                label: '删除',
                permission: 'server_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
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
    }
  },
  computed: {
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
    this.initSidePageTab('baremetal-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        hypervisor: 'baremetal',
        ...this.getParams,
        details: true,
        with_meta: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'BaremetalSidePage', {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.image).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
