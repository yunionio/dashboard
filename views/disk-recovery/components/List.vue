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
          projects: getTenantFilter(),
          // guest: getFilter({ field: 'guest', title: '云服务器' }),
          disk_type: getFilter({
            field: 'guest',
            title: this.$t('compute.text_175'),
            items: [
              { label: this.$t('compute.text_49'), key: 'sys' },
              { label: this.$t('compute.text_50'), key: 'data' },
            ],
          }),
          storage: {
            label: this.$t('compute.text_99'),
            jointFilter: true,
          },
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_397'), key: 'disk_size' },
          { label: this.$t('compute.text_398'), key: 'disk_format' },
          { label: this.$t('compute.text_381'), key: 'disk_type' },
          { label: this.$t('table.title.disk_mounted'), key: 'unused' },
          { label: this.$t('dictionary.server'), key: 'guest' },
          { label: this.$t('table.title.disk_storage'), key: 'storage' },
          { label: this.$t('compute.text_243'), key: 'created_at' },
          { label: this.$t('compute.text_268'), key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('compute.text_176'), key: 'provider' },
          { label: this.$t('compute.text_177'), key: 'region' },
          { label: this.$t('compute.text_270'), key: 'zone' },
          { label: this.$t('table.title.disk_medium_type'), key: 'medium_type' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_477'),
          permission: 'disks_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_477'),
              name: this.$t('dictionary.disk'),
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
          label: this.$t('compute.text_478'),
          permission: 'disks_perform_cancel_delete',
          action: () => {
            this.createDialog('DiskRestoreDialog', {
              title: this.$t('compute.text_478'),
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
