<template>
  <div>
    <vxe-grid :columns="tableColumn" :data="skuList" @radio-change="handleSkuChange" ref="tableRef">
      <template v-slot:empty>
        <page-list-empty :loading="skuLoading" />
      </template>
    </vxe-grid>
  </div>
</template>

<script>
// import * as R from 'ramda'
import PageListEmpty from '@/components/PageList/Loader'

export default {
  name: 'SKUList',
  inject: ['form'],
  components: {
    PageListEmpty,
  },
  props: {
    skuList: {
      type: Array,
    },
  },
  data () {
    return {
      skuLoading: false,
    }
  },
  computed: {
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return {}
    },
    tableColumn () {
      const column = [
        { type: 'radio', width: 40 },
        { field: 'instance_spec', title: '规格' },
        { field: 'memory_size_mb', title: '内存(GB)' },
        { field: 'cpu', title: 'CPU' },
        { field: 'storage_type', title: '存储架构' },
        { field: 'ada', title: '最大链接数' },
        { field: 'cpu_core_count', title: '备注' },
      ]
      return column
    },
    skuResults () {
      let ret = this.skuInfo.skuOptions[this.skuType]
      if (ret && ret.length > 0 && ret[0]['hour_price']) {
        ret.sort((a, b) => a.hour_price - b.hour_price)
      }
      return ret
    },
  },
  watch: {
    skuList () {
      this.$refs['tableRef'].setRadioRow(this.skuList[0])
      this.handleSkuChange({ row: this.skuList[0] })
    },
  },
  created () {
    this.FC.getFieldDecorator('sku', { initialValue: [], preserve: true })
  },
  methods: {
    handleSkuChange ({ row }) {
      this.FC.setFieldsValue({
        sku: row,
      })
    },
  },
}
</script>
