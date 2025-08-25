<template>
  <div>
    <page-header
      :title="$t('compute.backup_storage')"
      isShowResStatusTab
      :status-opts="statusOpts"
      :status-click-handle="statusClickHandle" />
    <page-body>
      <backup-storage-list
        :id="listId"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        statusResKey="backupStorage"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import BackupStorageList from './components/List'

export default {
  name: 'BackupStorageIndex',
  components: {
    BackupStorageList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'BackupStorageList',
      statusNormalList: ['online', 'offline'],
      statusHiddenList: ['error'],
    }
  },
}
</script>
