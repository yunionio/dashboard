<template>
  <div>
    <page-header
      :title="$t('compute.disk_backup')" />
    <page-body>
      <disk-backup-list
        :id="listId"
        :tableOverviewIndexs="tableOverviewIndexs"
        statusResKey="diskBackup"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import DiskBackupList from './components/List'

export default {
  name: 'DiskBackupIndex',
  components: {
    DiskBackupList,
  },
  mixins: [ResStatisticsV2Mixin],
  data () {
    return {
      listId: 'DiskBackupList',
      statusModule: 'diskBackup',
    }
  },
}
</script>
