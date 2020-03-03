<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getTenantFilter, getBrandFilter } from '@/utils/common/tableFilter'

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
        resource: 'buckets',
        // getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter(),
          tenant: getTenantFilter(),
        },
      }),
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('BucketCreateDialog', {
              title: '新建',
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
                action: row => {
                  const { steadyStatus, selectedItems } = this.list
                  this.onManager('batchPerformAction', {
                    id: selectedItems.map(({ id }) => id),
                    managerArgs: {
                      steadyStatus,
                      action: 'sync',
                    },
                  }).then(() => {
                    this.$message.success('操作成功')
                  })
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
