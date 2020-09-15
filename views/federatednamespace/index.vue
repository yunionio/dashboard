<template>
  <div>
    <page-header title="命名空间(FederatedNamespace)" />
    <page-body>
      <k8s-federatednamespace-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sFederatednamespaceList from './components/List'

export default {
  name: 'K8SFederatednamespaceIndex',
  components: {
    K8sFederatednamespaceList,
  },
  data () {
    return {
      listId: 'K8SFederatednamespaceList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
