<template>
  <div>
    <item-filters
      ref="FILTERS"
      :getParams="getParams"
      :disableds="disableds"
      :decorators="decorators" />
    <sku-list
      :filterSkuCallback="filterSkuCallback"
      ref="SKU_LIST" />
  </div>
</template>
<script>
import { isRequiredData } from '@DB/views/utils'
import { CAPABILIT_PARAMS, SPECS_PARAMS, SKU_PARAMS } from '@DB/views/redis/constants'
import ItemFilters from './components/ItemFilters'
import SkuList from './components/List'

export default {
  name: 'RedisCreateSku',
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
  methods: {
    getParams (keys) {
      const values = this.form.getFieldsValue(keys)
      const params = {
        usable: true,
        provider: this.form.fd.provider,
        cloudregion: this.form.fd.cloudregion,
        ...values,
        ...this.scopeParams,
      }
      if (!params.project_domian) {
        params.project_domian = this.$store.getters.userInfo.projectDomain
      }
      return params
    },
    async fetchCapability () {
      const { fetchCapability } = this.$refs.FILTERS
      const values = this.getParams(CAPABILIT_PARAMS)
      if (!values.city && !values.cloudregion) {
        return false
      }
      try {
        await fetchCapability(values)
      } catch (err) {
        throw err
      }
    },
    async fetchSpecs () {
      const { fetchSpecs } = this.$refs.FILTERS
      const values = this.getParams(SPECS_PARAMS)
      if (!isRequiredData(values, SPECS_PARAMS)) {
        return false
      }
      try {
        await fetchSpecs(values)
      } catch (err) {
        throw err
      }
    },
    async fetchSkus () {
      const { fetchSkus } = this.$refs.SKU_LIST
      const values = this.getParams(SKU_PARAMS)
      if (!isRequiredData(values, ['memory_size_mb', ...SPECS_PARAMS])) {
        return false
      }
      try {
        await fetchSkus(values)
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
