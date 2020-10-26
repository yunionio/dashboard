<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="disks"
    status-module="disk" />
</template>

<script>
import { MEDIUM_MAP } from '../../../constants'
import { getUnusedTableColumn } from '../utils/columns'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import { getBrandTableColumn, getBillingTypeTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DiskDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'disk', columns: () => this.columns, tipName: this.$t('compute.text_100') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'disk', columns: () => this.columns, tipName: this.$t('compute.text_100') }),
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
        {
          field: 'disk_size',
          title: this.$t('compute.text_397'),
          formatter: ({ cellValue }) => {
            return cellValue ? sizestr(cellValue, 'M', 1024) : '-'
          },
        },
        {
          field: 'disk_type',
          title: this.$t('compute.text_381'),
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? this.$t('compute.text_49') : this.$t('compute.text_50')
          },
        },
        getUnusedTableColumn(),
        {
          field: 'disk_format',
          title: this.$t('compute.text_398'),
          formatter: ({ cellValue }) => {
            return cellValue || '-'
          },
        },
        {
          field: 'medium_type',
          title: this.$t('table.title.disk_medium_type'),
          formatter: ({ cellValue }) => {
            return MEDIUM_MAP[cellValue]
          },
        },
        {
          field: 'guest',
          title: this.$t('dictionary.server'),
          slots: {
            default: ({ row }, h) => {
              if (!row.guest || row.guests.length <= 0) return '-'
              return [
                <div>
                  <side-page-trigger permission="server_get" name="VmInstanceSidePage" id={row.guests[0].id} vm={this}>{row.guest}</side-page-trigger>
                  {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : '-'}
                </div>,
              ]
            },
          },
        },
        {
          field: 'snapshotpolicies',
          title: this.$t('compute.text_461'),
          formatter: ({ row }, h) => {
            if (row.snapshotpolicies && row.snapshotpolicies.length > 0) {
              return row.snapshotpolicies.map(item => item.name).join('、')
            }
            return '-'
          },
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
