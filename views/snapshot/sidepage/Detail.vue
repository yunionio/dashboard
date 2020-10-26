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
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
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
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'snapshot', columns: () => this.columns, tipName: this.$t('compute.text_462') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'snapshot', columns: () => this.columns, tipName: this.$t('compute.text_462') }),
        getBrandTableColumn(),
        {
          field: 'size',
          title: this.$t('compute.text_422'),
          formatter: ({ cellValue, row }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'created_by',
          title: this.$t('compute.text_1070'),
          formatter: ({ cellValue }) => {
            return CREATE_METHODS[cellValue]
          },
        },
        {
          field: 'resource',
          title: this.$t('compute.text_1071'),
          formatter: ({ cellValue }) => {
            return this.$t('compute.text_101')
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
          title: this.$t('compute.text_1072'),
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? this.$t('compute.text_49') : this.$t('compute.text_50')
          },
        },
        {
          field: 'disk',
          title: this.$t('compute.text_100'),
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
