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
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter, getBrandFilter, getTenantFilter, getFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'DiskRecoveryList',
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
        resource: 'disks',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter(),
          status: getStatusFilter('disk'),
          tenant: getTenantFilter(),
          // guest: getFilter({ field: 'guest', title: '云服务器' }),
          disk_type: getFilter({
            field: 'guest',
            title: '类型',
            items: [
              { label: '系统盘', key: 'sys' },
              { label: '数据盘', key: 'data' },
            ] }),
          storage: {
            label: '存储',
            jointFilter: true,
          },
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '容量', key: 'disk_size' },
          { label: '格式', key: 'disk_format' },
          { label: '磁盘类型', key: 'disk_type' },
          { label: '是否挂载', key: 'unused' },
          { label: this.$t('dictionary.server'), key: 'guest' },
          { label: '主存储', key: 'storage' },
          { label: '创建时间', key: 'created_at' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'provider' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '介质类型', key: 'medium_type' },
        ],
      },
      groupActions: [
        {
          label: '清除',
          permission: 'disks_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '清除',
              name: this.$t('disk'),
              requestParams: { override_pending_delete: true },
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
        {
          label: '恢复',
          permission: 'disks_perform_cancel_delete',
          action: () => {
            this.createDialog('DiskRestoreDialog', {
              title: '恢复',
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
        with_meta: true,
        pending_delete: true,
      }
    },
  },
}
</script>
