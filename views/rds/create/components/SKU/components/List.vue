<template>
  <div style="margin-bottom: 20px;" v-if="skuList">
    <a-form-item :label="$t('compute.text_109')" v-bind="formItemLayout">
      <vxe-grid
        row-id="id"
        :radio-config="radioConfig"
        :columns="tableColumn"
        :data="skuList"
        :loading="loading"
        @cell-click="handleSkuChange"
        @radio-change="handleSkuChange"
        ref="tableRef">
        <div slot="empty" style="height: 100px">
          <page-list-empty :loading="loading" />
        </div>
      </vxe-grid>
    </a-form-item>
    <a-form-item class="mt-1" :validate-status="formatSku ? 'success' : 'error'" v-bind="tailFormItemLayout">
      <p slot="help">
        {{
          formatSku
          ? $t('db.text_121', [formatSku])
          : $t('db.text_339')
        }}
      </p>
    </a-form-item>
  </div>
</template>
<script>
import { BILL_TYPES_MAP } from '@DB/views/redis/constants'
import { sizestr } from '@/utils/utils'
import PageListEmpty from '@/components/PageList/Loader'
import { numerify } from '@/filters'

export default {
  name: 'rdsSkuList',
  inject: ['form', 'formItemLayout', 'tailFormItemLayout', 'scopeParams'],
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
        const { name, vmem_size_mb, iops, vcpu_count } = this.selectedSku
        return this.$t('db.text_122', [name, vcpu_count, sizestr(vmem_size_mb, 'M', 1000), iops])
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
          title: this.$t('db.text_123'),
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
          title: this.$t('db.text_124'),
          sortable: true,
          minWidth: 200,
          slots: {
            default: ({ row }) => {
              return this.$t('db.text_125', [row.vcpu_count])
            },
          },
        },
        {
          field: 'vmem_size_mb',
          title: this.$t('db.text_126'),
          sortable: true,
          minWidth: 200,
          slots: {
            default: ({ row }) => {
              return sizestr(row.vmem_size_mb, 'M', 1000)
            },
          },
        },
        {
          field: 'max_connections',
          title: this.$t('db.text_127'),
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
          field: 'rate',
          title: this.$t('db.text_128'),
          sortable: true,
          minWidth: 140,
          slots: {
            default: ({ row: { rate } }) => {
              if (this.rateLoading) {
                return [<a-icon type="loading" />]
              }
              const isPackage = this.form.getFieldValue('billing_type') === BILL_TYPES_MAP.prepaid.key
              if (rate) {
                let price = rate.hour_price
                let unit = this.$t('db.text_129')
                if (isPackage) {
                  price = rate.month_price
                  unit = this.$t('db.text_130')
                }
                const currencys = {
                  USD: '$',
                  CNY: '¥',
                }
                return [
                  <span style="color: rgb(230, 139, 80);">{currencys[rate.currency]} { numerify(price, '0,0.00') }</span>,
                  <span>  / {unit}</span>,
                ]
              }
              return '-'
            },
          },
        },
      ]
      return column
    },
  },
  watch: {
    skuList (skuList) {
      if (skuList && skuList.length > 0) {
        const row = skuList.find(item => this.isAvailable(item))
        this.handleSkuChange({ row })
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
    async handleSkuChange ({ row }) {
      const _row = (row && this.isAvailable(row)) ? row : undefined
      this.form.setFieldsValue({
        sku: _row,
      })
      this.selectedSku = _row
      await this.$nextTick()
      this.$refs.tableRef.setRadioRow(_row)
      this.$emit('change', _row)
    },
    async fetchGetRates (skuList = this.skuList) {
      const managerRates = new this.$Manager('cloud_sku_rates', 'v1')
      const params = []
      skuList.forEach(sku => {
        const { provider, region_ext_id, zone_id, cache = 'rds', name, category, engine } = sku
        const pvt = provider.toLowerCase()
        if (pvt === 'google') {
          const key = `${pvt}::${region_ext_id}::::${cache}::${category}_${engine}_${name}`
          sku.data_key = key
          params.push(key)
        } else {
          const _arr = [provider.toLowerCase(), region_ext_id, zone_id, cache, name]
          const key = _arr.join('::')
          sku.data_key = key
          params.push(key)
        }
      })
      const param_keys = params.join('$')
      try {
        const rateData = {}
        this.rateLoading = true
        const { data = {} } = await managerRates.list({
          params: {
            param_keys,
          },
        })
        const retList = data.data
        if (retList && retList.length > 0) {
          retList.forEach(item => {
            rateData[item.data_key] = item
          })
        }
        // this.rateData = rateData
        this.skuList = skuList.map(sku => {
          sku.rate = rateData[sku.data_key]
          return sku
        })
      } catch (err) {
        throw err
      } finally {
        this.rateLoading = false
      }
    },
    getSkuParams () {
      const { getFieldsValue } = this.form
      const paramsKeys = ['engine', 'engine_version', 'category', 'storage_type', 'vcpu_count', 'vmem_size_mb', 'cloudregion', 'zones']
      const PARAMS = getFieldsValue(paramsKeys)
      PARAMS.cloudregion_id = PARAMS.cloudregion
      if (PARAMS.zones) {
        const zoneArr = PARAMS.zones.split('+')
        if (zoneArr && zoneArr.length > 0) {
          for (let i = 0; i < zoneArr.length; i++) {
            PARAMS[`zone${i + 1}`] = zoneArr[i]
          }
        }
      }
      for (let i = 0; i < paramsKeys.length; i++) {
        const k = paramsKeys[i]
        if (!PARAMS[k]) {
          return null
        }
      }
      delete PARAMS.zones
      return { ...PARAMS, ...this.scopeParams }
    },
    async fetchSkus () {
      const PARAMS = await this.getSkuParams()
      if (!PARAMS) return false
      this.loading = true
      this.selectedSku = undefined
      const manager = new this.$Manager('dbinstance_skus', 'v2')
      try {
        const { data } = await manager.list({ params: PARAMS })
        this.skuList = (data && data.data.length > 0) ? data.data : []
        this.fetchGetRates()
        return await data
      } catch (err) {
        this.skuList = []
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
