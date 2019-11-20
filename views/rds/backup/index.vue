<template>
  <div>
    <page-header title="备份管理" />
    <page-body>
      <backup-list />
    </page-body>
  </div>
</template>

<script>
import BackupList from '../components/BackupList'
export default {
  name: 'RDSIndex',
  components: {
    BackupList,
  },
}
</script>
