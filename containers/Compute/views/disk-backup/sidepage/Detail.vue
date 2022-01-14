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
  getDiskNameTableColumn,
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
        getSizeMbTableColumn(),
        getDiskTypeTableColumn(),
        getDiskNameTableColumn(),
        getBackupStorageNameTableColumn(),
        getBrandTableColumn(),
      ],
      extraInfo: [],
    }
  },
}
</script>
