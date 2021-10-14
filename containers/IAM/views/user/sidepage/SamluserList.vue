<template>
  <div>
    <!-- <a-alert :message="$t('cloudenv.clouduser_desc')" class="mb-2" /> -->
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '@Cloudenv/views/samluser/mixins/columns'
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'SamluserListForUserSidepage',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
    data: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'SamluserListForUserSidepage',
        resource: 'samlusers',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.samluser).flat(),
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: this.$t('table.title.brand'), key: 'brand' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('SamluserCreateForUserDialog', {
              user: this.data,
              onManager: this.onManager,
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
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('res.samlusers'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: this.$t('common.delete'),
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('res.samluser'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
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
        details: true,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SamluserSidePage', {
        id: row.id,
        resource: 'samlusers',
        getParams: this.getParams,
        refresh: this.refresh,
        apiVersion: 'v1',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
