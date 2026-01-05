<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="hidenGroupActions ? [] : groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :show-single-actions="!isTemplate"
    :export-data-options="exportDataOptions"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import { STORAGE_TYPES, MEDIUM_TYPES } from '@Storage/constants/index.js'
import { getDistinctFieldFilter, getNameFilter, getEnabledFilter, getStatusFilter, getBrandFilter, getProjectDomainFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import { getDomainChangeOwnerAction, getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import { hasServices } from '@/utils/auth'
import expectStatus from '@/constants/expectStatus'
import { HYPERVISORS_MAP, EXTRA_HYPERVISORS } from '@/constants'
import GlobalSearchMixin from '@/mixins/globalSearch'
import { getDisabledProvidersActionMeta } from '@/utils/common/hypervisor'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'BlockStorageList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
    hidenGroupActions: {
      type: Boolean,
      default: false,
    },
    cloudEnv: String,
  },
  data () {
    const groupActions = [
      {
        label: this.$t('storage.text_31'),
        permission: 'storages_create',
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
            ...getEnabledSwitchActions(this, undefined, ['storages_perform_enable', 'storages_perform_disable'], {
              extraMetas: [
                obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud'],
                  })
                },
                obj => {
                  return getDisabledProvidersActionMeta({
                    rows: this.list.selectedItems,
                    disabledProviders: ['BingoCloud'],
                  })
                },
              ],
            }),
            {
              label: this.$t('storage.text_34'),
              permission: 'storages_perform_set_commit_bound',
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
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  rows: this.list.selectedItems,
                  disabledProviders: ['BingoCloud'],
                })
              },
            },
            {
              label: this.$t('compute.text_540'),
              permission: 'storages_update',
              action: () => {
                this.createDialog('BlockStorageUpdateTagsDialog', {
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('compute.text_540'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  rows: this.list.selectedItems,
                  disabledProviders: ['BingoCloud'],
                })
              },
            },
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.storages'),
              resource: 'storages',
            }, {
              permission: 'storages_perform_change_owner',
              meta: () => {
                return {
                  validate: this.list.selectedItems.every(item => item.storage_type === 'local'),
                }
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  rows: this.list.selectedItems,
                  disabledProviders: ['BingoCloud'],
                })
              },
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.storages'),
              scope: 'domain',
              resource: 'storages',
            }, {
              permission: 'storages_perform_public',
              meta: () => {
                return {
                  validate: this.list.selectedItems.every(item => item.storage_type === 'local'),
                }
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  rows: this.list.selectedItems,
                  disabledProviders: ['BingoCloud'],
                })
              },
            }),
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
              label: this.$t('table.action.set_tag'),
              permission: 'storages_perform_set_user_metadata',
              action: () => {
                this.createDialog('SetTagDialog', {
                  data: this.list.selectedItems,
                  columns: this.columns,
                  onManager: this.onManager,
                  mode: 'add',
                  params: {
                    resources: 'storage',
                  },
                  tipName: this.$t('storage.text_37'),
                })
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  rows: this.list.selectedItems,
                  disabledProviders: ['BingoCloud'],
                })
              },
            },
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
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  rows: this.list.selectedItems,
                  disabledProviders: ['BingoCloud'],
                })
              },
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
      ...Object.values(EXTRA_HYPERVISORS).filter(v => v.key !== 's3').map(item => item.brand),
    ]
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'storages',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.blockstorage).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          enabled: getEnabledFilter(),
          status: getStatusFilter({ statusModule: 'blockstorage' }),
          brand: {
            ...brandFilter,
            items: brandFilter.items.filter(val => !notSupportBrand.includes(val.key)),
          },
          // storage_type: {
          //   label: this.$t('storage.text_38'),
          //   filter: true,
          //   dropdown: true,
          //   items: Object.keys(STORAGE_TYPES).map(key => {
          //     return { label: STORAGE_TYPES[key], key }
          //   }),
          //   formatter: val => {
          //     return `storage_type.equals("${val}")`
          //   },
          // },
          storage_type: getDistinctFieldFilter({
            field: 'storage_type',
            filter: true,
            multiple: false,
            label: this.$t('storage.text_38'),
            mapper: (data) => {
              return data.map(item => {
                const k = item.key.toLowerCase()
                return {
                  key: item.key,
                  label: STORAGE_TYPES[k] || k,
                }
              })
            },
            formatter: (val) => {
              return `storage_type.equals('${val}')`
            },
          }),
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
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'storage_type', 'medium_type', 'schedtag', 'created_at'],
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
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
    }
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('detail')
    this.$bus.$on('BlockStorageListSingleUpdate', args => {
      this.list.singleUpdate(...args)
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        ...this.getParams,
        is_baremetal: this.cloudEnv === 'baremetal',
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'BlockStorageSidePage', {
        id: row.id,
        resource: 'storages',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
