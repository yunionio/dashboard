<template>
  <div>
    <page-header title="套餐" />
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
