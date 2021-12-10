<template>
  <page-list
    :hideRowselect="true"
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getStatusTableColumn,
  getBrandTableColumn,
  getProjectTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getStatusFilter,
  getBrandFilter,
  getTenantFilter,
  getDomainFilter,
  getRegionFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'NetworkListForRouteTableSidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    const brandFilter = getBrandFilter('network_manage_brands')
    if (!R.find(R.propEq('key', 'OneCloud'))(brandFilter.items)) {
      brandFilter.items.push({ key: 'OneCloud', label: 'OneCloud' })
    }

    return {
      list: this.$list.createList(this, {
        id: 'networkListForVpcNetworkSidePage',
        resource: 'networks',
        getParams: { details: true, route_table_id: this.resId },
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('network'),
          ip_match: {
            label: 'IP',
          },
          brand: brandFilter,
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          region: getRegionFilter(),
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('table.title.name'),
          sortable: true,
          slots: {
            default: ({ row }, h) => {
              return [
                <side-page-trigger name='NetworkSidePage' id={row.id} vm={this}>{row.name}</side-page-trigger>,
              ]
            },
          },
        },
        getStatusTableColumn({ statusModule: 'network' }),
        {
          field: 'ip',
          title: this.$t('network.text_213'),
          width: 160,
          slots: {
            default: ({ row }) => {
              return [
                <div>{ this.$t('network.text_725', [row.guest_ip_start])}</div>,
                <div>{ this.$t('network.text_726', [row.guest_ip_end])}</div>,
              ]
            },
          },
        },
        {
          field: 'ports',
          title: this.$t('network.text_622'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              if (this.isPreLoad && !row.ports) return [<data-loading />]
              return [
                <div class='text-truncate'>{ this.$t('network.text_727', [row.ports])}</div>,
                <div class='text-truncate'>{ this.$t('network.text_728', [row.ports_used])}</div>,
              ]
            },
          },
        },
        getBrandTableColumn(),
        getProjectTableColumn(),
        getRegionTableColumn(),
      ],
      groupActions: [],
      singleActions: [],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
