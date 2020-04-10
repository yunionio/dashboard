<template>
  <div>
    <page-header title="主机回收站" />
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
