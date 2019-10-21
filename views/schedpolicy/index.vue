<template>
  <div>
    <page-header title="调度策略" />
    <page-body>
      <schedpolicy-list />
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
}
</script>
