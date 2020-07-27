<template>
  <div>
    <page-header :title="$t('compute.text_109')" />
    <page-body>
      <sku-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import SkuList from './components/List'

export default {
  name: 'SKUIndex',
  components: {
    SkuList,
  },
  data () {
    return {
      listId: 'SkuList',
    }
  },
}
</script>
