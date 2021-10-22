<template>
  <div>
    <a-form-item class="nat-sku-valid" :label="$t('compute.text_109')" v-bind="formItemLayout">
      <vxe-grid
        ref="tableRef"
        row-id="id"
        max-height="500"
        :radio-config="radioConfig"
        :loading="loading"
        :columns="tableColumn"
        :data="skuList"
        @radio-change="handleSkuChange"
        @cell-click="handleSkuChange">
        <template v-slot:empty>
          <page-list-empty :loading="loading" />
        </template>
      </vxe-grid>
    </a-form-item>
    <a-form-item class="nat-sku-valid" v-bind="tailFormItemLayout">
      <template v-show="false">
        <a-radio-group v-decorator="skuDecorator" :placeholder="$t('validator.serverName')" />
      </template>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import PageListEmpty from '@/components/PageList/Loader'
import { BILL_TYPES_MAP } from '@Network/views/nats/constants'
import { hasMeterService } from '@/utils/auth'

export default {
  name: 'SKUList',
  inject: ['form', 'formItemLayout', 'tailFormItemLayout'],
  components: {
    PageListEmpty,
  },
  props: {
    filterSkuCallback: {
      type: Function,
    },
  },
  data () {
    return {
      loading: false,
      rateLoading: false,
      skuList: [],
      skuDecorator: [
        'sku',
        {
          rules: [{ required: true, message: this.$t('network.nat.sku.choose') }],
        },
      ],
    }
  },
  computed: {
    radioConfig () {
      return {
        reserve: true,
      }
    },
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return {}
    },
    tableColumn () {
      const columns = [
        { type: 'radio', width: 40 },
        {
          field: 'name',
          title: this.$t('network.nat.sku.spec'),
          slots: {
            default: ({ row }, h) => {
              const ret = []
              ret.push(<div>{ row.name }</div>)
              if ((row.description) && row.description.length > 0) {
                ret.push(<div>{ row.description }</div>)
              }
              return ret
            },
          },
        },
        { field: 'provider', title: this.$t('network.text_198') },
        {
          field: 'cps',
          title: this.$t('network.nat.sku.cps'),
          slots: {
            default: ({ row }, h) => {
              if (row.cps && row.cps > 0) {
                return row.cps
              }
              return '-'
            },
          },
        },
        {
          field: 'conns',
          title: this.$t('network.nat.sku.conns'),
          slots: {
            default: ({ row }, h) => {
              if (row.conns && row.conns > 0) {
                return row.conns
              }
              return '-'
            },
          },
        },
        {
          field: 'throughput',
          title: this.$t('network.nat.sku.throughput'),
          slots: {
            default: ({ row }, h) => {
              if (row.throughput && row.throughput > 0) {
                return row.throughput + 'Gbps'
              }
              return '-'
            },
          },
        },
      ]
      const priceColumn = {
        field: 'rate',
        title: this.$t('network.nat.sku.price'),
        sortable: true,
        slots: {
          default: ({ row: { provider, rate } }) => {
            if (this.rateLoading) {
              return [<a-icon type="loading" />]
            }
            const isPackage = this.form.getFieldValue('billing_type') === BILL_TYPES_MAP.prepaid.key
            if (rate) {
              let price = rate.hour_price
              let unit = this.$t('network.unit.hour')
              if (provider === 'Huawei') {
                price = rate.hour_price * 24
                unit = this.$t('network.unit.day')
              }
              if (isPackage) {
                price = rate.month_price
                unit = this.$t('network.unit.month')
              }
              return [
                <span style="color: rgb(230, 139, 80);">{ price.toFixed(2) }</span>,
                <span> { this.$t('currencys.CNY') } / {unit}</span>,
              ]
            }
            return '-'
          },
        },
      }
      if (hasMeterService()) {
        columns.push(priceColumn)
      }
      return columns
    },
  },
  watch: {
    skuList (skuList) {
      const row = (skuList && skuList.length > 0) ? skuList[0] : undefined
      this.handleSkuChange({ row })
    },
  },
  methods: {
    getZone () {
      const sku = this.FC.getFieldValue('sku')
      if (sku) {
        return sku.zone_ids
      }
    },
    getCloudregionId () {
      const sku = this.FC.getFieldValue('sku')
      if (sku) {
        return sku.cloudregion_id
      }
    },
    async handleSkuChange ({ row }) {
      this.FC.setFieldsValue({
        sku: row,
      })
      await this.$nextTick()
      this.$refs.tableRef.setRadioRow(row)
      this.FC.validateFields(['sku'])
    },
    skuSort (skuList) {
      return skuList ? skuList.sort((a, b) => a.cnns - b.cnns) : []
    },
    async fetchRates (skuList = this.skuList) {
      if (!hasMeterService()) return
      const managerRates = new this.$Manager('cloud_sku_rates', 'v1')
      const params = []
      skuList.forEach(sku => {
        // eslint-disable-next-line camelcase
        let { provider, region_ext_id, zone_ext_id = '', nat = 'nat', name } = sku
        if (sku.cloud_env) provider = sku.cloud_env.toLowerCase()
        // eslint-disable-next-line camelcase
        const _arr = [provider.toLowerCase(), region_ext_id, zone_ext_id, nat, name.toLowerCase()]
        const key = _arr.join('::')
        sku.data_key = key
        params.push(key)
      })
      // eslint-disable-next-line camelcase
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
    async fetchSkus (params) {
      const manager = new this.$Manager('nat_skus', 'v2')
      if (!params.cloudregion || params.cloudregion.length === 0) {
        this.skuList = []
        return
      }
      try {
        this.loading = true
        const { data = [] } = await manager.list({ params })
        const list = data.data
        this.skuList = this.skuSort(list)
        if (this.filterSkuCallback && R.type(this.filterSkuCallback) === 'Function') {
          this.skuList = this.skuList.filter(this.filterSkuCallback)
        }
        this.fetchRates()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style lang="less" scoped>
::v-deep .rds-sku-valid .ant-form-item-control{
  line-height: 0;
}
</style>
