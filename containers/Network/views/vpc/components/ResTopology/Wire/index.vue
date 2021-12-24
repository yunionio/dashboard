<template>
  <div class="d-flex res-topology">
    <div class="c-left d-flex">
      <res-vpc :dataSource="vpc" :class="{'invisible': idx > 0 }" />
      <res-wire :dataSource="dataSource" />
    </div>
    <div class="c-right">
      <ul class="list">
        <li class="item d-flex" v-for="(network, idx) in networks" :key="idx">
          <res-ipsubnet :dataSource="network" />
          <res-common
            v-for="(obj, idx) in network.address"
            :key="idx"
            :type="RES_ICON_MAP[obj.owner_type]"
            :dataSource="obj" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ResVpc from '../ResVpc'
import ResWire from '../ResWire'
import ResIpsubnet from '../ResIpsubnet'
import ResCommon from '../ResCommon'
import { RES_ICON_MAP } from '../constants'

export default {
  name: 'WireTopology',
  components: {
    ResVpc,
    ResWire,
    ResIpsubnet,
    ResCommon,
  },
  props: {
    vpc: Object,
    dataSource: Object,
    idx: Number,
  },
  data () {
    return {
      RES_ICON_MAP,
    }
  },
  computed: {
    networks () {
      const networks = this.dataSource?.networks || []
      return networks.filter(v => v.server_type === 'guest')
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../index.scss";
</style>
