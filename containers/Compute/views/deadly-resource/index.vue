<template>
  <div>
    <page-header :title="$t('compute.deadly_resource')" />
    <page-body>
      <deadly-resource-list
        :id="listId"
        :getParams="getParams" />
    </page-body>
  </div>
</template>

<script>
import DeadlyResourceList from './components/List'

export default {
  name: 'DeadlyResourceIndex',
  components: {
    DeadlyResourceList,
  },
  data () {
    return {
      listId: 'DeadlyResourceList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
