<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="instance_snapshots"
    status-module="snapshot" />
</template>

<script>
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import { getOsArch } from '@/utils/common/tableColumn'
import { CREATE_METHODS } from '../constants'

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
        getUserTagColumn({ onManager: this.onManager, resource: 'instance_snapshot', columns: () => this.columns, tipName: this.$t('compute.text_462') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'instance_snapshot', columns: () => this.columns, tipName: this.$t('compute.text_462') }),
        {
          field: 'size_mb',
          title: this.$t('compute.text_422'),
          formatter: ({ cellValue, row }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'virtual_size_mb',
          title: this.$t('compute.disk_size'),
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
            return this.$t('compute.text_102')
          },
        },
        getOsArch(),
        {
          field: 'rules',
          title: this.$t('table.title.sub_snapshot'),
          slots: {
            default: ({ row }) => {
              const len = (row.snapshots && row.snapshots.length) || 0
              return <a onClick={ () => this.$emit('tab-change', 'sub-snapshot-detail') }>{len}{this.$t('common.text00003')}</a>
            },
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
        },
      ],
    }
  },
}
</script>
