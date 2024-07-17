<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :expand-config="{ lazy: true, loadMethod: loadPolicy }" />
</template>

<script>
import * as R from 'ramda'
import { getNameFilter, getBrandFilter, getDescriptionFilter, getCreatedAtFilter, getDistinctFieldFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'CloudaccountList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudaccount: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudgroups',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.cloudgroup).flat(),
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
          provider: getBrandFilter('cloud_id_brands'),
          cloudaccount: getDistinctFieldFilter({
            field: 'account',
            type: 'extra_field',
            label: this.$t('common.text00108'),
          }),
          manager: getDistinctFieldFilter({
            field: 'manager',
            type: 'extra_field',
            label: this.$t('common_624', [this.$t('dictionary.cloudprovider')]),
          }),
          created_at: getCreatedAtFilter(),
        },
        hiddenColumns: ['created_at'],
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'cloudgroup_create',
          action: () => {
            this.createDialog('CloudgroupCreateDialog', {
              onManager: this.onManager,
              provider: this.cloudaccount.provider,
              cloudaccount: this.cloudaccount || {},
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.delete'),
          permission: 'cloudgroup_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.cloudgroup_delete_tip'),
              name: this.$t('dictionary.cloudgroup'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        title: this.$t('cloudenv.text_491'),
        downloadType: 'local',
        items: [
          { field: 'id', title: 'ID' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.initSidePageTab('cloudgroup-detail')
    this.list.fetchData()
    this.$bus.$on('CloudgroupListSingleRefresh', (...arg) => {
      this.list.singleRefresh(...arg)
    }, false)
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
