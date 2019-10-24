<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getRegionTableColumn, getStatusTableColumn, getEnabledTableColumn, getNameDescriptionTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'

export default {
  name: 'PhysicalmachineList',
  props: {
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'hosts',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
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
        {
          field: 'spec',
          title: '规格',
          formatter: ({ row }) => {
            if (!row.spec) return '-'
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
            let spec = row.spec
            let cpu = ''
            if (spec.cpu && spec.cpu > 0) {
              cpu = `${spec.cpu}C`
            }
            let mem = g(spec.mem)
            let ssd = ''
            let hdd = ''
            if (spec.disk) {
              if (spec.disk.SSD) {
                ssd = 'SSD'
                for (let key in spec.disk.SSD) {
                  ssd += `${g(spec.disk.SSD[key])}x${spec.disk.SSD[key]}`
                }
              }
              if (spec.disk.HDD) {
                hdd = 'HDD'
                for (let key in spec.disk.HDD) {
                  hdd += `${g(key)}x${spec.disk.HDD[key]}`
                }
              }
            }
            let driver = ''
            if (spec && spec.driver && spec.driver !== 'Linux') {
              driver = 'RAID'
            }
            return `${cpu}${mem}${hdd}${ssd}${driver}`
          },
        },
        getCopyWithContentTableColumn({ field: 'sn', title: 'SN' }),
        {
          field: 'server',
          title: '分配',
        },
        {
          field: 'login_ssh',
          title: '初始账号',
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='baremetal_ssh' />]
            },
          },
        },
        {
          field: 'ipmi',
          title: 'IPMI',
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
            },
          },
        },
        {
          field: 'is_maintenance',
          title: '维护模式',
          formatter: ({ row }) => {
            return row.is_maintenance ? '维护模式' : '正常'
          },
        },
        getRegionTableColumn(),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
