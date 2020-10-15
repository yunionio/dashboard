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
import { HYPERVISORS_MAP, EXTRA_HYPERVISORS } from '@/constants'

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
        label: this.$t('storage.text_31'),
        action: () => {
          this.createDialog('BlockStorageCreateDialog', {
            title: this.$t('storage.text_32'),
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
        label: this.$t('storage.text_33'),
        actions: () => {
          return [
            ...getEnabledSwitchActions(this),
            {
              label: this.$t('storage.text_34'),
              permission: 'storages_update',
              action: row => {
                this.createDialog('BlockStorageUpdateCommitBoundDialog', {
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('storage.text_34'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const validate = this.list.selectedItems.every(item => item.brand !== 'ZStack')
                return {
                  validate,
                  tooltip: !validate && this.$t('storage.text_35'),
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
              label: this.$t('storage.text_36'),
              permission: 'storages_delete',
              action: row => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: this.$t('storage.text_36'),
                  name: this.$t('storage.text_37'),
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
    const brandFilter = getBrandFilter()
    const notSupportBrand = [
      ...Object.values(HYPERVISORS_MAP).filter(item => item.cloud_env === 'public').map(item => item.brand),
      ...Object.values(EXTRA_HYPERVISORS).map(item => item.brand),
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
          brand: {
            ...brandFilter,
            items: brandFilter.items.filter(val => !notSupportBrand.includes(val.key)),
          },
          storage_type: {
            label: this.$t('storage.text_38'),
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
            label: this.$t('storage.text_39'),
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
          region: {
            label: this.$t('dictionary.region'),
          },
          zone: {
            label: this.$t('dictionary.zone'),
          },
        },
        hiddenColumns: ['metadata', 'storage_type', 'medium_type', 'schedtag'],
      }),
      groupActions: !hasServices('hostagent') ? R.remove(0, 1, groupActions) : groupActions,
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('storage.text_40'), key: 'name' },
          { label: this.$t('storage.text_41'), key: 'status' },
          { label: this.$t('storage.text_42'), key: 'capacity' },
          { label: this.$t('storage.text_43'), key: 'virtual_capacity' },
          { label: this.$t('storage.text_44'), key: 'used_capacity' },
          { label: this.$t('storage.text_38'), key: 'storage_type' },
          { label: this.$t('storage.text_39'), key: 'medium_type' },
          { label: this.$t('storage.text_45'), key: 'schedtag' },
          { label: this.$t('storage.text_46'), key: 'provider' },
          { label: this.$t('storage.text_47'), key: 'region' },
          {
            label: this.$t('storage.text_48'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('storages'))
            },
          },
          { label: this.$t('storage.text_49', [this.$t('dictionary.domain')]), key: 'project_domain' },
          { label: this.$t('common_715'), key: 'user_tags' },
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
