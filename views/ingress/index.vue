<template>
  <div>
    <page-header title="路由(Ingress)" />
    <page-body>
      <ingress-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import IngressList from './components/List'

export default {
  name: 'K8sIngressIndex',
  components: {
    IngressList,
  },
  data () {
    return {
      listId: 'K8sIngressList',
    }
  },
}
</script>
