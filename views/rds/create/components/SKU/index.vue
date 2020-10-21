<template>
  <div>
    <filters ref="FILTERS" :rds-item="rdsItem" />
    <size-filters ref="SIZE_FILTER" :rds-item="rdsItem">
      <div v-if="$slots.zone" slot="zone">
        <slot name="zone" />
      </div>
    </size-filters>
    <list ref="LIST" @change="handleSkuChange" />
    <disk-input :selectedSku="selectedSku" :min="rdsItem ? rdsItem.disk_size_gb : -1" />
  </div>
</template>
<script>
import Filters from './components/Filters'
import SizeFilters from './components/SizeFilters'
import List from './components/List'
import DiskInput from './components/DiskInput'
export default {
  name: 'rdsSku',
  components: {
    Filters,
    SizeFilters,
    List,
    DiskInput,
  },
  props: {
    disableds: {
      type: Array,
      default: () => {
        return []
      },
    },
    rdsItem: {
      type: Object,
    },
  },
  inject: ['form', 'formItemLayout'],
  provide () {
    return {
      disableds: this.disabledData,
    }
  },
  data () {
    const _F = () => {}
    return {
      selectedSku: {},
      fetchFilters: _F,
      fetchSpecs: _F,
      fetchSkus: _F,
    }
  },
  computed: {
    disabledData () {
      const _ = {}
      this.disableds.forEach(item => {
        _[item] = true
      })
      return _
    },
  },
  mounted () {
    const { fetchFilters, getVersion } = this.$refs.FILTERS
    const { fetchSpecs } = this.$refs.SIZE_FILTER
    const { fetchSkus } = this.$refs.LIST
    this.fetchCapability = fetchFilters
    this.fetchSpecs = fetchSpecs
    this.fetchSkus = fetchSkus
    this.linkageValue = getVersion
  },
  methods: {
    handleSkuChange (sku) {
      this.selectedSku = sku
    },
  },
}
</script>
