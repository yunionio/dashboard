<template>
  <div>
    <filters ref="FILTERS" @change="handleFilterChange" />
    <size-filters ref="SIZE_FILTER" @change="handleFilterChange" />
    <list ref="LIST" @change="handleSkuChange" />
    <disk-input :selectedSku="selectedSku" />
  </div>
</template>
<script>
import Filters from './components/Filters'
import SizeFilters from './components/SizeFilters'
import List from './components/List'
import DiskInput from './components/DiskInput'
export default {
  name: 'rdsSku',
  components: {
    Filters,
    SizeFilters,
    List,
    DiskInput,
  },
  inject: ['form', 'formItemLayout'],
  data () {
    return {
      selectedSku: {},
    }
  },
  methods: {
    handleFilterChange () {
      const { fetchQuerySkus } = this.$refs['LIST']
      fetchQuerySkus()
    },
    handleSkuChange (sku) {
      this.selectedSku = sku
    },
    async fetchs (regionId) {
      const { fetchQueryData } = this.$refs['FILTERS']
      const { fetchQuerySpecs } = this.$refs['SIZE_FILTER']
      const { fetchQuerySkus } = this.$refs['LIST']
      // 获取sku筛选项接口
      await fetchQueryData(regionId)
      await fetchQuerySpecs()
      await fetchQuerySkus()
    },
  },
}
</script>
