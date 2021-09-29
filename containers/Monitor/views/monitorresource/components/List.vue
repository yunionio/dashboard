<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'List',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    listId: String,
    res_type: String,
    hiddenColumns: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'monitorresources',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('cloudaccount'),
          alert_state: getStatusFilter({
            field: 'alert_state',
            statusModule: 'monitorresources',
            title: this.$t('monitor.monitorresources.alert_state'),
          }),
        },
      }),
      exportDataOptions: {
        items: [
          { key: 'name', label: this.$t('common.name') },
          { key: 'ips', label: 'IP' },
          { key: 'status', label: this.$t('common.status') },
          { label: this.$t('cloudenv.text_94'), key: 'account' },
          { label: this.$t('cloudenv.text_102'), key: 'brand' },
        ].filter(item => {
          return !this.hiddenColumns.some(item2 => item2 === item.key)
        }),
      },
      singleActions: [
        {
          label: this.$t('monitor.monitorresources.management'),
          action: (obj) => {
            this.sidePageTriggerHandle(this, 'MonitorResourceSidePage', {
              id: obj.id,
              resource: 'monitorresources',
              getParams: this.getParam,
              apiVersion: 'v1',
            }, {
              list: this.list,
              res_type: this.res_type,
            })
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
      const ret = {
        res_type: this.res_type,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams || {}),
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'MonitorResourceSidePage', {
        id: row.id,
        resource: 'monitorresources',
        getParams: this.getParam,
        apiVersion: 'v1',
      }, {
        list: this.list,
        res_type: this.res_type,
      })
    },
  },
}
</script>

<style scoped>

</style>
