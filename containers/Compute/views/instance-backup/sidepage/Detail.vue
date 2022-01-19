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
  getGuestTableColumn,
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
        getGuestTableColumn(),
        getOsArch(),
        getOsTypeTableColumn(),
      ],
      extraInfo: [],
    }
  },
}
</script>
