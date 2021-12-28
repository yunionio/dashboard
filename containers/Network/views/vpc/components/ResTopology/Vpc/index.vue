<template>
  <div class="d-flex res-topology vpc-topology">
    <div class="c-left">
      <res-vpc :dataSource="dataSource" />
    </div>
    <div class="c-right" :class="{'bl-none': classic ? isEmpty(wires) : isEmpty(networks)}">
      <ul class="list">
        <template v-if="classic">
          <li class="item d-flex" v-for="(wire, nidx) in wires" :key="nidx">
              <res-wire :physical="physical" :dataSource="wire" />
              <div v-for="(obj, idx) in getHost(wire)" :key="idx">
                <res-common
                  v-if="!obj.hidden"
                  :type="RES_ICON_MAP[obj.host_type] || obj.host_type"
                  :dataSource="obj" />
              </div>
          </li>
        </template>
        <template v-else>
          <li class="item d-flex" v-for="(network, nidx) in networks" :key="nidx">
            <res-ipsubnet :dataSource="network" />
            <div v-for="(obj, idx) in getAddress(network)" :key="idx">
              <res-common
                v-if="!obj.hidden"
                :type="RES_ICON_MAP[obj.owner_type] || obj.owner_type"
                :dataSource="obj" />
            </div>
          </li>
        </template>
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
  name: 'VpcTopology',
  components: {
    ResVpc,
    ResWire,
    ResCommon,
    ResIpsubnet,
  },
  mixins: [ResMixin],
  props: {
    classic: Boolean,
    physical: Boolean,
    dataSource: Object,
  },
  data () {
    return {
      RES_ICON_MAP,
    }
  },
  computed: {
    wires () {
      return this.dataSource?.wires || []
    },
    networks () {
      let networks = []
      if (this.dataSource) {
        this.dataSource.wires.forEach(v => {
          networks = networks.concat(v.networks.filter(v => v.server_type === 'guest'))
        })
      }
      return networks
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
      const resTypes = ['servers', 'hosts', 'loadbalancers', 'dbinstances']
      return network.address?.filter(v => resTypes.includes(v.owner_type))
    },
  },
}
</script>

<style lang="scss" scoped>
@import "../index.scss";
</style>
