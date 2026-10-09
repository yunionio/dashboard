<template>
  <div>
    <page-header :title="$t('k8s.vc_hypernode')" />
    <page-body>
      <vchypernode-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import VchypernodeList from './components/List'

export default {
  name: 'K8sVchypernodeIndex',
  components: {
    VchypernodeList,
  },
  data () {
    return {
      listId: 'K8sVchypernodeList',
    }
  },
}
</script>
