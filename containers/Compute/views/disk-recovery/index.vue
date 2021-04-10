<template>
  <div>
    <page-header :title="$t('compute.text_479')" />
    <page-body>
      <disk-recovery-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import DiskRecoveryList from './components/List'

export default {
  name: 'DiskRecoveryIndex',
  components: {
    DiskRecoveryList,
  },
  data () {
    return {
      listId: 'DiskRecoveryList',
    }
  },
}
</script>
