<template>
  <div>
    <page-header title="服务(Service)" />
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
