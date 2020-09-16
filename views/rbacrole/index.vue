<template>
  <div>
    <page-header :title="$t('k8s.text_330')" />
    <page-body>
      <k8s-rbac-role-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sRbacRoleList from './components/List'

export default {
  name: 'K8SRbacRoleIndex',
  components: {
    K8sRbacRoleList,
  },
  data () {
    return {
      listId: 'K8SRbacRoleList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
