<template>
  <div style="margin-bottom: 20px" v-if="skuList">
    <vxe-grid
      :radio-config="radioConfig"
      :columns="tableColumn"
      :data="skuList"
      :loading="loading"
      @radio-change="handleSkuChange"
      max-height="500"
      ref="tableRef">
      <div slot="empty" style="min-height: 200px">
        <page-list-empty :loading="loading" />
      </div>
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
  inject: ['form', 'scopeParams'],
  components: {
    PageListEmpty,
  },
  data () {
    return {
      loading: false,
      selectedSku: undefined,
      skuList: undefined,
    }
  },
  computed: {
    radioConfig () {
      return {
        reserve: true,
        checkMethod: ({ row }) => this.isAvailable(row),
      }
    },
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
        {
          type: 'radio',
          width: 40,
        },
        {
          field: 'name',
          title: '规格',
          minWidth: 200,
          slots: {
            default: ({ row }) => {
              if (!this.isAvailable(row)) {
                return [<span class={'disabled-color'}>{row.name} (已售罄)</span>]
              }
              return row.name
            },
          },
        },
        {
          field: 'vcpu_count',
          title: 'CPU(核)',
          sortable: true,
          minWidth: 200,
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
          minWidth: 200,
          slots: {
            default: ({ row }) => {
              return sizestr(row.vmem_size_mb, 'M', 1024)
            },
          },
        },
        {
          field: 'max_connections',
          title: '最大链接数',
          minWidth: 140,
          sortable: true,
        },
        {
          field: 'iops',
          title: 'IOPS',
          minWidth: 100,
          sortable: true,
        },
        {
          title: '规格参考价格',
          sortable: true,
          minWidth: 150,
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
    isAvailable (row) {
      return row.status === 'available'
    },
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
          resolve({ ...PARAMS, ...this.scopeParams })
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
        return await data
      } catch (err) {
        this.skuList = []
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
