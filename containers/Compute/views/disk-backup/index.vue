<template>
  <div>
    <page-header :title="$t('compute.disk_backup')" />
    <page-body>
      <disk-backup-list
        :id="listId" />
    </page-body>
  </div>
</template>

<script>
import DiskBackupList from './components/List'

export default {
  name: 'DiskBackupIndex',
  components: {
    DiskBackupList,
  },
  data () {
    return {
      listId: 'DiskBackupList',
    }
  },
}
</script>
