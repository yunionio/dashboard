<template>
  <div>
    <page-header :title="$t('k8s.vc_podgroup')" />
    <page-body>
      <vcpodgroup-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import VcpodgroupList from './components/List'

export default {
  name: 'K8sVcpodgroupIndex',
  components: {
    VcpodgroupList,
  },
  data () {
    return {
      listId: 'K8sVcpodgroupList',
    }
  },
}
</script>
