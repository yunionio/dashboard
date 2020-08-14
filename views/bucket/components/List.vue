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
import { ACL_TYPE } from '@Storage/constants/index.js'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getTenantFilter, getBrandFilter, getStatusFilter, getAccountFilter } from '@/utils/common/tableFilter'
import { getSetPublicAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'BucketStorageList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'buckets',
        steadyStatus: Object.values(expectStatus.bucket).flat(),
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter(),
          projects: getTenantFilter(),
          status: getStatusFilter({ statusModule: 'bucket' }),
          cloudaccount: getAccountFilter(),
          // region: {
          //   label: '区域',
          // },
          storage_class: {
            label: '存储类型',
          },
          acl: {
            label: '读写权限',
            dropdown: true,
            items: Object.keys(ACL_TYPE).map(k => {
              return { label: ACL_TYPE[k], key: k }
            }),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '状态', key: 'status' },
          { label: '存储类型', key: 'storage_class' },
          { label: '读写权限', key: 'acl' },
          { label: '平台', key: 'provider' },
          { label: '云账号', key: 'manager' },
          { label: '区域', key: 'region' },
          {
            label: '共享范围',
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('buckets'))
            },
          },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'buckets_create',
          action: () => {
            this.createDialog('BucketCreateDialog', {
              title: '新建存储桶',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '批量操作',
          actions: () => {
            return [
              getSetPublicAction(this, {
                name: this.$t('dictionary.bucket'),
                scope: 'project',
                resource: 'buckets',
              }),
              {
                label: `更改${this.$t('dictionary.project')}`,
                permission: 'buckets_perform_change_owner',
                action: row => {
                  this.createDialog('ChangeOwenrDialog', {
                    name: '存储桶',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    resource: 'buckets',
                  })
                },
                meta: row => {
                  const domainIds = this.list.selectedItems.map(item => item.domain_id)
                  const validate = R.uniq(domainIds).length === 1
                  return {
                    validate,
                    tooltip: !validate && `请选择同一个${this.$t('dictionary.domain')}下的存储桶`,
                  }
                },
              },
              {
                label: '设置上限',
                permission: 'buckets_perform_limit',
                action: row => {
                  this.createDialog('BucketUpdateBucketLimitDialog', {
                    title: '设置上限',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
              },
              {
                label: '同步状态',
                action: () => {
                  this.onManager('batchPerformAction', {
                    id: this.list.selectedItems.map(item => item.id),
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: '删除',
                permission: 'buckets_delete',
                action: obj => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: row => {
            return {
              validate: !!this.list.selectedItems.length,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('objects')
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'BucketStorageSidePage', {
        id: row.id,
        resource: 'buckets',
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
