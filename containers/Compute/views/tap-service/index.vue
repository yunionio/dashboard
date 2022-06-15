<template>
  <div>
    <page-header :title="$t('dictionary.tap_service')" />
    <page-body>
      <tap-service-list
        :id="listId"
        :filterParams="filterParams" />
    </page-body>
  </div>
</template>

<script>
import TapServiceList from './components/List'

export default {
  name: 'TapServiceIndex',
  components: {
    TapServiceList,
  },
  data () {
    return {
      listId: 'TapServiceList',
    }
  },
}
</script>
