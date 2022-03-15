<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="backupstorages"
    status-module="backupStorage"
    :hiddenKeys="['tenant']" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getTagTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getStorageTypeColumns,
  getCapacityMbColumns,
  getNFSHostColumns,
  getNFSSharedDirColumns,
} from '../utils/columns'

export default {
  name: 'BackupStorageDetail',
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
        getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'backupstorages', columns: () => this.columns }),
        getPublicScopeTableColumn({ vm: this, resource: 'backupstorages' }),
        getStorageTypeColumns(),
        getNFSHostColumns(),
        getNFSSharedDirColumns(),
        getCapacityMbColumns(),
      ],
      extraInfo: [],
    }
  },
}
</script>
