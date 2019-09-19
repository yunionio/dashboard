<template>
  <div>
    <page-header title="宿主机" />
    <page-body>
      <page-list
        :list="list"
        :columns="columns" />
    </page-body>
  </div>
</template>

<script>
import { getRegionTableColumn, getStatusTableColumn, getBrandTableColumn, getEnabledTableColumn } from '@/utils//common/tableColumn'

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
        { field: 'name', title: '名称' },
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
