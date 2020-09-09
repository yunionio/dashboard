<template>
  <div>
    <page-header title="角色绑定(Rbacrolebinding)" />
    <page-body>
      <k8s-rbacrolebinding-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sRbacrolebindingList from './components/List'

export default {
  name: 'K8SRbacRoleIndex',
  components: {
    K8sRbacrolebindingList,
  },
  data () {
    return {
      listId: 'K8SRbacRoleBindingList',
      getParams: {
        details: true,
        admin: true,
      },
    }
  },
}
</script>
