<template>
  <div>
    <vxe-grid :loading="loading" max-height="500" :columns="tableColumn" :data="skuList" @radio-change="handleSkuChange" ref="tableRef">
      <template v-slot:empty>
        <page-list-empty :loading="skuLoading" />
      </template>
    </vxe-grid>
  </div>
</template>

<script>
import BrandIcon from '@/sections/BrandIcon'
// import * as R from 'ramda'
import PageListEmpty from '@/components/PageList/Loader'
import { sizestr } from '@/utils/utils'

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
    loading: {
      type: Boolean,
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
        { field: 'name', title: '规格' },
        {
          field: 'provider',
          title: '平台',
          default: ({ row }) => {
            return <BrandIcon name={ row['provider'] } />
          },
        },
        {
          field: 'memory_size_mb',
          title: '内存(GB)',
          sortable: true,
          slots: {
            default: ({ row }) => {
              return sizestr(row.memory_size_mb, 'M', 1024)
            },
          },
        },
        { field: 'cpu_arch', title: 'CPU' },
        { field: 'storage_type', title: '存储架构' },
        { field: 'max_connections', title: '最大链接数', sortable: true },
        { field: 'description', title: '备注' },
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
