<template>
  <div>
    <page-header :title="$t('k8s.text_236')" />
    <page-body>
      <deployment-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import DeploymentList from './components/List'

export default {
  name: 'K8sDeploymentIndex',
  components: {
    DeploymentList,
  },
  data () {
    return {
      listId: 'K8sDeploymentList',
    }
  },
}
</script>
