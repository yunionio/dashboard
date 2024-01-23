<template>
  <page-list
    :list="list"
    :columns="columns"
    show-tag-columns
    show-tag-columns2
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="true" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getStatusFilter,
  getDomainFilter,
  getCreatedAtFilter,
  getBrandFilter,
  getAccountFilter,
  getRegionFilter,
  getProjectFilter,
} from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'TablestoreList',
  mixins: [WindowsMixin, ListMixin, SingleActionsMixin, ColumnsMixin],
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
        resource: 'tablestores',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.tablestore).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          status: getStatusFilter('tablestore'),
          brand: getBrandFilter(),
          account: getAccountFilter(),
          region: getRegionFilter(),
          tenant: getProjectFilter(),
          project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      // groupActions: [
      //   {
      //     label: this.$t('compute.perform_sync_status'),
      //     permission: 'tablestores_perform_syncstatus',
      //     action: () => {
      //       this.onManager('batchPerformAction', {
      //         steadyStatus: ['running'],
      //         managerArgs: {
      //           action: 'syncstatus',
      //         },
      //       })
      //     },
      //     meta: () => ({
      //       validate: this.list.selected.length,
      //     }),
      //   },
      // ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        downloadType: 'local',
        title: this.$t('dictionary.tablestore'),
      }
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('tablestore-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...this.getParams,
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'TablestoreSidePage', {
        id: row.id,
        resource: 'tablestores',
        getParams: this.getParam,
        steadyStatus: this.list.steadyStatus,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
