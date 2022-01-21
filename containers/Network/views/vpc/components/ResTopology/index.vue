<template>
  <div style="margin-top: 80px;">
    <template v-if="classic && !physical">
      <wire-topology
        v-for="(wire, idx) in wires"
        :key="idx"
        :idx="idx"
        :len="wires && wires.length"
        :vpc="vpc"
        :dataSource="wire"
        :wires="wires" />
    </template>
    <template v-if="classic && physical">
      <vpc-topology
        :physical="physical"
        :classic="classic"
        :dataSource="dataSource" />
    </template>
    <template v-if="!classic">
      <vpc-topology :dataSource="dataSource" />
    </template>
  </div>
</template>

<script>
import VpcTopology from './Vpc'
import WireTopology from './Wire'

export default {
  name: 'ResTopology',
  components: {
    VpcTopology,
    WireTopology,
  },
  props: {
    classic: Boolean,
    physical: Boolean,
    dataSource: Object,
  },
  data () {
    return {}
  },
  computed: {
    vpc () {
      const { name, status } = this.dataSource
      return { name, status }
    },
    wires () {
      return this.dataSource?.wires || []
    },
  },
}
</script>

<style lang="scss">
@import "@Network/sections/Topology/index.scss";
</style>
