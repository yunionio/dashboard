<template>
  <div>
    <page-header title="节点" />
    <page-body>
      <k8snode-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8snodeList from './components/List'

export default {
  name: 'K8SNodeIndex',
  components: {
    K8snodeList,
  },
  data () {
    return {
      listId: 'K8SNodeList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
