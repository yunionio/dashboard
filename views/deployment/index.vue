<template>
  <div>
    <page-header title="无状态(Deployment)" />
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
