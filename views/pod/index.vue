<template>
  <div>
    <page-header :title="$t('k8s.text_316')" />
    <page-body>
      <pod-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import PodList from './components/List'

export default {
  name: 'K8sPodIndex',
  components: {
    PodList,
  },
  data () {
    return {
      listId: 'K8sPodList',
    }
  },
}
</script>
