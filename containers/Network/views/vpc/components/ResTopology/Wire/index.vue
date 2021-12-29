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
              v-if="!obj.hidden"
              :type="RES_ICON_MAP[obj.owner_type]"
              :dataSource="obj" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ResCommon from '@Network/sections/Topology/ResCommon'
import { RES_ICON_MAP } from '@Network/sections/Topology/constants'
import ResMixin from '@Network/sections/Topology/ResMixin'
import ResVpc from '../ResVpc'
import ResWire from '../ResWire'
import ResIpsubnet from '../ResIpsubnet'

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
    getMultiple (nidx, resArr, curObj) {
      if (resArr[nidx + 1]) {
        return resArr[nidx + 1].address.some((v, i) => {
          if (v.owner_id === undefined || curObj.owner_id === undefined) return false
          if (v.owner_id === curObj.owner_id) {
            resArr[nidx + 1].address[i].hidden = true
          }
          return v.owner_id === curObj.owner_id
        })
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
// @import "@Network/sections/Topology/index.scss";
</style>
