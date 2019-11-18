<template>
  <div>
    <filters ref="FILTERS" @change="handleFilterChange" />
    <size-filters ref="SIZE_FILTER" @change="handleSpecsChange" />
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
    const _F = () => {}
    return {
      selectedSku: {},
      fetchFilters: _F,
      fetchSpecs: _F,
      fetchSkus: _F,
    }
  },
  mounted () {
    const { fetchFilters } = this.$refs['FILTERS']
    const { fetchSpecs } = this.$refs['SIZE_FILTER']
    const { fetchSkus } = this.$refs['LIST']
    this.fetchFilters = fetchFilters
    this.fetchSpecs = fetchSpecs
    this.fetchSkus = fetchSkus
  },
  methods: {
    handleSkuChange (sku) {
      this.selectedSku = sku
    },
    async handleSpecsChange () {
      await this.fetchSkus()
    },
    async handleFilterChange () {
      await this.fetchSpecs()
      await this.fetchSkus()
    },
    async fetchs (regionId) {
      await this.fetchFilters(regionId)
      await this.fetchSpecs()
      await this.fetchSkus()
    },
  },
}
</script>
