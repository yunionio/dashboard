<template>
  <div>
    <page-header :title="$t('k8s.text_214')" />
    <page-body>
      <configmap-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ConfigmapList from './components/List'

export default {
  name: 'K8sConfigmapIndex',
  components: {
    ConfigmapList,
  },
  data () {
    return {
      listId: 'K8sConfigmapList',
    }
  },
}
</script>
