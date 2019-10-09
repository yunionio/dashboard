<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'HostList',
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'hosts',
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
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
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
                <copy-with-content message={ row.access_ip }>{ row.access_ip }</copy-with-content>,
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
