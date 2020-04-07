<template>
  <div>
    <page-header title="容器组(Pod)" />
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
