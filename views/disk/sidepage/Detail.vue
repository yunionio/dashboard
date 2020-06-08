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
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
        {
          field: 'disk_size',
          title: '容量',
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'disk_type',
          title: '磁盘类型',
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
        },
        getUnusedTableColumn(),
        {
          field: 'disk_format',
          title: '格式',
        },
        {
          field: 'medium_type',
          title: '介质类型',
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
          title: '快照策略',
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
