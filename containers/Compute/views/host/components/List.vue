<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getEnabledTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'HostList',
  props: {
    getParams: {
      type: Function,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'hosts',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '实例名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          sn: {
            label: 'SN',
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({ vm: this }),
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'host' }),
        {
          field: 'host_status',
          title: '服务',
          slots: {
            default: ({ row }) => {
              return [<status statusModule='host_status' status={ row.host_status } />]
            },
          },
        },
        {
          field: 'access_ip',
          title: 'IP',
          slots: {
            default: ({ row }) => {
              return [
                <list-body-cell-wrap row={row} field="access_ip" copy />,
              ]
            },
          },
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
