<template>
  <div>
    <a-form-item class="redis-sku-valid" :label="$t('compute.text_109')" v-bind="formItemLayout">
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
    <a-form-item class="redis-sku-valid" v-bind="tailFormItemLayout">
      <template v-show="false">
        <a-radio-group v-decorator="skuDecorator" :placeholder="$t('validator.serverName')" />
      </template>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { NODE_TYPE, BILL_TYPES_MAP } from '@DB/views/redis/constants'
import PageListEmpty from '@/components/PageList/Loader'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'

const ELASTIC_CACHE_STORAGE_TYPE = {
  inmemory: i18n.t('db.text_132'),
  hybrid: i18n.t('db.text_277'),
}
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
          rules: [{ required: true, message: this.$t('db.text_258') }],
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
      const column = [
        { type: 'radio', width: 40 },
        { field: 'name', title: this.$t('db.text_123') },
        {
          field: 'provider',
          title: this.$t('db.text_51'),
        },
        {
          field: 'node_type',
          title: this.$t('db.text_271'),
          slots: {
            default: ({ row }) => {
              return NODE_TYPE[row.node_type] || row.node_type
            },
          },
        },
        {
          field: 'memory_size_mb',
          title: this.$t('db.text_278'),
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
          title: this.$t('db.text_279'),
          slots: {
            default: ({ row }) => {
              const gb = row.disk_size_gb ? <span class='warning-color'>（{`${row.disk_size_gb}G`}）</span> : null
              return [
                <div class="d-flex">
                  {ELASTIC_CACHE_STORAGE_TYPE[row.storage_type]}
                  {gb}
                </div>,
              ]
            },
          },
        },
        {
          field: 'shard_num',
          title: this.$t('db.text_353'),
        },
        { field: 'max_connections', title: this.$t('db.text_127'), sortable: true },
        {
          field: 'rate',
          title: this.$t('db.text_128'),
          sortable: true,
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
                return [
                  <span style="color: rgb(230, 139, 80);">{ price.toFixed(2) }</span>,
                  <span> { this.$t('currencys.CNY') } / {unit}</span>,
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
      const row = (skuList && skuList.length > 0) ? skuList[0] : undefined
      this.handleSkuChange({ row })
    },
  },
  methods: {
    async handleSkuChange ({ row }) {
      this.FC.setFieldsValue({
        sku: row,
      })
      await this.$nextTick()
      this.$refs.tableRef.setRadioRow(row)
      this.FC.validateFields(['sku'])
    },
    skuSort (skuList) {
      return skuList ? skuList.sort((a, b) => a.memory_size_mb - b.memory_size_mb) : []
    },
    skuRepeat (skuList) {
      const skuObj = {}
      return skuList.filter(item => {
        // 20191112不支持华为3.0创建
        if (item.provider === 'Huawei' && item.engine_version === '3.0') {
          return false
        }
        const key = `${item.name}-${item.provider}-${item.memory_size_mb}`
        if (!skuObj[key]) {
          skuObj[key] = true
          return true
        }
      })
    },
    async fetchGetRates (skuList = this.skuList) {
      const managerRates = new this.$Manager('cloud_sku_rates', 'v1')
      const params = []
      skuList.forEach(sku => {
        // eslint-disable-next-line camelcase
        const { provider, region_ext_id, zone_ext_id, cache = 'cache', name } = sku
        // eslint-disable-next-line camelcase
        const _arr = [provider.toLowerCase(), region_ext_id, zone_ext_id, cache, name]
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
      const manager = new this.$Manager('elasticcacheskus', 'v2')
      try {
        this.loading = true
        const { data = [] } = await manager.list({ params })
        const list = data.data
        this.skuList = this.skuRepeat(this.skuSort(list))
        if (this.filterSkuCallback && R.type(this.filterSkuCallback) === 'Function') {
          this.skuList = this.skuList.filter(this.filterSkuCallback)
        }
        this.fetchGetRates()
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
::v-deep .redis-sku-valid .ant-form-item-control{
  line-height: 0;
}
</style>
