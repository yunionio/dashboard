<template>
  <div>
    <page-header :title="$t('k8s.text_376')" />
    <page-body>
      <k8s-rbacclusterrole-list :id="listId" :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import K8sRbacclusterroleList from './components/List'

export default {
  name: 'K8SRbacclusteroleIndex',
  components: {
    K8sRbacclusterroleList,
  },
  data () {
    return {
      listId: 'K8SRbacclusteroleList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
