<template>
  <div>
    <component ref="vpcRef" v-if="currentZoneType" :is="renderComponent" :key="renderComponent" :params="params" />
  </div>
</template>

<script>
import AssociateVpc from './AssociateVpc'
import DnsZoneCache from './DnsZoneCache'

export default {
  name: 'DnsZoneCreateStep2',
  components: {
    AssociateVpc,
    DnsZoneCache,
  },
  props: {
    currentDnsZone: {
      type: Object,
    },
  },
  computed: {
    currentZoneType () {
      return this.currentDnsZone && this.currentDnsZone.zone_type
    },
    renderComponent () {
      if (this.currentZoneType === 'PrivateZone') {
        return 'AssociateVpc'
      }
      return 'DnsZoneCache'
    },
    params () {
      return {
        data: [this.currentDnsZone],
      }
    },
  },
}
</script>
