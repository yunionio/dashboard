<template>
  <div class="region-map">
    <mapbox-world-map
      height="300px"
      :data="regions"
      :fit-to-data="false"
      :split-key="splitKey"
      @select="onMapSelect" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MapboxWorldMap from '@/components/MapboxWorldMap/index.vue'
import { getItemCoords } from '@/components/MapboxWorldMap/geo'

export default {
  name: 'RegionMap',
  components: {
    MapboxWorldMap,
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
  computed: {
    ...mapGetters(['scope']),
  },
  created () {
    this.cloudregionsM = new this.$Manager('cloudregions', 'v2')
  },
  mounted () {
    this.fetchRegions()
  },
  methods: {
    fetchRegions () {
      const params = {
        limit: 0,
        ...this.regionFilterParams,
      }
      return this.cloudregionsM.list({ params })
        .then(res => {
          this.regions = (res.data.data || []).filter(item => getItemCoords(item))
        })
        .catch(err => {
          console.error('[RegionMap] fetch cloudregions failed', err)
          this.regions = []
        })
    },
    onMapSelect (payload) {
      this.$emit('select', payload)
    },
  },
}
</script>

<style lang="less" scoped>
.region-map {
  width: 100%;
}
</style>
