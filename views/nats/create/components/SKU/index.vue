<template>
  <div>
    <item-filters
      :getParams="getParams"
      :disableds="disableds"
      :decorators="decorators" />
    <sku-list
      :filterSkuCallback="filterSkuCallback"
      ref="SKU_LIST" />
  </div>
</template>

<script>
import SkuList from './components/List'
import { SKU_PARAMS } from '@Network/views/nats/constants'

export default {
  name: 'NatCreateSku',
  components: {
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
        ...values,
        ...this.scopeParams,
      }
      if (this.form.getFieldValue('billing_type') === 'postpaid') {
        params.postpaid_status = 'available'
      } else {
        params.prepaid_status = 'available'
      }
      return params
    },
    getZone () {
      return this.$refs.SKU_LIST.getZone()
    },
    getCloudregionId () {
      return this.$refs.SKU_LIST.getCloudregionId()
    },
    async fetchSkus () {
      const { fetchSkus } = this.$refs.SKU_LIST
      const values = this.getParams(SKU_PARAMS)
      try {
        await fetchSkus(values)
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
