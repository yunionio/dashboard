<template>
  <div>
    <item-filters v-if="skuFilters" :filterParams="skuFilters" @change="handleFilterChange" />
    <sku-list :skuList="skuList" />
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
  data () {
    return {
      loading: true,
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
    async fetchQuerySkus (_parmas) {
      const params = {
        provider: this.getFieldValue('provider'),
        city: 'shanghai',
        cloudregion: this.getFieldValue('region'),
      }
      try {
        this.loading = true
        const { data } = await new Manager('elasticcacheskus', 'v2').list({ params })
        this.skuList = data.data
        this.SKU_LIST = data.data
        this.formatFilters(this.skuList)
        this.loading = false
      } catch (err) {
        this.loading = false
        throw err
      }
    },
    formatFilters (skuList) {
      const skuFilters = {}
      skuList.forEach(item => {
        const engine = item.engine
        const version = item.engine_version
        const arch = item.engine_arch
        if (engine && !skuFilters[engine]) {
          skuFilters[engine] = {}
        }
        if (version && !skuFilters[engine][version]) {
          skuFilters[engine][version] = {}
        }
        if (arch && !skuFilters[engine][version][arch]) {
          skuFilters[engine][version][arch] = {}
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
    handleFilterChange () {
      const keys = ['engine', 'engine_version', 'engine_arch']
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
    },
  },
}
</script>
