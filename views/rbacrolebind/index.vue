<template>
  <div>
    <page-header title="角色绑定(RbacRoleBinding)" />
    <page-body>
      <k8s-rbac-role-bind-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sRbacRoleBindList from './components/List'

export default {
  name: 'K8SRbacRoleIndex',
  components: {
    K8sRbacRoleBindList,
  },
  data () {
    return {
      listId: 'K8SRbacRoleBindList',
      getParams: {
        details: true,
        admin: true,
      },
    }
  },
}
</script>
