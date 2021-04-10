<template>
  <div>
    <page-header :title="$t('k8s.text_295')" />
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
      },
    }
  },
}
</script>
