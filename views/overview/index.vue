<template>
  <div>
    <page-header :title="$t('monitor.text_18')" />
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
