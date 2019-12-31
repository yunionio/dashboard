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
  mixins: [ DialogMixin, WindowsMixin ],
  props: {
    resId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'hosts',
        getParams: {
          details: true,
          wire: this.resId,
          baremetal: true,
        },
        filterOptions: {
          name: {
            label: '名称',
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
          title: '名称',
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'server' }),
        {
          field: 'access_ip',
          title: 'IP',
        },
        {
          field: 'spec',
          title: '规格',
          formatter: ({ cellValue, row }) => {
            let g = function (sz, prefix) {
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
            let mem = g(cellValue.mem)
            let ssd = ''
            let hdd = ''
            if (cellValue.disk) {
              if (cellValue.disk.SSD) {
                ssd = 'SSD'
                for (let key in cellValue.disk.SSD) {
                  ssd += `${g(cellValue.disk.SSD[key])}x${cellValue.disk.SSD[key]}`
                }
              }
              if (cellValue.disk.HDD) {
                hdd = 'HDD'
                for (let key in cellValue.disk.HDD) {
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
          title: '分配',
          formatter: ({ cellValue, row }) => {
            return cellValue ? '已分配' : '未分配'
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
