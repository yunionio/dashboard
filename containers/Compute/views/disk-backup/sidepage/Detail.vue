<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="diskbackups"
    status-module="diskBackup" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getTagTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

import {
  getSizeMbTableColumn,
  getDiskTypeTableColumn,
  // getDiskNameTableColumn,
  getDiskSizeTableColumn,
  getBackupStorageNameTableColumn,
} from '../utils/columns'

export default {
  name: 'DiskBackupDetail',
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
        getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'diskbackups', columns: () => this.columns }),
        getDiskTypeTableColumn(),
        {
          field: 'disk_name',
          title: this.$t('res.disk'),
          minWidth: 100,
          sortable: true,
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger name='DiskSidePage' id={row.disk_id} vm={this} init>{row.disk_name}</side-page-trigger>,
              ]
            },
          },
        },
        getDiskSizeTableColumn(),
        getBackupStorageNameTableColumn(),
        getSizeMbTableColumn(),
        getBrandTableColumn(),
      ],
      extraInfo: [],
    }
  },
}
</script>
