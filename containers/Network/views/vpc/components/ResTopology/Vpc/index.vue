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
                  :dataSource="obj"
                  :isExist="isHostExist(wires, nidx, obj)"
                  :schedTagColorsMap="schedTagColorsMap"
                  :showStorageTag="true" />
              </div>
          </li>
          <li class="item d-flex" v-for="(item, sid) of getShareStorages(wires)" :key="sid">
            <res-share-storage
              :key="item.storage.id"
              :dataSource="item.storage" />
            <div v-for="(obj, idx) in getHosts(wires, item.storage.id)" :key="idx">
              <res-common
                v-if="!obj.hidden"
                :type="RES_ICON_MAP[obj.host_type] || obj.host_type"
                :dataSource="obj"
                :isExist="true"
                :schedTagColorsMap="schedTagColorsMap"
                :showStorageTag="true" />
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
                :dataSource="obj"
                :isExist="isAddrExist(networks, nidx, obj)" />
            </div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import { KVM_SHARE_STORAGES } from '@/constants/storage'
import ResCommon from '@Network/sections/Topology/ResCommon'
import { RES_ICON_MAP } from '@Network/sections/Topology/constants'
import ResMixin from '@Network/sections/Topology/ResMixin'
import ResVpc from '../ResVpc'
import ResWire from '../ResWire'
import ResIpsubnet from '../ResIpsubnet'
import ResShareStorage from '../ResShareStorage'

const COLORS = ['#E45826', '#874356', '#0E3EDA', '#139487', '#464E2E', '#A1B57D', '#6E3CBC', '#6FB2D2', '#C5D8A4', '#F473B9', '#D18CE0', '#203239']

export default {
  name: 'VpcTopology',
  components: {
    ResVpc,
    ResWire,
    ResCommon,
    ResIpsubnet,
    ResShareStorage,
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
          if (v.networks && v.networks.length > 0) {
            networks = networks.concat(v.networks.filter(v => v.server_type === 'guest'))
          }
        })
      }
      return networks
    },
    schedTagColorsMap () {
      const ret = {}
      let index = 0
      const { wires = [], hosts = [] } = this.dataSource
      const originWires = wires.length ? wires : [{ hosts }]
      originWires.map(wire => {
        const { hosts = [] } = wire
        hosts.map(host => {
          const { schedtags = [] } = host
          schedtags.map(schedtag => {
            if (schedtag.name && !ret[schedtag.name]) {
              ret[schedtag.name] = COLORS[index % COLORS.length]
              index++
            }
          })
        })
      })
      return ret
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
    isHostExist (wires, nidx, host) {
      let isExist = false

      // 跨 wire 查找
      for (let i = nidx - 1; i >= 0; i--) {
        const wire = wires[i]
        if (wire.hosts && wire.hosts.length > 0) {
          const hostArr = this.getHost(wire)
          isExist = hostArr.some(v => v.id === host.id)
          if (isExist) return true
        }
      }

      return isExist
    },
    isAddrExist (networks, nidx, addr) {
      let isExist = false

      // 跨 networks 查找
      for (let i = nidx - 1; i >= 0; i--) {
        const network = networks[i]
        if (network.address && network.address.length > 0) {
          const addressArr = this.getAddress(network)
          isExist = addressArr.some(v => v.owner_id === addr.owner_id)
        }
      }

      return isExist
    },
    getShareStoragesAndHosts (wires) {
      const shareStorages = []
      const storageHosts = []

      for (const wire of wires) {
        if (wire.hosts && wire.hosts.length > 0) {
          const hosts = []
          for (const host of wire.hosts) {
            if (host.storages && host.storages.length > 0) {
              for (const storage of host.storages) {
                const isExsit = shareStorages.find(item => item.storage.id === storage.id)
                if (KVM_SHARE_STORAGES.includes(storage.storage_type)) {
                  hosts.push(host)
                  storageHosts.push({ key: storage.id, value: hosts })
                  !isExsit && shareStorages.push({ storage })
                }
              }
            }
          }
        }
      }

      return [shareStorages, storageHosts]
    },
    getShareStorages (wires) {
      return this.getShareStoragesAndHosts(wires)[0]
    },
    getHosts (wires, storageId) {
      const storageHosts = this.getShareStoragesAndHosts(wires)[1]
      const originHosts = []
      const hosts = storageHosts.filter(item => item.key === storageId).map(item => item.value).flat()
      hosts.forEach(item => {
        const isExist = originHosts.find(v => v.id === item.id)
        !isExist && originHosts.push(item)
      })
      return originHosts
    },
  },
}
</script>

<style lang="scss" scoped>
// @import "@Network/sections/Topology/index.scss";
</style>
