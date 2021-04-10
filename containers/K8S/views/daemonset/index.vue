<template>
  <div>
    <page-header :title="$t('k8s.text_234')" />
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
