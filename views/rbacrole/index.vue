<template>
  <div>
    <page-header title="角色(RbacRole)" />
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
        admin: true,
      },
    }
  },
}
</script>
