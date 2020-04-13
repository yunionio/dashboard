<template>
  <div>
    <page-header title="服务账户(ServiceAccount)" />
    <page-body>
      <k8s-service-account-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sServiceAccountList from './components/List'

export default {
  name: 'K8sServiceAccountIndex',
  components: {
    K8sServiceAccountList,
  },
  data () {
    return {
      listId: 'K8sServerAccountList',
      getParams: {
        details: true,
        admin: true,
      },
    }
  },
}
</script>
