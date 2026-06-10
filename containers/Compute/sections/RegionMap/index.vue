<template>
  <div class="region-map region-map-wrapper">
    <e-chart-world-map
      height="300px"
      :data="regions"
      :fit-to-data="false"
      :split-key="splitKey"
      @select="onMapSelect" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import EChartWorldMap from '@/components/EChartWorldMap/index.vue'
import { getItemCoords } from '@/components/EChartWorldMap/geo'
import { cloudregionFilterByCapability } from '@/utils/common/capability'

export default {
  name: 'RegionMap',
  components: {
    EChartWorldMap,
  },
  props: {
    regionFilterParams: {
      type: Object,
      default: () => ({}),
    },
    splitKey: {
      type: String,
    },
    filterBrandResource: {
      type: String,
    },
    regionMapper: {
      type: Function,
    },
  },
  data () {
    return {
      regions: [],
    }
  },
  computed: {
    ...mapGetters(['capability']),
  },
  watch: {
    regionFilterParams: {
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        this.fetchRegions(true)
      },
      deep: true,
    },
    capability: {
      deep: true,
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        if (!this.filterBrandResource) return
        this.fetchRegions(true)
      },
    },
  },
  created () {
    this.cloudregionsM = new this.$Manager('cloudregions', 'v2')
    this.fetchRegions()
  },
  methods: {
    fetchRegions (isRefresh = false) {
      if (!this.cloudregionsM) {
        this.cloudregionsM = new this.$Manager('cloudregions', 'v2')
      }
      const params = {
        limit: 0,
        ...this.regionFilterParams,
        $t: 1,
      }
      return this.cloudregionsM.list({ params })
        .then(res => {
          let list = (res.data.data || []).filter(item => getItemCoords(item))
          if (this.filterBrandResource) {
            list = cloudregionFilterByCapability({
              dataList: list,
              capability: this.capability,
              resource: this.filterBrandResource,
            })
          }
          if (this.regionMapper) {
            list = this.regionMapper(list)
          }
          this.regions = list
          if (isRefresh) {
            this.$emit('params-change')
          }
        })
        .catch(err => {
          console.error('[RegionMap] fetch cloudregions failed', err)
          this.regions = []
          if (isRefresh) {
            this.$emit('params-change')
          }
        })
    },
    onMapSelect (payload) {
      this.$emit('select', payload)
    },
  },
}
</script>

<style lang="less" scoped>
.region-map-wrapper {
  position: relative;
  background: #000839;
  border-radius: 4px;
}
</style>
