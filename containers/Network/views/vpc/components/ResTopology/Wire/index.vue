<template>
  <div class="d-flex res-topology">
    <div class="c-left d-flex">
      <res-vpc :dataSource="vpc" :class="{'invisible': idx > 0 }" />
      <res-wire :dataSource="dataSource" :idx="idx" :len="len" />
    </div>
    <div class="c-right" :class="{'bl-none': isEmpty(networks)}">
      <ul class="list">
        <li class="item d-flex" v-for="(network, nidx) in networks" :key="nidx">
          <res-ipsubnet :dataSource="network" />
          <div v-for="(obj, idx) in getAddress(network)" :key="idx">
            <res-common
              v-if="!obj.hidden"
              :type="RES_ICON_MAP[obj.owner_type]"
              :dataSource="obj"
              :isExist="isExist(networks, nidx, obj)" />
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
    len: Number,
    wires: Array,
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
      return network.address?.filter(v => resTypes.includes(v.owner_type)) || []
    },
    isExist (networks, nidx, addr) {
      let isExist = false

      // 同 wire 查找
      for (let i = nidx - 1; i >= 0; i--) {
        const addressArr = this.getAddress(networks[i])
        isExist = addressArr.some(v => v.owner_id === addr.owner_id)
      }

      // 跨 wire 查找
      for (let i = this.idx - 1; i >= 0; i--) {
        const wire = this.wires[i]
        if (wire.networks && wire.networks.length > 0) {
          for (let j = 0; j < wire.networks.length; j++) {
            const network = wire.networks[j]
            if (network && network.address) {
              const addressArr = this.getAddress(network)
              isExist = addressArr.some(v => v.owner_id === addr.owner_id)
            }
          }
        }
      }

      return isExist
    },
  },
}
</script>

<style lang="scss" scoped>
// @import "@Network/sections/Topology/index.scss";
</style>
