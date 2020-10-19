<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { ALL_STORAGE } from '@Compute/constants'
import { getCopyWithContentTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'DiskListForBaremetalSidepage',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'DiskListForBaremetalSidepage',
        resource: 'disks',
        ctx: [['servers', this.resId]],
        idKey: 'disk_id',
        steadyStatus: Object.values(expectStatus.disk).flat(),
        getParams: this.getParams,
        filterOptions: {
          network: {
            label: this.$t('compute.text_228'),
            filter: true,
            formatter: val => {
              return `network.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        {
          field: 'index',
          title: this.$t('compute.text_375'),
          width: 50,
          formatter: ({ row }) => {
            return row.index ? row.index : '0'
          },
        },
        getCopyWithContentTableColumn({ field: 'disk', title: this.$t('compute.text_376') }),
        {
          field: 'disk_size',
          title: this.$t('compute.text_377'),
          sortable: true,
          showOverflow: 'ellipsis',
          minWidth: 60,
          formatter: ({ row }) => {
            return sizestr(row.disk_size, 'M', 1024)
          },
        },
        {
          field: 'driver',
          title: this.$t('compute.text_378'),
          width: 80,
        },
        {
          field: 'cache_mode',
          title: this.$t('compute.text_379'),
          width: 150,
          formatter: ({ row }) => {
            return row.cache_mode ? row.cache_mode : '-'
          },
        },
        getStatusTableColumn({ statusModule: 'disk' }),
        {
          field: 'storage_type',
          title: this.$t('compute.text_380'),
          width: 80,
          formatter: ({ row }) => {
            if (row.storage_type) {
              if (row.storage_type === 'baremetal') return this.$t('compute.text_92')
              return (ALL_STORAGE[row.storage_type] && ALL_STORAGE[row.storage_type].label) || row.storage_type
            }
            return '-'
          },
        },
        {
          field: 'disk_type',
          title: this.$t('compute.text_381'),
          width: 80,
          formatter: ({ row }) => {
            const diskType = {
              sys: this.$t('compute.text_49'),
              data: this.$t('compute.text_50'),
            }
            if (row.disk_type) {
              return diskType[row.disk_type] || row.disk_type
            }
            return '-'
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
