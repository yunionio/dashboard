<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="instancebackups"
    status-module="instanceBackup" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getTagTableColumn,
  getBrandTableColumn,
  getOsArch,
} from '@/utils/common/tableColumn'

import {
  getBackupStorageNameTableColumn,
  // getGuestTableColumn,
  getOsTypeTableColumn,
  getSizeMbTableColumn,
} from '../utils/columns'

export default {
  name: 'InstanceBackupDetail',
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
        getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'instancebackups', columns: () => this.columns }),
        getBackupStorageNameTableColumn(),
        getSizeMbTableColumn(),
        getBrandTableColumn(),
        {
          field: 'guest',
          title: this.$t('compute.text_91'),
          minWidth: 100,
          sortable: true,
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger name='VmInstanceSidePage' id={row.guest_id} vm={this} init>{row.guest}</side-page-trigger>,
              ]
            },
          },
        },
        getOsArch(),
        getOsTypeTableColumn(),
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
