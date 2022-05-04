<template>
  <vxe-grid class="mb-2" :data="data.snapshots" :columns="columns" :resizable="true" />
</template>

<script>
import { DISK_TYPES, STORAGE_TYPES } from '../constants'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import { steadyStatus } from '../../snapshot/constants'

export default {
  name: 'SubSnapshotDetail',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          addEncrypt: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'size',
          title: this.$t('compute.text_422'),
          formatter: ({ row }) => {
            return sizestr(row.size, 'M', 1024)
          },
        },
        {
          field: 'disk_type',
          title: this.$t('compute.text_381'),
          formatter: ({ row }) => {
            return DISK_TYPES[row.disk_type] || row.disk_type
          },
        },
        {
          field: 'storage_type',
          title: this.$t('compute.text_380'),
          formatter: ({ row }) => {
            return STORAGE_TYPES[row.storage_type] || row.storage_type || '-'
          },
        },
        // getStatusTableColumn({ statusModule: 'snapshot' }),
        {
          field: 'created_at',
          title: this.$t('compute.text_243'),
          formatter: ({ cellValue }) => {
            if (cellValue) {
              return this.$moment(cellValue).format()
            }
            return '-'
          },
        },
      ],
    }
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SnapshotSidePage', {
        id: row.id,
        resource: 'snapshots',
        getParams: this.getParam,
        steadyStatus: steadyStatus,
      }, {
        list: this.list,
        type: 'disk',
      })
    },
  },
}
</script>
