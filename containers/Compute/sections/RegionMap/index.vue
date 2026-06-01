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
import EChartWorldMap from '@/components/EChartWorldMap/index.vue'
import { getItemCoords } from '@/components/EChartWorldMap/geo'

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
  },
  data () {
    return {
      regions: [],
    }
  },
  watch: {
    regionFilterParams: {
      handler (val, oldVal) {
        if (R.equals(val, oldVal)) return
        this.fetchRegions(true)
      },
      deep: true,
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
          this.regions = (res.data.data || []).filter(item => getItemCoords(item))
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
