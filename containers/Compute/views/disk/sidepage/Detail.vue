<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    auto-hidden-columns-key="disk_hidden_columns"
    resource="disks"
    status-module="disk" />
</template>

<script>
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import { getBrandTableColumn, getBillingTypeTableColumn } from '@/utils/common/tableColumn'
import { findPlatform } from '@/utils/common/hypervisor'
import WindowsMixin from '@/mixins/windows'
import { getUnusedTableColumn, getPreallocationTableColumn } from '../utils/columns'
import { MEDIUM_MAP, SERVER_TYPE } from '../../../constants'

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
        getPreallocationTableColumn(),
        {
          field: 'iops',
          title: this.$t('compute.max_iops'),
          formatter: ({ row }) => {
            return row.iops || '-'
          },
        },
        {
          field: 'throughput',
          title: this.$t('compute.throughput'),
          formatter: ({ row }) => {
            return row.throughput || '-'
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
        {
          field: 'auto_reset',
          title: this.$t('compute.shutdown_auto_reset'),
          formatter: ({ row }) => {
            return row.auto_reset ? this.$t('common.true') : this.$t('common.false')
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('compute.title.encryption'),
          items: [
            {
              field: 'encrypt_key_id',
              title: this.$t('compute.title.encryption_key'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_key_id) {
                  if (row.encrypt_key && row.encrypt_alg) {
                    return row.encrypt_key + ' (' + row.encrypt_key_id + ')'
                  } else {
                    return row.encrypt_key_id
                  }
                } else {
                  return this.$t('compute.no_encryption')
                }
              },
            },
            {
              field: 'encrypt_alg',
              title: this.$t('compute.title.encrypt_alg'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_alg) {
                  return row.encrypt_alg.toUpperCase()
                } else {
                  return '-'
                }
              },
            },
            {
              field: 'encrypt_key_user',
              title: this.$t('compute.title.encrypt_key_user'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_key_user) {
                  return row.encrypt_key_user + ' / ' + row.encrypt_key_user_domain
                } else {
                  return '-'
                }
              },
            },
          ],
          hidden: () => this.$isScopedPolicyMenuHidden('disk_hidden_columns.encryption'),
        },
      ],
    }
  },
}
</script>
