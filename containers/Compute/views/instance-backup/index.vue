<template>
  <div>
    <page-header :title="$t('compute.instance_backup')" />
    <page-body>
      <instance-backup-list
        :id="listId" />
    </page-body>
  </div>
</template>

<script>
import InstanceBackupList from './components/List'

export default {
  name: 'InstanceBackupIndex',
  components: {
    InstanceBackupList,
  },
  data () {
    return {
      listId: 'InstanceBackupList',
    }
  },
}
</script>
