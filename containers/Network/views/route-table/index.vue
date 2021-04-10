<template>
  <div>
    <page-header :title="$t('dictionary.route_table')" />
    <page-body>
      <route-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import RouteList from './components/List'

export default {
  name: 'RouteTableIndex',
  components: {
    RouteList,
  },
  data () {
    return {
      listId: 'RouteList',
    }
  },
}
</script>
