<template>
  <div>
    <page-header :title="$t('k8s.vc_job')" />
    <page-body>
      <vcjob-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import VcjobList from './components/List'

export default {
  name: 'K8sVcjobIndex',
  components: {
    VcjobList,
  },
  data () {
    return {
      listId: 'K8sVcjobList',
    }
  },
}
</script>
