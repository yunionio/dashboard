<template>
  <div>
    <item-filters
      :getParams="getParams"
      :disableds="disableds"
      :decorators="decorators" />
    <sku-list
      @update:options="skuChanged"
      :filterSkuCallback="filterSkuCallback"
      ref="SKU_LIST" />
  </div>
</template>

<script>
import SkuList from './components/List'

export default {
  name: 'FileSystemSku',
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
    skuChanged (options) {
      this.$emit('update:options', options)
    },
    getParams (keys) {
      const values = this.form.fc.getFieldsValue(keys)
      const params = {
        ...values,
        scope: 'domain',
      }
      if (this.form.fc.getFieldValue('billing_type') === 'postpaid') {
        params.postpaid_status = 'available'
      } else {
        params.prepaid_status = 'available'
      }
      return params
    },
    async fetchSkus (extraParams) {
      const { fetchSkus } = this.$refs.SKU_LIST
      const values = this.getParams(extraParams || ['cloudregion_id'])
      try {
        await fetchSkus(values)
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
