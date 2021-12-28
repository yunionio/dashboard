<template>
  <div style="margin-top: 80px;">
    <!-- <vpc-topology v-if="!classic" :dataSource="dataSource" /> -->
    <template v-if="classic && !physical">
      <wire-topology
        v-for="(wire, idx) in wires"
        :key="idx"
        :idx="idx"
        :vpc="vpc"
        :dataSource="wire" />
    </template>
    <template v-if="classic && physical">
      <vpc-topology :physical="physical" :classic="classic" :dataSource="dataSource" />
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
.res-topology {
  margin-left: 206px;
  .title {
    margin-bottom: 2px;
    border-bottom: 1px solid #ccc;
  }
  .ant-tooltip-inner {
    min-width: 200px;
    background-color: rgba(250,252,254, 1);
    color: #5D6F80;
    border: 1px solid #c8e2f7;
    border-radius: 4px;
  }
}
</style>
