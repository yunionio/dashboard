<template>
  <vxe-grid
    class="mb-2 process-history"
    :data="serverConfigs"
    :columns="serverConfigColumns" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { CHANGE_TYPES } from '../utils'

export default {
  name: 'ServerConfigList',
  props: {
    variables: {
      type: Object,
      default: function () {
        return {}
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
          field: 'change_type',
          title: this.$t('common_56'),
          minWidth: 40,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            return CHANGE_TYPES[this.variables.change_type] || this.$t('common.change_config')
          },
        },
        {
          field: 'beforeConfig',
          title: this.$t('common_395'),
          minWidth: 80,
          showOverflow: 'title',
          formatter: ({ cellVal, row }) => {
            if (row.before && row.before.bw_limit !== undefined) {
              if (+row.before.bw_limit) {
                return `${row.before.bw_limit}Mbps (ip: ${row.ip_addr || ''})`
              }
              return `0(${this.$t('common.not_limited')})`
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
            if (row.after && row.after.bw_limit !== undefined) {
              if (+row.after.bw_limit) {
                return `${row.after.bw_limit}Mbps (ip: ${row.ip_addr || ''})`
              }
              return `0(${this.$t('common.not_limited')})`
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
  computed: {
    serverConfigs () {
      return JSON.parse(this.variables.serverConf || '[]')
    },
  },
}
</script>
