<template>
  <page-list
    :show-tag-filter="true"
    :show-tag-columns="true"
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getBrandFilter,
  getStatusFilter,
  getTenantFilter,
  getAccountFilter,
  getRegionFilter,
  getCloudProviderFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'WebAppList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'webapps',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter('compute_engine_brands'),
          status: getStatusFilter('webapp'),
          tech_stack: {
            label: this.$t('compute.webapp.tech.stack'),
            filter: true,
            formatter: val => {
              return `tech_stack.contains("${val}")`
            },
          },
          projects: getTenantFilter(),
          cloudaccount: getAccountFilter(),
          manager: getCloudProviderFilter(),
          region: getRegionFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_268'), key: 'status' },
          { label: this.$t('compute.webapp.type'), key: 'type' },
          { label: this.$t('compute.webapp.kind'), key: 'kind' },
          { label: this.$t('compute.webapp.tech.stack'), key: 'tech_stack' },
          { label: this.$t('table.title.brand'), key: 'provider' },
          { label: this.$t('res.cloudaccount'), key: 'manager' },
          { label: this.$t('res.region'), key: 'region' },
          { label: this.$t('res.project'), key: 'tenant' },
          { label: this.$t('table.title.user_tag'), key: 'user_tags' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.text00043'),
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
        {
          label: this.$t('table.action.set_tag'),
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              mode: 'add',
              params: {
                resources: 'webapp',
              },
              tipName: this.$t('compute.webapp'),
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'WebAppSidePage', {
        id: row.id,
        resource: 'webapps',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
