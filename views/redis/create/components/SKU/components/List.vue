<template>
  <div>
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
    <a-form-item class="redis-sku-valid">
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
          rules: [{ required: true, message: '请选择套餐' }],
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
        { field: 'name', title: '规格' },
        {
          field: 'provider',
          title: '平台',
        },
        {
          field: 'node_type',
          title: '节点类型',
          slots: {
            default: ({ row }) => {
              return NODE_TYPE[row.node_type] || row.node_type
            },
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
        {
          field: 'storage_type',
          title: '存储架构',
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
        { field: 'max_connections', title: '最大链接数', sortable: true },
        {
          field: 'rate',
          title: '价格',
          sortable: true,
          slots: {
            default: ({ row: { rate } }) => {
              if (this.rateLoading) {
                return [<a-icon type="loading" />]
              }
              const isPackage = this.form.getFieldValue('billing_type') === BILL_TYPES_MAP.prepaid.key
              if (rate) {
                let price = rate.hour_price
                let unit = '小时'
                if (isPackage) {
                  price = rate.month_price
                  unit = '月'
                }
                return [
                  <span style="color: rgb(230, 139, 80);">{ price.toFixed(2) }</span>,
                  <span> 元 / {unit}</span>,
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
      this.$refs['tableRef'].setRadioRow(row)
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
        const { provider, region_ext_id, zone_ext_id, cache = 'cache', name } = sku
        // eslint-disable-next-line camelcase
        let _arr = [ provider.toLowerCase(), region_ext_id, zone_ext_id, cache, name ]
        let key = _arr.join('::')
        sku['data_key'] = key
        params.push(key)
      })
      const param_keys = params.join('$')
      try {
        const rateData = {}
        this.rateLoading = true
        const { data = {} } = await managerRates.list({ params: {
          param_keys,
        } })
        const retList = data.data
        if (retList && retList.length > 0) {
          retList.forEach(item => {
            rateData[item.data_key] = item
          })
        }
        // this.rateData = rateData
        this.skuList = skuList.map(sku => {
          sku['rate'] = rateData[sku.data_key]
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
<style lang="scss" scoped>
::v-deep .redis-sku-valid .ant-form-item-control{
  line-height: 0;
}
</style>
