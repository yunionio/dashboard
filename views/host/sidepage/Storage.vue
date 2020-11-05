<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'StorageList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'StorageListForHostSidePage',
        resource: 'storages',
        ctx: [['hosts', this.resId]],
        idKey: 'storage_id',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'storage',
          title: this.$t('compute.text_228'),
          showOverflow: 'ellipsis',
          minWidth: 120,
        },
        {
          field: 'capacity',
          title: this.$t('compute.text_397'),
          showOverflow: 'ellipsis',
          minWidth: 70,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'used_capacity',
          title: this.$t('compute.text_602'),
          showOverflow: 'ellipsis',
          minWidth: 70,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'waste_capacity',
          title: this.$t('compute.text_603'),
          showOverflow: 'ellipsis',
          minWidth: 70,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'storage_type',
          title: this.$t('compute.text_380'),
          showOverflow: 'ellipsis',
          minWidth: 100,
          formatter: ({ cellValue }) => {
            switch (cellValue) {
              case 'local':
                return this.$t('compute.text_575')
              case 'baremetal':
                return this.$t('compute.text_604')
              case 'nas':
                return this.$t('compute.text_605')
              case 'vsan':
                return 'vSAN'
              default:
                return cellValue
            }
          },
        },
        getEnabledTableColumn(),
        {
          field: 'mount_point',
          title: this.$t('compute.text_327'),
          showOverflow: 'ellipsis',
          minWidth: 120,
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
