<template>
  <div>
    <page-header title="调度策略" />
    <page-body>
      <schedpolicy-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import SchedpolicyList from './components/List'

export default {
  name: 'Schedpolicy',
  components: {
    SchedpolicyList,
  },
  data () {
    return {
      listId: 'SchedpolicyList',
    }
  },
}
</script>
