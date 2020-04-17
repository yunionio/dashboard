<template>
  <div>
    <page-header title="备份管理" />
    <page-body>
      <backup-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import BackupList from './components/List'
export default {
  name: 'RDSIndex',
  components: {
    BackupList,
  },
  data () {
    return {
      listId: 'RDSBackupList',
    }
  },
}
</script>
