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
import { sizestr, percentstr } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HostsList',
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
          baremetal: false,
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
        getStatusTableColumn({ statusModule: 'host' }),
        {
          field: 'guests',
          title: '#VM',
          formatter: ({ cellValue, row }) => {
            if (typeof row.nonsystem_guests !== 'undefined') {
              return '' + row.nonsystem_guests
            } else if (typeof cellValue !== 'undefined') {
              return '' + cellValue
            }
            return '0'
          },
        },
        {
          field: 'cpu_count',
          title: 'CPU',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return '' + cellValue + '/' + percentstr(row.cpu_commit_rate)
            } else {
              return 'N/A'
            }
          },
        },
        {
          field: 'mem_size',
          title: '内存',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return sizestr(cellValue, 'M', 1024) + '/' + percentstr(row.mem_commit_rate)
            } else {
              return 'N/A'
            }
          },
        },
        {
          field: 'storage_size',
          title: '存储',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return sizestr(cellValue, 'M', 1024)
            } else {
              return 'N/A'
            }
          },
        },
        {
          field: 'sn',
          title: 'SN',
        },
        {
          field: 'id',
          title: 'IPMI',
          slots: {
            default: ({ cellValue, row }) => {
              if (!row.is_baremetal) {
                return '-'
              } else {
                return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
              }
            },
          },
        },
        {
          field: 'server_id',
          title: '初始账号',
          slots: {
            default: ({ cellValue, row }) => {
              if (!row.is_baremetal) {
                return '-'
              } else {
                return [<PasswordFetcher serverId={ row.id } resourceType='baremetals' />]
              }
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
