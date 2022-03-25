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
import { MEDIUM_MAP, SERVER_TYPE } from '../../../constants'
import { getUnusedTableColumn } from '../utils/columns'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import { getBrandTableColumn, getBillingTypeTableColumn } from '@/utils/common/tableColumn'
import { findPlatform } from '@/utils/common/hypervisor'
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
        getUserTagColumn({
          onManager: this.onManager,
          resource: 'disk',
          columns: () => this.columns,
          tipName: this.$t('compute.text_100'),
          editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
        }),
        getExtTagColumn({
          onManager: this.onManager,
          resource: 'disk',
          columns: () => this.columns,
          tipName: this.$t('compute.text_100'),
          editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
        }),
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
              const guests = row.guests.map((guest, index) => {
                return <side-page-trigger permission="server_get" name="VmInstanceSidePage" id={guest.id} vm={this}>
                  {guest.name}
                  <status status={ guest.status } statusModule='server'/>
                </side-page-trigger>
              })
              return [
                <div>
                  { guests }
                </div>,
              ]
            },
          },
        },
        {
          field: 'storage',
          title: this.$t('compute.text_99'),
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              if (findPlatform(row.provider, 'provider') === SERVER_TYPE.public) {
                return '-'
              }
              const text = row.storage || '-'
              return [
                <list-body-cell-wrap copy hideField={true} field='storage' row={row} message={text}>
                  <side-page-trigger permission='storages_get' name='BlockStorageSidePage' id={row.storage_id} vm={this}>{row.storage}</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
          hidden: () => this.$store.getters.isProjectMode,
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
