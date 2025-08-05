<template>
  <div>
   <page-header :title="$t('network.health_check')" />
   <page-body>
     <list
      :id="listId" />
   </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'HealthCheckIndex',
  components: {
    List,
  },
  mixins: [],
  data () {
    return {
      listId: 'HealthCheckList',
    }
  },
}
</script>
