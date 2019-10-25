<template>
  <div>
    <item-filters
       v-if="skuFilters && Object.keys(skuFilters).length > 0"
      :disableds="disableds"
      :decorators="decorators"
      :filterParams="skuFilters"
      @change="handleFilterChange" />
    <sku-list :loading="loading" :skuList="skuList" />
  </div>
</template>
<script>
import ItemFilters from './components/ItemFilters'
import SkuList from './components/List'
import { Manager } from '@/utils/manager'

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
      skuFilters: null,
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
      skuList.forEach(item => {
        const engine = item.engine
        const version = item.engine_version
        const category = item.local_category
        if (engine && !skuFilters[engine]) {
          skuFilters[engine] = {}
        }
        if (version && !skuFilters[engine][version]) {
          skuFilters[engine][version] = {}
        }
        if (category && !skuFilters[engine][version][category]) {
          skuFilters[engine][version][category] = {}
        }
      })
      this.skuFilters = skuFilters
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
      return skuList.sort((a, b) => a.memory_size_mb - b.memory_size_mb)
    },
    handleFilterChange () {
      const keys = ['engine', 'engine_version', 'local_category']
      const params = this.getFieldsValue(keys)
      clearTimeout(this.T)
      this.T = setTimeout(() => {
        keys.forEach(k => {
          if (params[k] === undefined) {
            delete params[k]
          }
        })
        this.filterSKU(params)
      }, 0)
      console.log(params)
    },
    async fetchQuerySkus (_parmas) {
      const params = {
        provider: this.getFieldValue('provider'),
        city: this.getFieldValue('city'),
        cloudregion: this.getFieldValue('region'),
        engine: 'redis',
      }
      try {
        this.loading = true
        const { data } = await new Manager('elasticcacheskus', 'v2').list({ params })
        const retList = (data && data.data && data.data.length > 0) ? data.data : []
        let _skuList = this.skuSort(retList)
        if (this.filterSkuCallback) {
          _skuList = _skuList.filter(this.filterSkuCallback)
        }
        this.skuList = _skuList
        this.SKU_LIST = _skuList
        this.formatFilters(_skuList)
        this.handleFilterChange()
        this.loading = false
      } catch (err) {
        this.loading = false
        throw err
      }
    },
  },
}
</script>
