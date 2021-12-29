<template>
  <div style="margin-top: 80px;">
    <wire-topology :physical="physical" :dataSource="dataSource" />
  </div>
</template>

<script>
import WireTopology from './Wire'

export default {
  name: 'ResTopology',
  components: {
    WireTopology,
  },
  props: {
    physical: Boolean,
    dataSource: Object,
  },
  data () {
    return {}
  },
}
</script>

<style lang="scss">
// @import "@Network/sections/Topology/index.scss";
</style>
