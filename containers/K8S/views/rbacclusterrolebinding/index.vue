<template>
  <div>
    <page-header :title="$t('k8s.text_377')" />
    <page-body>
      <k8s-rbacclusterrolebinding-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sRbacclusterrolebindingList from './components/List'

export default {
  name: 'K8SRbacRoleIndex',
  components: {
    K8sRbacclusterrolebindingList,
  },
  data () {
    return {
      listId: 'K8SRbacclusterrolebindingList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
