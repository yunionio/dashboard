<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import {
  getEnabledTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BaremetalsList',
  mixins: [DialogMixin, WindowsMixin],
  props: {
    id: String,
    resId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'hosts',
        getParams: {
          details: true,
          wire: this.resId,
          baremetal: true,
        },
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
        {
          field: 'name',
          title: this.$t('network.text_21'),
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'server' }),
        {
          field: 'access_ip',
          title: 'IP',
        },
        {
          field: 'spec',
          title: this.$t('network.text_268'),
          formatter: ({ cellValue, row }) => {
            const g = function (sz, prefix) {
              if (!prefix || prefix.length === 0) {
                prefix = ''
              }
              if (sz && sz > 0) {
                return `${prefix}${sizestr(sz, 'M', 1024)}`
              } else {
                return ''
              }
            }
            let cpu = ''
            if (cellValue.cpu && cellValue.cpu > 0) {
              cpu = `${cellValue.cpu}C`
            }
            const mem = g(cellValue.mem)
            let ssd = ''
            let hdd = ''
            if (cellValue.disk) {
              if (cellValue.disk.SSD) {
                ssd = 'SSD'
                for (const key in cellValue.disk.SSD) {
                  ssd += `${g(cellValue.disk.SSD[key])}x${cellValue.disk.SSD[key]}`
                }
              }
              if (cellValue.disk.HDD) {
                hdd = 'HDD'
                for (const key in cellValue.disk.HDD) {
                  hdd += `${g(key)}x${cellValue.disk.HDD[key]}`
                }
              }
            }
            let driver = ''
            if (cellValue && cellValue.driver && cellValue.driver !== 'Linux') {
              driver = 'RAID'
            }
            return `${cpu}${mem}${hdd}${ssd}${driver}`
          },
        },
        {
          field: 'sn',
          title: 'SN',
        },
        {
          field: 'guests',
          title: this.$t('network.text_704'),
          formatter: ({ cellValue, row }) => {
            return cellValue ? this.$t('network.text_705') : this.$t('network.text_706')
          },
        },
        {
          field: 'id',
          title: 'IPMI',
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
            },
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
