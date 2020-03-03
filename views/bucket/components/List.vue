<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import { ACL_TYPE } from '@Storage/constants/index.js'
import { getNameDescriptionTableColumn, getStatusTableColumn, getBrandTableColumn, getRegionTableColumn, getAccountTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'
import { getNameFilter, getTenantFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BucketStorageList',
  mixins: [WindowsMixin],
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
        resource: 'buckets',
        // getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter(),
          tenant: getTenantFilter(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'BucketStorageSidePage') }>{ row.name_cn ? `${row.name}(${row.name_cn})` : row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'acl',
          title: '读写权限',
          width: 120,
          formatter: ({ row }) => {
            return ACL_TYPE[row.acl] || row.acl || '-'
          },
        },
        {
          field: 'storage_class',
          title: '存储类型',
          width: 120,
          formatter: ({ row }) => {
            return row.storage_class || '-'
          },
        },
        getStatusTableColumn({ statusModule: 'bucket' }),
        getRegionTableColumn(),
        getBrandTableColumn(),
        getAccountTableColumn(),
        getProjectTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('BucketCreateDialog', {
              title: '新建',
              list: this.list,
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
              {
                label: `更改${this.$t('dictionary.project')}`,
                permission: 'buckets_perform_change_owner',
                action: row => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    list: this.list,
                    name: '存储桶',
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
                    list: this.list,
                  })
                },
              },
              {
                label: '同步状态',
                permission: 'buckets_perform_limit',
                action: row => {
                  const { steadyStatus, selectedItems } = this.list
                  this.list.batchPerformAction('sync', {}, steadyStatus, selectedItems.map(({ id }) => id))
                },
              },
              {
                label: '删除',
                permission: 'buckets_delete',
                action: obj => {
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
          meta: row => {
            return {
              validate: !!this.list.selectedItems.length,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '同步状态',
          permission: 'server_perform_syncstatus',
          action: (row) => {
            this.list.singlePerformAction('sync', {
              id: row.id,
            }, this.list.steadyStatus).then(() => {
              this.$message.success('操作成功')
            })
          },
        },
        {
          label: `更改${this.$t('dictionary.project')}`,
          permission: 'buckets_perform_change_owner',
          action: row => {
            this.createDialog('ChangeOwenrDialog', {
              data: [row],
              columns: this.columns,
              list: this.list,
              name: '存储桶',
            })
          },
        },
        {
          label: '更多',
          actions: row => {
            return [
              {
                label: '设置上限',
                permission: 'buckets_perform_limit',
                action: obj => {
                  this.createDialog('BucketUpdateBucketLimitDialog', {
                    title: '设置上限',
                    data: [row],
                    columns: this.columns,
                    list: this.list,
                  })
                },
              },
              {
                label: '删除',
                permission: 'buckets_delete',
                action: row => {
                  this.createDialog('DeleteResDialog', {
                    data: [row],
                    columns: this.columns,
                    title: '删除',
                    list: this.list,
                    name: '存储桶',
                  })
                },
                meta: (row) => this.$getDeleteResult(row),
              },
            ]
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

  },
}
</script>
