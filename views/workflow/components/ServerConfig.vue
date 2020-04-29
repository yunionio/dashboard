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
          title: '主机名称',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return row.name
          },
        },
        {
          field: 'project',
          title: '所属项目',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return row.project
          },
        },
        {
          field: 'beforeConfig',
          title: '调整前配置',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return `${row.before && row.before.cpu}核${sizestr(row.before && row.before.memory, 'M', 1024)}${sizestr(row.before && row.before.disk, 'M', 1024)}`
          },
        },
        {
          field: 'afterConfig',
          title: '调整后配置',
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            if (row.after && row.after.disk) {
              return `${row.after && row.after.cpu}核${sizestr(row.after && row.after.memory, 'M', 1024)}${sizestr(row.after && row.after.disk, 'M', 1024)}`
            }
            return `${row.after && row.after.cpu}核${sizestr(row.after && row.after.memory, 'M', 1024)}`
          },
        },
      ],
    }
  },
}
</script>
