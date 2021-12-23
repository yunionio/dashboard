<template>
  <div>
    <a-button>
      <a-icon v-if="loading" type="sync" spin />
      <a-icon v-else type="sync" />
    </a-button>
    <wire-topology />
    <vpc-topology />
    <vpc-topology :physical="true" />
  </div>
</template>

<script>
import WireTopology from '../components/ResTopology/Wire'
import VpcTopology from '../components/ResTopology/Vpc'

export default {
  name: 'Topology',
  components: {
    WireTopology,
    VpcTopology,
  },
  data () {
    return {
      loading: false,
    }
  },
}
</script>
