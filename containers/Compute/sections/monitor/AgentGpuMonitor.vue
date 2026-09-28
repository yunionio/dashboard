<template>
  <div>
    <a-spin v-if="loading" />
    <a-empty
      v-else-if="!hasDevices"
      :description="$t('compute.monitor.gpu.no_isolated_device')" />
    <a-empty
      v-else-if="!constants.length"
      :description="$t('compute.monitor.gpu.no_matched_vendor')" />
    <base-monitor
      v-else
      :data="data"
      :constants="constants"
      :resId="resId"
      :idKey="idKey" />
  </div>
</template>

<script>
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import { buildGpuMonitorOpts, getGpuVendorKeysFromDevices } from '@Compute/constants/gpuMonitor'

export default {
  name: 'AgentGpuMonitor',
  components: {
    BaseMonitor,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    resId: {
      type: String,
    },
    idKey: {
      type: String,
    },
  },
  data () {
    return {
      loading: false,
      hasDevices: false,
      constants: [],
    }
  },
  computed: {
    guestId () {
      return this.resId || this.data.id
    },
  },
  watch: {
    guestId: {
      handler (val) {
        if (val) {
          this.fetchIsolatedDevices()
        }
      },
      immediate: true,
    },
  },
  methods: {
    async fetchIsolatedDevices () {
      if (!this.guestId) return
      this.loading = true
      try {
        const { data: { data = [] } } = await new this.$Manager('guestisolateddevices').list({
          params: {
            guest_id: this.guestId,
            show_baremetal_isolated_devices: true,
            with_meta: true,
            details: true,
            limit: 0,
            scope: this.$store.getters.scope,
          },
        })
        this.hasDevices = data.length > 0
        const vendorKeys = getGpuVendorKeysFromDevices(data)
        this.constants = buildGpuMonitorOpts('baremetal', vendorKeys)
      } catch (e) {
        this.hasDevices = false
        this.constants = []
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
