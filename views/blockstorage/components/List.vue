<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { STORAGE_TYPES, MEDIUM_TYPES } from '@Storage/constants/index.js'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getEnabledFilter, getStatusFilter, getBrandFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import { getDomainChangeOwnerAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
// import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import { hasServices } from '@/utils/auth'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'BlockStorageList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    const groupActions = [
      {
        label: '新建',
        action: () => {
          this.createDialog('BlockStorageCreateDialog', {
            title: '新建块存储',
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: () => {
          return {
            buttonType: 'primary',
            validate: hasServices('hostagent'),
          }
        },
      },
      {
        label: '批量操作',
        actions: () => {
          return [
            ...getEnabledSwitchActions(this),
            {
              label: '调整超售比',
              permission: 'storages_update',
              action: row => {
                this.createDialog('BlockStorageUpdateCommitBoundDialog', {
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: '调整超售比',
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const validate = this.list.selectedItems.every(item => item.brand !== 'ZStack')
                return {
                  validate,
                  tooltip: !validate && 'ZStack平台暂不支持此操作',
                }
              },
            },
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.storages'),
              resource: 'storages',
            }, {
              meta: () => {
                return {
                  validate: this.list.selectedItems.every(item => item.storage_type === 'local'),
                }
              },
            }),
            // getSetPublicAction(this, {
            //   name: this.$t('dictionary.storages'),
            //   scope: 'domain',
            //   resource: 'storages',
            // }, {
            //   meta: () => {
            //     return {
            //       validate: this.list.selectedItems.every(item => item.storage_type === 'local'),
            //     }
            //   },
            // }),
            // {
            //   label: '同步状态',
            //   action: () => {
            //     this.onManager('batchPerformAction', {
            //       id: this.list.selectedItems.map(item => item.id),
            //       steadyStatus: ['running', 'ready'],
            //       managerArgs: {
            //         action: 'syncstatus',
            //       },
            //     })
            //   },
            // },
            {
              label: '删除',
              permission: 'storages_delete',
              action: row => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: '删除',
                  name: '块存储',
                  data: this.list.selectedItems,
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => this.$getDeleteResult(this.list.selectedItems),
            },
          ]
        },
        meta: () => {
          return {
            validate: !!this.list.selectedItems.length,
          }
        },
      },
    ]
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'storages',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.blockstorage).flat(),
        filterOptions: {
          name: getNameFilter(),
          enabled: getEnabledFilter(),
          status: getStatusFilter({ statusModule: 'blockstorage' }),
          brand: getBrandFilter(),
          storage_type: {
            label: '存储类型',
            filter: true,
            dropdown: true,
            items: Object.keys(STORAGE_TYPES).map(key => {
              return { label: STORAGE_TYPES[key], key }
            }),
            formatter: val => {
              return `storage_type.contains("${val}")`
            },
          },
          medium_type: {
            label: '介质类型',
            filter: true,
            dropdown: true,
            items: Object.keys(MEDIUM_TYPES).map(key => {
              return { label: MEDIUM_TYPES[key], key }
            }),
            formatter: val => {
              return `medium_type.contains("${val}")`
            },
          },
          project_domains: getProjectDomainFilter(),
        },
      }),
      groupActions: !hasServices('hostagent') ? R.remove(0, 1, groupActions) : groupActions,
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '状态', key: 'status' },
          { label: '实际容量', key: 'capacity' },
          { label: '虚拟容量', key: 'virtual_capacity' },
          { label: '分配', key: 'used_capacity' },
          { label: '存储类型', key: 'storage_type' },
          { label: '介质类型', key: 'medium_type' },
          { label: '调度标签', key: 'schedtag' },
          { label: '平台', key: 'provider' },
          { label: '区域', key: 'region' },
          {
            label: '共享范围',
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('storages'))
            },
          },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'project_domain' },
        ],
      },
      handleOpenSidepage (row) {
        this.sidePageTriggerHandle(this, 'BlockStorageSidePage', {
          id: row.id,
          resource: 'storages',
          getParams: this.getParams,
        }, {
          list: this.list,
        })
      },
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('detail')
    this.$bus.$on('BlockStorageListSingleUpdate', args => {
      this.list.singleUpdate(...args)
    }, this)
  },
}
</script>
