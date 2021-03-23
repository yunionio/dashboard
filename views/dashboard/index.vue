<template>
  <div>
    <page-header :title="$t('monitor.dashboard.title')" />
    <page-body>
      <dashboard-index />
    </page-body>
  </div>
</template>

<script>
import DashboardIndex from './components'

export default {
  name: 'MonitorDashboardIndex',
  components: {
    DashboardIndex,
  },
}
</script>

<style scoped>

</style>
