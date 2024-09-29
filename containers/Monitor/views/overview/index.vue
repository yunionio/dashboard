<template>
  <div>
    <page-header :title="$t('common.monitor_overview')" />
    <page-body>
      <overview-index />
    </page-body>
  </div>
</template>

<script>
import OverviewIndex from './components'

export default {
  name: 'MonitorOverview',
  components: {
    OverviewIndex,
  },
}
</script>
