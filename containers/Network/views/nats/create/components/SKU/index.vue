<template>
  <div>
    <sku-list
      :filterSkuCallback="filterSkuCallback"
      ref="SKU_LIST" />
  </div>
</template>

<script>
import { SKU_PARAMS } from '@Network/views/nats/constants'
import SkuList from './components/List'
export default {
  name: 'NatCreateSku',
  components: {
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
  methods: {
    getParams (keys) {
      const values = this.form.getFieldsValue(keys)
      const params = {
        ...values,
        scope: 'domain',
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
    async fetchSkus (extraParams) {
      const { fetchSkus } = this.$refs.SKU_LIST
      // 支持直接传入请求参数对象（多选区域），或字段名数组
      const values = (extraParams && !Array.isArray(extraParams) && typeof extraParams === 'object')
        ? { scope: 'domain', ...extraParams }
        : this.getParams(extraParams || SKU_PARAMS)
      try {
        await fetchSkus(values)
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
