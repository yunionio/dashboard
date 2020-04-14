<template>
  <div>
    <page-header title="守护进程(Daemonset)" />
    <page-body>
      <daemonset-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import DaemonsetList from './components/List'

export default {
  name: 'K8sDaemonsetIndex',
  components: {
    DaemonsetList,
  },
  data () {
    return {
      listId: 'K8sDaemonsetList',
    }
  },
}
</script>
