<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>
<script>
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'GloblaVpcSunVpcList',
  props: ['getParams'],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'GloblaVpcSunVpcListSidePage',
        resource: 'vpcs',
        steadyStatus: ['available', 'unavailable'],
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return row.name
          },
        }),
        {
          field: 'cidr_block',
          title: this.$t('network.text_244'),
          slots: {
            default: ({ row }) => {
              const ips = row.cidr_block
              return ips ? ips.split(',').map((ip) => <div>{ip}</div>) : null
            },
          },
        },
        getRegionTableColumn(),
        getBrandTableColumn(),
        getAccountTableColumn(),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
