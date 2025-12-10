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
  getStorageTypeColumn,
  // getCapacityMbColumns,
  getNFSHostColumn,
  getNFSSharedDirColumn,
  getObjectBucketURLColumn,
  getObjectBucketURLExtColumn,
  getObjectAccessKeyColumn,
  getObjectSignVerColumn,
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
    const baseInfo = [
      getTagTableColumn({ onManager: this.onManager, resource: 'backupstorages', columns: () => this.columns }),
      getPublicScopeTableColumn({ vm: this, resource: 'backupstorages' }),
      getStorageTypeColumn(),
    ]
    if (this.data.storage_type === 'nfs') {
      baseInfo.push(getNFSHostColumn())
      baseInfo.push(getNFSSharedDirColumn())
    } else if (this.data.storage_type === 'object') {
      baseInfo.push(getObjectBucketURLColumn())
      baseInfo.push(getObjectAccessKeyColumn())
      baseInfo.push(getObjectSignVerColumn())
      baseInfo.push(getObjectBucketURLExtColumn())
    }
    return {
      baseInfo: baseInfo,
      extraInfo: [],
    }
  },
}
</script>
