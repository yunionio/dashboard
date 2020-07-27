<template>
  <div>
    <page-header :title="$t('k8s.text_346')" />
    <page-body>
      <statefulset-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import StatefulsetList from './components/List'

export default {
  name: 'K8sStatefulsetIndex',
  components: {
    StatefulsetList,
  },
  data () {
    return {
      listId: 'K8sStatefulsetList',
    }
  },
}
</script>
