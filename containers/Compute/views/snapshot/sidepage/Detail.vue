<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="snapshots"
    status-module="snapshot"
    auto-hidden-columns-key="snapshot_hidden_columns" />
</template>

<script>
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import { getBrandTableColumn, getOsArch } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { findPlatform } from '@/utils/common/hypervisor'
import { SERVER_TYPE } from '../../../constants'
import { CREATE_METHODS } from '../constants'
import { getStorageTypeTableColumn } from '../utils/columns'

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
        getOsArch(),
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
          field: 'disk_name',
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
          hidden: () => this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.encryption'),
        },
      ],
    }
  },
}
</script>
