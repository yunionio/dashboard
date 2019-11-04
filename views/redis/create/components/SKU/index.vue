<template>
  <div>
    <item-filters
       v-if="skuFilters && Object.keys(skuFilters).length > 0"
      :disableds="disableds"
      :decorators="decorators"
      :filterParams="skuFilters"
      :filterMemorys="skuMemorys"
      @change="handleFilterChange" />
    <sku-list :loading="loading" :skuList="skuList" />
  </div>
</template>
<script>
import ItemFilters from './components/ItemFilters'
import SkuList from './components/List'
import { Manager } from '@/utils/manager'
import { sizestr } from '@/utils/utils'

export default {
  name: 'rdisiCreateSkus',
  components: {
    ItemFilters,
    SkuList,
  },
  inject: ['form'],
  props: {
    decorators: {
      type: Object,
    },
    filterSkuCallback: {
      type: Function,
    },
    disableds: {
      type: Object,
    },
  },
  data () {
    return {
      loading: false,
      skuFilters: {},
      skuMemorys: {},
      skuList: [],
      SKU_LIST: [],
      T: undefined,
    }
  },
  computed: {
    FC () {
      if (this.form && this.form.fc) {
        return this.form.fc
      }
      return null
    },
    getFieldValue () {
      if (this.FC && this.FC.getFieldValue) {
        return this.FC.getFieldValue
      }
      return () => null
    },
    getFieldsValue () {
      if (this.FC && this.FC.getFieldsValue) {
        return this.FC.getFieldsValue
      }
      return () => null
    },
  },
  created () {
    this.fetchQuerySkus()
  },
  methods: {
    formatFilters (skuList) {
      const skuFilters = {}
      const skuMemorys = {}
      skuList.forEach(item => {
        const engine = item.engine
        const version = item.engine_version
        const category = item.local_category
        const memory = item.memory_size_mb
        const provider = item.provider
        // 华为3.0先隐藏掉
        if (provider === 'Huawei' && version === '3.0') {
          return false
        }
        if (engine && !skuFilters[engine]) {
          skuFilters[engine] = {}
        }
        if (version && !skuFilters[engine][version]) {
          skuFilters[engine][version] = {}
        }
        if (category && !skuFilters[engine][version][category]) {
          skuFilters[engine][version][category] = {}
        }
        if (memory) {
          const key = sizestr(item.memory_size_mb, 'M', 1024)
          skuMemorys[key] = memory
        }
      })
      this.skuFilters = {}
      this.skuMemorys = skuMemorys
      setTimeout(() => {
        this.skuFilters = skuFilters
      }, 10)
    },
    filterSKU (params = {}) {
      this.skuList = this.SKU_LIST.filter(sku => {
        let f = true
        for (let key in params) {
          if (sku[key] !== params[key]) {
            f = false
          }
        }
        return f
      })
    },
    skuSort (skuList) {
      return skuList ? skuList.sort((a, b) => a.memory_size_mb - b.memory_size_mb) : []
    },
    handleFilterChange () {
      this.$nextTick(() => {
        const keys = ['engine', 'engine_version', 'local_category', 'memory_size_mb', 'performance_type']
        const params = this.getFieldsValue(keys)
        keys.forEach(k => {
          if (params[k] === undefined) {
            delete params[k]
          }
        })
        this.filterSKU(params)
      })
    },
    async fetchQuerySkus (_parmas) {
      const params = {
        provider: this.getFieldValue('provider'),
        city: this.getFieldValue('city'),
        cloudregion: this.getFieldValue('region'),
        zone: this.getFieldValue('zone'),
        engine: 'redis',
        usable: true,
      }
      try {
        this.loading = true
        const { data } = await new Manager('elasticcacheskus', 'v2').list({ params })
        const retList = (data && data.data && data.data.length > 0) ? data.data : []
        this.FC.setFieldsValue({
          engine: undefined,
          engine_version: undefined,
          local_category: undefined,
          zone_id: undefined,
        })
        let _skuList = this.skuSort(retList)
        if (this.filterSkuCallback) {
          _skuList = _skuList.filter(this.filterSkuCallback)
        }
        this.skuList = _skuList
        this.SKU_LIST = _skuList
        this.formatFilters(_skuList)
        this.loading = false
      } catch (err) {
        this.loading = false
        throw err
      }
    },
  },
}
</script>
