<template>
  <div>
    <page-header :title="$t('compute.text_1038')" />
    <page-body>
      <server-recovery-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ServerRecoveryList from './components/List'

export default {
  name: 'ServerRecoveryIndex',
  components: {
    ServerRecoveryList,
  },
  data () {
    return {
      listId: 'ServerRecoveryList',
    }
  },
}
</script>
