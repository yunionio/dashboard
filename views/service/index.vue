<template>
  <div>
    <page-header :title="$t('k8s.text_341')" />
    <page-body>
      <service-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ServiceList from './components/List'

export default {
  name: 'K8sServiceIndex',
  components: {
    ServiceList,
  },
  data () {
    return {
      listId: 'K8sServiceList',
    }
  },
}
</script>
