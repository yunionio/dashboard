<template>
  <div>
    <vxe-grid :loading="loading" max-height="500" :columns="tableColumn" :data="skuList" @radio-change="handleSkuChange" ref="tableRef">
      <template v-slot:empty>
        <page-list-empty :loading="skuLoading" />
      </template>
    </vxe-grid>
    <a-form-item>
       <a-input v-show="false" v-decorator="skuDecorator" :placeholder="$t('validator.serverName')" />
    </a-form-item>
  </div>
</template>

<script>
import BrandIcon from '@/sections/BrandIcon'
// import * as R from 'ramda'
import PageListEmpty from '@/components/PageList/Loader'
import { sizestr } from '@/utils/utils'

const ELASTIC_CACHE_STORAGE_TYPE = {
  inmemory: '内存',
  hybrid: '混合存储',
}
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
      skuDecorator: [
        'sku',
        {
          rules: [{ required: true, message: '请选择套餐' }],
        },
      ],
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
          field: 'node_type',
          title: '节点类型',
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
        {
          field: 'storage_type',
          title: '存储架构',
          slots: {
            default: ({ row }) => {
              return ELASTIC_CACHE_STORAGE_TYPE[row.storage_type]
            },
          },
        },
        { field: 'max_connections', title: '最大链接数', sortable: true },
        { field: 'description', title: '备注' },
      ]
      return column
    },
  },
  watch: {
    skuList () {
      this.$refs['tableRef'].setRadioRow(this.skuList[0])
      this.handleSkuChange({ row: this.skuList[0] })
    },
  },
  created () {
    // this.FC.getFieldDecorator('sku', { preserve: true })
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
