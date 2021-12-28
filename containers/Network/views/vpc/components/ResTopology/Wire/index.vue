<template>
  <div class="d-flex res-topology">
    <div class="c-left d-flex">
      <res-vpc :dataSource="vpc" :class="{'invisible': idx > 0 }" />
      <res-wire :dataSource="dataSource" />
    </div>
    <div class="c-right" :class="{'bl-none': isEmpty(networks)}">
      <ul class="list">
        <li class="item d-flex" v-for="(network, nidx) in networks" :key="nidx">
          <res-ipsubnet :dataSource="network" />
          <div v-for="(obj, idx) in getAddress(network)" :key="idx">
            <res-common
              :type="RES_ICON_MAP[obj.owner_type]"
              :dataSource="obj"
              :multiple="getMultiple(nidx, networks, obj)" />
          </div>
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
import ResMixin from '../ResMixin'

export default {
  name: 'WireTopology',
  components: {
    ResVpc,
    ResWire,
    ResIpsubnet,
    ResCommon,
  },
  mixins: [ResMixin],
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
  methods: {
    getMultiple (nidx, networks, curAddress) {
      if (nidx > 1 && networks[nidx - 1]) {
        return networks[nidx - 1].address.includes(curAddress)
      }
      return false
    },
    getAddress (network) {
      const resTypes = ['servers', 'hosts', 'loadbalancers', 'dbinstances']
      return network.address?.filter(v => resTypes.includes(v.owner_type))
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../index.scss";
</style>
