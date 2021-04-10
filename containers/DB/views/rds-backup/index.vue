<template>
  <div>
    <page-header :title="$t('db.text_190')" />
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
