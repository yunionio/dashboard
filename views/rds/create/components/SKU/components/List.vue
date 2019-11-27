<template>
  <div style="margin-bottom: 20px">
    <vxe-grid
      :columns="tableColumn"
      :data="skuList"
      :loading="loading"
      @radio-change="handleSkuChange"
      max-height="500"
      ref="tableRef">
      <template v-slot:empty>
        <page-list-empty :loading="loading" />
      </template>
    </vxe-grid>
    <p v-if="selectedSku" style="margin-top:10px">
        已选择: {{formatSku}}
      </p>
  </div>
</template>
<script>
import { sizestr } from '@/utils/utils'
import PageListEmpty from '@/components/PageList/Loader'

export default {
  name: 'rdsSkuList',
  inject: ['form'],
  components: {
    PageListEmpty,
  },
  data () {
    return {
      loading: false,
      selectedSku: undefined,
      skuList: [],
    }
  },
  computed: {
    formatSku () {
      if (this.selectedSku) {
        // eslint-disable-next-line camelcase
        const { name, vmem_size_mb, iops, vcpu_count } = this.selectedSku
        // eslint-disable-next-line camelcase
        return `${name} （${vcpu_count}核, ${sizestr(vmem_size_mb, 'M', 1024)}, IOPS:${iops}）`
      }
      return ''
    },
    tableColumn () {
      const column = [
        { type: 'radio', width: 40 },
        { field: 'name', title: '规格' },
        {
          field: 'vcpu_count',
          title: 'CPU(核)',
          sortable: true,
          slots: {
            default: ({ row }) => {
              return `${row.vcpu_count}核`
            },
          },
        },
        {
          field: 'vmem_size_mb',
          title: '内存（GB）',
          sortable: true,
          slots: {
            default: ({ row }) => {
              return sizestr(row.vmem_size_mb, 'M', 1024)
            },
          },
        },
        {
          field: 'max_connections',
          title: '最大链接数',
          sortable: true,
        },
        {
          field: 'iops',
          title: 'IOPS',
          sortable: true,
        },
        {
          title: '规格参考价格',
          sortable: true,
          slots: {
            default: () => '-',
          },
        },
      ]
      return column
    },
  },
  watch: {
    skuList (netSkuList) {
      if (netSkuList && netSkuList.length > 0) {
        this.$refs['tableRef'].setRadioRow(this.skuList[0])
        this.handleSkuChange({ row: this.skuList[0] })
      }
    },
  },
  created () {
    this.form.getFieldDecorator('sku', { preserve: true })
  },
  methods: {
    handleSkuChange ({ row }) {
      this.form.setFieldsValue({
        sku: row,
      })
      this.selectedSku = row
      /* 组件sku change */
      this.$emit('change', row)
    },
    getSkuParams () {
      const { getFieldsValue } = this.form
      const paramsKeys = ['engine', 'engine_version', 'category', 'storage_type', 'vcpu_count', 'vmem_size_mb', 'cloudregion', 'zones']
      return new Promise((resolve, reject) => {
        this.$nextTick(() => {
          const PARAMS = getFieldsValue(paramsKeys)
          PARAMS['cloudregion_id'] = PARAMS.cloudregion
          if (PARAMS.zones) {
            const zoneArr = PARAMS.zones.split('+')
            if (zoneArr && zoneArr.length > 0) {
              for (let i = 0; i < zoneArr.length; i++) {
                PARAMS[`zone${i + 1}`] = zoneArr[i]
              }
            }
            delete PARAMS.zones
          }
          resolve(PARAMS)
        })
      })
    },
    async fetchSkus () {
      this.manager = new this.$Manager('dbinstance_skus', 'v2')
      const PARAMS = await this.getSkuParams()
      this.loading = true
      this.selectedSku = undefined
      try {
        const { data } = await this.manager.list({ params: PARAMS })
        this.skuList = (data && data.data.length > 0) ? data.data : []
        this.loading = false
        return await data
      } catch (err) {
        this.loading = false
      }
    },
  },
}
</script>
