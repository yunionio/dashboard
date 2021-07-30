<template>
  <div>
    <page-header :title="$t('compute.webapp')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'WebAppIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'WebAppList',
    }
  },
}
</script>
