<template>
  <div>
    <page-header :title="$t('compute.backup_storage')" />
    <page-body>
      <backup-storage-list
        :id="listId" />
    </page-body>
  </div>
</template>

<script>
import BackupStorageList from './components/List'

export default {
  name: 'BackupStorageIndex',
  components: {
    BackupStorageList,
  },
  data () {
    return {
      listId: 'BackupStorageList',
    }
  },
}
</script>
