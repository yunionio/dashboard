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
          title: this.$t('common_388'),
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return row.name
          },
        },
        {
          field: 'tenant',
          title: this.$t('common_389'),
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
          title: this.$t('common_428'),
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return `${row.vcpu_count}${this.$t('common_390')}${sizestr(row.vmem_size, 'M', 1024)}${row.disk ? sizestr(row.disk, 'M', 1024) : ''}`
          },
        },
      ],
    }
  },
}
</script>
