<template>
  <div>
    <item-filters
      ref="FILTERS"
      :disableds="disableds"
      :decorators="decorators" />
    <sku-list
      :filterSkuCallback="filterSkuCallback"
      ref="SKU_LIST" />
  </div>
</template>
<script>
import ItemFilters from './components/ItemFilters'
import SkuList from './components/List'

export default {
  name: 'rdisiCreateSkus',
  components: {
    ItemFilters,
    SkuList,
  },
  inject: ['form'],
  props: {
    decorators: {
      type: Object,
    },
    filterSkuCallback: {
      type: Function,
    },
    disableds: {
      type: Object,
    },
  },
  data () {
    return {
      T: undefined,
    }
  },
  mounted () {
    const { fetchCapability, fetchSpecs } = this.$refs['FILTERS']
    const { fetchSkus } = this.$refs['SKU_LIST']
    this.fetchCapability = fetchCapability
    this.fetchSpecs = fetchSpecs
    this.fetchSkus = fetchSkus
  },
  methods: {
    async skuFetchs (changedFields) {
      const capabilityParamsKeys = ['billing_type', 'city', 'provider', 'cloudregion', 'zone']
      const instanceSpecsParamsKeys = ['billing_type', 'engine', 'engine_version', 'performance_type', 'local_category', 'node_type', 'performance_type']
      const field = Object.keys(changedFields || {})[0]
      const isUndefined = changedFields === undefined
      const skuParamsKey = ['memory_size_mb'].concat(capabilityParamsKeys).concat(instanceSpecsParamsKeys)
      try {
        if (capabilityParamsKeys.indexOf(field) > -1 || isUndefined) {
          await this.fetchCapability(capabilityParamsKeys)
        }
        if (instanceSpecsParamsKeys.indexOf(field) > -1 || isUndefined) {
          await this.fetchSpecs(capabilityParamsKeys.concat(instanceSpecsParamsKeys))
        }
        if (skuParamsKey.indexOf(field) > -1 || isUndefined) {
          await this.fetchSkus(skuParamsKey)
        }
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
