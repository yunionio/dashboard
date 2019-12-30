<template>
  <div>
    <vxe-grid :loading="loading" max-height="500" :columns="tableColumn" :data="skuList" @radio-change="handleSkuChange" ref="tableRef">
      <template v-slot:empty>
        <page-list-empty :loading="loading" />
      </template>
    </vxe-grid>
    <a-form-item>
      <template v-show="false">
        <a-radio-group v-decorator="skuDecorator" :placeholder="$t('validator.serverName')" />
      </template>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { NODE_TYPE } from '@DB/views/redis/constants'
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
  methods: {
    handleSkuChange ({ row }) {
      this.FC.setFieldsValue({
        sku: row,
      })
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
    // async fetchGetRates (skuList = this.skuList) {
    //   const managerRates = new this.$Manager('cloud_sku_rates', 'v1')
    //   const params = []
    //   skuList.forEach(sku => {
    //     // eslint-disable-next-line camelcase
    //     const { provider, cloudregion_id, zone_id, cache = 'cache', instance_spec } = sku
    //     // eslint-disable-next-line camelcase
    //     let _arr = [ provider, cloudregion_id, zone_id, cache, instance_spec ]
    //     params.push(_arr.join('::'))
    //   })
    //   // eslint-disable-next-line camelcase
    //   const param_keys = params.join('$')
    //   console.log(param_keys)
    //   const list = await managerRates.list({ params: {
    //     // param_keys,
    //     param_keys: 'Aliyun::cn-beijing-d::redis.master.small.default:v2.8',
    //   } })
    //   console.log(list, params.join('$'))
    // },
    async fetchSkus (paramKeys) {
      const { getFieldsValue } = this.form
      const params = await new Promise((resolve, reject) => {
        setTimeout(() => {
          const values = getFieldsValue(paramKeys)
          resolve(
            {
              ...values,
              usable: true,
            }
          )
        }, 10)
      })
      const manager = new this.$Manager('elasticcacheskus', 'v2')
      try {
        this.loading = true
        const { data = [] } = await manager.list({ params })
        const list = data.data
        this.skuList = this.skuRepeat(this.skuSort(list))
        if (this.filterSkuCallback && R.type(this.filterSkuCallback) === 'Function') {
          this.skuList = this.skuList.filter(this.filterSkuCallback)
        }
        // this.fetchGetRates()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
