<template>
  <page-list
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
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'CloudgroupcacheList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    isOwner: Function,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudgroupcaches',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.cloudgroup).flat(),
        filterOptions: {
          cloudaccount: {
            label: this.$t('cloudenv.text_12'),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.column.title.name'), key: 'name' },
          { label: this.$t('table.column.title.brand'), key: 'brand' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.delete'),
          permission: 'cloudgroupcache_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('dictionary.cloudgroupcache'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            if (this.isOwner && !this.isOwner()) {
              return {
                validate: false,
                tooltip: this.$t('common_614'),
              }
            }
            return this.$getDeleteResult(this.list.selectedItems)
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('cloudgroupcache-detail')
    this.list.fetchData()
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
