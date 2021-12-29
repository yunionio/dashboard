<template>
  <div class="d-flex res-topology vpc-topology">
    <div class="c-left">
      <res-wire :dataSource="dataSource" />
    </div>
    <div class="c-right" :class="{'res-topology-wire': physical ? !isEmpty(hosts) : !isEmpty(networks)}">
      <ul class="list" v-if="physical">
        <li class="item d-flex" v-for="(obj, nidx) in hosts" :key="nidx">
            <res-common
              :type="RES_ICON_MAP[obj.host_type] || obj.host_type"
              :dataSource="obj" />
        </li>
      </ul>
      <ul class="list" v-else>
        <li class="item d-flex" v-for="(network, nidx) in networks" :key="nidx">
          <res-ipsubnet :dataSource="network" />
          <div v-for="(obj, idx) in getAddress(network)" :key="idx">
            <res-common
              :type="RES_ICON_MAP[obj.owner_type] || obj.owner_type"
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
import ResWire from '../ResWire'
import ResIpsubnet from '../ResIpsubnet'

export default {
  name: 'VpcTopology',
  components: {
    ResWire,
    ResCommon,
    ResIpsubnet,
  },
  mixins: [ResMixin],
  props: {
    physical: Boolean,
    dataSource: Object,
  },
  data () {
    return {
      RES_ICON_MAP,
    }
  },
  computed: {
    networks () {
      return this.dataSource?.networks || []
    },
    hosts () {
      return this.dataSource?.hosts || []
    },
  },
  methods: {
    getMultiple (nidx, resArr, curObj) {
      if (this.physical) {
        if (resArr[nidx + 1]) {
          return resArr[nidx + 1].hosts.some((v, i) => {
            if (v.id === undefined || curObj.id === undefined) return false
            if (v.id === curObj.id) {
              resArr[nidx + 1].hosts[i].hidden = true
            }
            return v.id === curObj.id
          })
        }
      } else {
        if (resArr[nidx + 1]) {
          return resArr[nidx + 1].address.some((v, i) => {
            if (v.owner_id === undefined || curObj.owner_id === undefined) return false
            if (v.owner_id === curObj.owner_id) {
              resArr[nidx + 1].address[i].hidden = true
            }
            return v.owner_id === curObj.owner_id
          })
        }
      }
      return false
    },
    getHost (wire) {
      const resTypes = ['hypervisor', 'hosts', 'baremetal', 'esxi']
      return wire.hosts?.filter(v => resTypes.includes(v.host_type))
    },
    getAddress (network) {
      const resTypes = ['servers', 'loadbalancers', 'dbinstances']
      return network.address?.filter(v => resTypes.includes(v.owner_type))
    },
  },
}
</script>

<style lang="scss" scoped>
// @import "@Network/sections/Topology/index.scss";
</style>
