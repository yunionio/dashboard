<template>
  <div>
    <page-header :title="$t('aice.desktop_llm_sku')" />
    <page-body class="llm-sku-list-page-body">
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from '@Ai/views/llm-sku/components/List'

export default {
  name: 'AppDesktopSkuIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'AppDesktopSkuList',
    }
  },
}
</script>

<style scoped>
.llm-sku-list-page-body {
  overflow-x: hidden;
}
</style>
