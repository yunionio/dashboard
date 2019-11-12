<template>
  <div>
    <page-header title="硬盘回收站" />
    <page-body>
      <disk-recovery-list />
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
}
</script>
