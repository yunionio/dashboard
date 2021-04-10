<template>
  <div>
    <page-header :title="$t('k8s.text_358')" />
    <page-body>
      <k8sstorageclasses-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sstorageclassesList from './components/List'

export default {
  name: 'K8SStorageclassesIndex',
  components: {
    K8sstorageclassesList,
  },
  data () {
    return {
      listId: 'K8sStorageclassesList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
