<template>
  <div>
    <page-header :title="$t('cloudenv.text_501')" />
    <page-body>
      <list :id="listId" :get-params="getParams" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'StrategyDefinition',
  components: {
    List,
  },
  data () {
    return {
      listId: 'StrategyDefinitionList',
      getParams: {
        details: true,
      },
    }
  },
}
</script>
