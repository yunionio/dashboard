<template>
  <div>
    <page-header :title="$t('aice.app_llm_sku')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from '../llm-sku/components/List'

export default {
  name: 'AppLlmSkuIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'AppLlmSkuList',
    }
  },
}
</script>
