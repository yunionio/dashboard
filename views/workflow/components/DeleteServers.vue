<template>
  <vxe-grid
    class="mb-2 process-history"
    :data="deleteServers"
    :columns="serverColumns" />
</template>

<script>
import { sizestr } from '@/utils/utils'

export default {
  name: 'DeleteServers',
  props: {
    deleteServers: {
      type: Array,
      default: function () {
        return []
      },
    },
  },
  data () {
    return {
      serverColumns: [
        {
          field: 'name',
          title: '主机名称',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return row.name
          },
        },
        {
          field: 'tenant',
          title: '所属项目',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return row.tenant
          },
        },
        {
          field: 'ips',
          title: 'IP',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return row.ips
          },
        },
        {
          field: 'conf',
          title: '主机名称',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return `${row.vcpu_count}核${sizestr(row.vmem_size, 'M', 1024)}${row.disk ? sizestr(row.disk, 'M', 1024) : ''}`
          },
        },
      ],
    }
  },
}
</script>
