<template>
  <div>
    <page-header :title="$t('dictionary.monitorresourcealerts')" />
    <page-body>
      <alert-record-shields-list listId="AlertRecordShieldsList" />
    </page-body>
  </div>
</template>

<script>
import AlertRecordShieldsList from './components/List'

export default {
  name: 'AlertRecordShieldsIndex',
  components: {
    AlertRecordShieldsList,
  },
}
</script>

<style scoped>

</style>
