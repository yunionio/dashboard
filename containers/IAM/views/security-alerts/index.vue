<template>
  <div>
    <page-header :title="$t('dictionary.security-alerts')" />
    <page-body>
      <list id="security-alerts-list" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'SecurityAlerts',
  components: {
    List,
  },
}
</script>
