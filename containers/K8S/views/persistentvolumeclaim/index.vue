<template>
  <div>
    <page-header :title="$t('k8s.text_310')" />
    <page-body>
      <persistentvolumeclaim-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import PersistentvolumeclaimList from './components/List'

export default {
  name: 'K8sPersistentvolumeclaimIndex',
  components: {
    PersistentvolumeclaimList,
  },
  data () {
    return {
      listId: 'K8sPersistentvolumeclaimList',
    }
  },
}
</script>
