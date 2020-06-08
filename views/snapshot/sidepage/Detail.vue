<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="snapshots"
    status-module="snapshot" />
</template>

<script>
import { CREATE_METHODS } from '../constants'
import { getStorageTypeTableColumn } from '../utils/columns'
import { sizestr } from '@/utils/utils'
import { getBrandTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SnapshotDetail',
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
        {
          field: 'size',
          title: '快照大小',
          formatter: ({ cellValue, row }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'created_by',
          title: '创建方式',
          formatter: ({ cellValue }) => {
            return CREATE_METHODS[cellValue]
          },
        },
        {
          field: 'resource',
          title: '快照类别',
          formatter: ({ cellValue }) => {
            return '硬盘快照'
          },
        },
        {
          field: 'guest',
          title: this.$t('dictionary.server'),
          slots: {
            default: ({ row }, h) => {
              if (row.guest) {
                return [
                  <div>
                    <side-page-trigger permission="server_get" name="VmInstanceSidePage" id={row.guest_id} vm={this}>{row.guest}</side-page-trigger>
                    {row.guest_status ? <status status={ row.guest_status } statusModule='server'/> : ''}
                  </div>,
                ]
              }
              return [<div>-</div>]
            },
          },
        },
        {
          field: 'disk_type',
          title: '磁盘属性',
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
        },
        {
          field: 'disk',
          title: '硬盘',
          slots: {
            default: ({ row }, h) => {
              if (row.disk_status) {
                return [
                  <div>
                    <side-page-trigger permission="disks_get" name="DiskSidePage" id={row.disk_id} vm={this}>{ row.disk_name }</side-page-trigger>
                    {row.disk_status ? <status status={ row.disk_status } statusModule='disk'/> : ''}
                  </div>,
                ]
              }
              return [<div>-</div>]
            },
          },
        },
        getStorageTypeTableColumn(),
      ],
      extraInfo: [],
    }
  },
}
</script>
