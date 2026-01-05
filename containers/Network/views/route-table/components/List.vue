<template>
  <page-list
    :list="list"
    :columns="templateListColumns || columns"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showGroupActions="showGroupActions"
    :showSingleActions="isTemplate ? false : showSingleActions"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import {
  getDomainFilter,
  getStatusFilter,
  getAccountFilter,
  getCloudProviderFilter,
  getBrandFilter,
  getRegionFilter,
  getDescriptionFilter,
  getVpcFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'RouteTableList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    getParams: [Object, Function],
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    showSingleActions: {
      type: Boolean,
      default: true,
    },
    defaultHiddenColumns: {
      type: Array,
      default: () => ([]),
    },
    hiddenColumns: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'route_tables',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.routeTable).flat(),
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          description: getDescriptionFilter(),
          status: getStatusFilter('routeTable'),
          brand: getBrandFilter('brands'),
          project_domains: getDomainFilter(),
          cloudaccount: getAccountFilter(),
          manager: getCloudProviderFilter(),
          region: getRegionFilter(),
          vpc: getVpcFilter(),
        },
        hiddenColumns: this.defaultHiddenColumns,
      }),
      groupActions: [],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('dictionary.route_table'),
        items: [
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'RouteTableSidePage', {
        id: row.id,
        resource: 'route_tables',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
