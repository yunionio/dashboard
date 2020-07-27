<template>
  <div>
    <page-header :title="$t('k8s.text_239')" />
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
