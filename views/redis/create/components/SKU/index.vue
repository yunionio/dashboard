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
  inject: ['form', 'scopeParams'],
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
    async getParams (keys) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const values = this.form.getFieldsValue(keys)
          const params = {
            ...values,
            usable: true,
            ...this.scopeParams,
          }
          resolve(params)
        }, 10)
      })
    },
    async skuFetchs (changedFields) {
      const capabilityParamsKeys = ['billing_type', 'city', 'provider', 'cloudregion', 'zone']
      const instanceSpecsParamsKeys = ['billing_type', 'engine', 'engine_version', 'performance_type', 'local_category', 'node_type', 'performance_type']
      const skuParamsKey = ['memory_size_mb'].concat(capabilityParamsKeys).concat(instanceSpecsParamsKeys)
      const field = Object.keys(changedFields || {})[0]
      const isUndefined = changedFields === undefined
      try {
        if (capabilityParamsKeys.indexOf(field) > -1 || isUndefined) {
          const params = await this.getParams(capabilityParamsKeys)
          await this.fetchCapability(params)
        }
        if (instanceSpecsParamsKeys.indexOf(field) > -1 || isUndefined) {
          const params = await this.getParams(instanceSpecsParamsKeys)
          await this.fetchSpecs(params)
        }
        if (skuParamsKey.indexOf(field) > -1 || isUndefined) {
          const params = await this.getParams(skuParamsKey)
          await this.fetchSkus(params)
        }
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
