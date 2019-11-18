<template>
  <div>
    <a-radio-group v-model="skuType" @change="skuTypeChange">
      <a-radio-button
        v-for="item of skuInfo.categoryOptions"
        :value="item.key"
        :key="item.key"
        :disabled="item.disabled">{{ item.label }}</a-radio-button>
    </a-radio-group>
    <vxe-grid
      ref="tableRef"
      resizable
      @radio-change="skuChange"
      :columns="tableColumn"
      :data="skuResults">
      <template v-slot:empty>
        <page-list-empty :loading="skuLoading" />
      </template>
    </vxe-grid>
  </div>
</template>

<script>
import * as R from 'ramda'
import { ALL_SKU_CATEGORY_OPT, SKU_CATEGORY_MAP } from '@Compute/constants'
import { Manager } from '@/utils/manager'
import { PROVIDER_MAP, HYPERVISORS_MAP } from '@/constants'
import PageListEmpty from '@/components/PageList/Loader'

const keys = ['hour_price', 'month_price', 'year_price']
const units = ['小时', '月', '年']

export default {
  name: 'SKU',
  components: {
    PageListEmpty,
  },
  props: {
    billType: {
      type: String,
    },
    hypervisor: {
      validator: val => {
        if (val) return R.is(String, val)
        return true
      },
    },
    value: { // v-decorator 的props
      required: true,
    },
    priceUnit: {
      type: Object,
      validator: val => {
        if (!R.isNil(val.key) || !R.isNil(val.unit)) {
          return keys.includes(val.key) && units.includes(val.unit)
        }
        return false
      },
      default: () => ({
        key: 'hour_price',
        unit: '小时',
      }),
    },
    skuParams: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      required: true,
      validator: val => ['idc', 'private', 'public'].includes(val),
    },
  },
  data () {
    return {
      skuList: [], // 套餐列表
      ratesList: [], // 套餐价格列表
      rateLoading: false,
      skuLoading: false,
      skuType: ALL_SKU_CATEGORY_OPT.key,
    }
  },
  computed: {
    isPublic () {
      return this.type === 'public'
    },
    isPrivate () {
      return this.type === 'private'
    },
    isIDC () {
      return this.type === 'idc'
    },
    tableColumn () {
      const column = [
        { type: 'radio', width: 40 },
        { field: 'instance_type_category_i18n', title: '类型' },
        {
          field: 'provider',
          title: '平台',
          slots: {
            default: ({ row }) => {
              return [
                this.getHypervisor(row),
              ]
            },
          },
        },
        { field: 'region', title: '区域' },
        { field: 'name', title: '规格' },
        { field: 'cpu_core_count', title: 'CPU(核)' },
        { field: 'memory_size_mb_compute', title: '内存(GB))' },
      ]
      if (this.isPublic) {
        column.push({
          field: 'hour_price',
          title: '价格',
          slots: {
            default: ({ row }) => {
              const price = this.getFormatPrice(row.hour_price)
              let ret = [<a-icon type="loading" />]
              if (!this.rateLoading) {
                ret = [
                  <span style="color: rgb(230, 139, 80);">{ price }</span>,
                  <span> 元 / { this.priceUnit.unit }</span>,
                ]
              }
              return ret
            },
          },
        })
      }
      return column
    },
    skuInfo () {
      let currentCategory = SKU_CATEGORY_MAP[this.hypervisor] || []
      if (this.isPublic) {
        currentCategory = SKU_CATEGORY_MAP['public_cloud']
      }
      const categoryOptions = {
        [ALL_SKU_CATEGORY_OPT.key]: {
          ...ALL_SKU_CATEGORY_OPT,
          disabled: false,
        },
      }
      currentCategory.forEach(item => {
        let type = this.hypervisor
        if (this.isPublic) {
          type = 'public_cloud'
        }
        categoryOptions[item] = {
          label: this.getI18NValue(`skuCategoryOptions.${type}.${item}`, item),
          key: item,
          disabled: true,
        }
      })
      const skuOptions = {
        [ALL_SKU_CATEGORY_OPT.key]: [],
      }
      // 套餐去重
      const skuSet = new Set()
      for (let i = 0, len = this.skuList.length; i < len; i++) {
        const item = this.skuList[i]
        let flag = `${item.name}-${item.provider}-${item.region_ext_id}`
        if (skuSet.has(flag)) {
          continue
        }
        skuSet.add(flag)
        let key = item.local_category
        let category = item.instance_type_category
        if (!skuOptions[key]) {
          skuOptions[key] = []
          if (categoryOptions[key]) {
            categoryOptions[key].disabled = false
          }
        }
        let hypervisor = this.hypervisor
        if (this.isPublic) {
          hypervisor = item.provider.toLowerCase()
        }
        // 翻译类型
        item.instance_type_category_i18n = this.getI18NValue(`skuCategoryOptions['${hypervisor}']['${category}']`, category)
        item.memory_size_mb_compute = item.memory_size_mb / 1024
        if (this.isPublic) {
          item.rate_key = this.genRateKey(item)
          if (this.ratesMap[item.rate_key]) {
            item.hour_price = this.ratesMap[item.rate_key][this.priceUnit['key']]
          }
        }
        skuOptions[key].push(item)
        skuOptions[ALL_SKU_CATEGORY_OPT.key].push(item)
      }
      return {
        categoryOptions,
        skuOptions,
      }
    },
    ratesMap () {
      const ret = {}
      for (let i = 0, len = this.ratesList.length; i < len; i++) {
        const item = this.ratesList[i]
        ret[item.data_key] = item
      }
      return ret
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
    skuParams: {
      handler (val, oldV) {
        if (!R.equals(val, oldV)) {
          this.fetchData()
        }
      },
      deep: true,
    },
  },
  created () {
    this.skusM = new Manager('serverskus')
    this.ratesM = new Manager('cloud_sku_rates', 'v1')
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.fetchSkuList().then(this.fetchCloudSkuRatesList)
    },
    getFormatPrice (price) {
      if (price) {
        return price.toFixed(2)
      }
      return '0'
    },
    skuChange ({ row }) {
      this.setSku(row)
    },
    skuTypeChange () {
      if (this.skuResults && this.skuResults.length) {
        this.setSku(this.skuResults[0])
      }
    },
    setSku (skuData) {
      this.$nextTick(() => {
        this.$refs.tableRef.setRadioRow(skuData)
        this.$emit('change', skuData)
      })
    },
    getHypervisor (data) {
      return PROVIDER_MAP[data.provider]['label']
    },
    genRateKey (data) {
      const provider = data.provider.toLowerCase()
      let ret = `${provider}::${data.region_ext_id}::${data.name}`
      if (provider === HYPERVISORS_MAP.ucloud.key || provider === HYPERVISORS_MAP.azure.key) {
        ret = `${provider}::${data.region_ext_id}::::instance::${data.name}`
      }
      return ret
    },
    getI18NValue (key, originVal) {
      if (this.$te(key)) {
        return this.$t(key)
      }
      return originVal
    },
    fetchSkuList () {
      this.skuLoading = true
      return this.skusM.list({ params: this.skuParams })
        .then(({ data: { data = [] } }) => {
          this.skuList = data
          this.skuLoading = false
          if (this.skuList && this.skuList.length) {
            this.setSku(this.skuResults[0])
          }
          return data
        })
        .catch(() => {
          this.skuLoading = false
        })
    },
    fetchCloudSkuRatesList () { // 公有云套餐价格
      if (!this.isPublic) return
      const paramKeys = this.skuList.map(this.genRateKey)
      const params = {
        param_keys: paramKeys.join('$'),
      }
      this.rateLoading = true
      this.ratesM.list({ params })
        .then(({ data: { data = [] } }) => {
          this.ratesList = data
          this.rateLoading = false
        })
        .catch(() => {
          this.rateLoading = false
        })
    },
  },
}
</script>
