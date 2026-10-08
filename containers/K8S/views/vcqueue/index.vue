<template>
  <div>
    <page-header :title="$t('k8s.vc_queue')" />
    <page-body>
      <vcqueue-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import VcqueueList from './components/List'

export default {
  name: 'K8sVcqueueIndex',
  components: {
    VcqueueList,
  },
  data () {
    return {
      listId: 'K8sVcqueueList',
    }
  },
}
</script>
