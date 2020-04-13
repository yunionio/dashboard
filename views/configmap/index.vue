<template>
  <div>
    <page-header title="配置项(Configmap)" />
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
