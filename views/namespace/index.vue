<template>
  <div>
    <page-header title="命名空间(Namespace)" />
    <page-body>
      <k8snamespace-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8snamespaceList from './components/List'

export default {
  name: 'K8SNamespaceIndex',
  components: {
    K8snamespaceList,
  },
  data () {
    return {
      listId: 'K8SNamespaceList',
      getParams: {
        details: true,
        admin: true,
      },
    }
  },
}
</script>
