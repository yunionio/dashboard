<template>
  <div>
    <page-header :title="$t('aice.llm_sku')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'LlmSkuIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'LlmSkuList',
    }
  },
}
</script>
