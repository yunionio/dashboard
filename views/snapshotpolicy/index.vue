<template>
  <div>
    <page-header title="自动快照策略" />
    <page-body>
      <snapshot-policy-list />
    </page-body>
  </div>
</template>

<script>
import SnapshotPolicyList from './components/List'

export default {
  name: 'SnapshotPolicyIndex',
  components: {
    SnapshotPolicyList,
  },
}
</script>
