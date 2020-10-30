<template>
  <div>
    <page-header :title="$t('cloudenv.text_500')" />
    <page-body>
      <list :id="listId" :get-params="getParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'StrategyAllocation',
  components: {
    List,
  },
  data () {
    return {
      listId: 'StrategyAllocationList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
