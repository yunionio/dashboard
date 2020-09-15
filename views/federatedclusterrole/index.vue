<template>
  <div>
    <page-header title="集群角色(FederatedClusterRole)" />
    <page-body>
      <k8s-federatedclusterrole-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sFederatedclusterroleList from './components/List'

export default {
  name: 'K8SFederatedclusterroleIndex',
  components: {
    K8sFederatedclusterroleList,
  },
  data () {
    return {
      listId: 'K8SFederatedclusterroleList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
