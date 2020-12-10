<template>
  <vxe-grid
    class="mb-2 process-history"
    :data="serverConfigs"
    :columns="serverConfigColumns" />
</template>

<script>
import { sizestr } from '@/utils/utils'

export default {
  name: 'ServerConfigList',
  props: {
    serverConfigs: {
      type: Array,
      default: function () {
        return []
      },
    },
  },
  data () {
    return {
      serverConfigColumns: [
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
          field: 'project',
          title: this.$t('common_389'),
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return row.project
          },
        },
        {
          field: 'beforeConfig',
          title: this.$t('common_395'),
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            if (row.before && row.before.bw_limit) {
              return `${row.before.bw_limit}Mbps`
            }
            return `${row.before && row.before.cpu}${this.$t('common_390')}${sizestr(row.before && row.before.memory, 'M', 1024)}${sizestr(row.before && row.before.disk, 'M', 1024)}`
          },
        },
        {
          field: 'afterConfig',
          title: this.$t('common_397'),
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            if (row.after && row.after.bw_limit) {
              return `${row.after.bw_limit}Mbps`
            }
            if (row.after && row.after.disk) {
              return `${row.after && row.after.cpu}${this.$t('common_390')}${sizestr(row.after && row.after.memory, 'M', 1024)}${sizestr(row.after && row.after.disk, 'M', 1024)}`
            }
            return `${row.after && row.after.cpu}${this.$t('common_390')}${sizestr(row.after && row.after.memory, 'M', 1024)}`
          },
        },
      ],
    }
  },
}
</script>
