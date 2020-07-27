<template>
  <div>
    <page-header :title="$t('compute.text_103')" />
    <page-body>
      <snapshot-policy-list :id="listId" />
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
  data () {
    return {
      listId: 'SnapshotpolicyList',
    }
  },
}
</script>
