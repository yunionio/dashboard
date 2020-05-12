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
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getStatusFilter, getEnabledFilter, getBrandFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'HostList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
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
          { label: '服务', key: 'host_status' },
          { label: '#VM', key: 'nonsystem_guests' },
          { label: 'CPU', key: 'cpu_count' },
          { label: '内存', key: 'mem_size' },
          { label: '存储', key: 'storage_size' },
          { label: 'SN', key: 'sn' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '共享范围', key: 'public_scope' },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'project_domain' },
        ],
      },
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
                  label: '调整标签',
                  action: (obj) => {
                    this.createDialog('HostsAdjustLabelDialog', {
                      data: this.list.selectedItems,
                      columns: this.columns,
                      name: this.$t('dictionary.host'),
                      onManager: this.onManager,
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
                      onManager: this.onManager,
                      name: this.$t('dictionary.host'),
                      refresh: this.refresh,
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
                      vm: this,
                      data: this.list.selectedItems,
                      columns: this.columns,
                      title: '删除',
                      name: this.$t('dictionary.host'),
                      onManager: this.onManager,
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
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'HostSidePage', {
        id: row.id,
        resource: 'hosts',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
