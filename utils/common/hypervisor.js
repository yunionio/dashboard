import * as R from 'ramda'
import { HYPERVISORS_MAP, EXTRA_HYPERVISORS } from '@/constants'
import { changeToArr } from '@/utils/utils'

export class TypeClouds {
  hypervisorMap = {}
  brandMap = {}
  providerMap = {}
  hosttypeMap = {}
  constructor ({ ignore = [], env = ['idc', 'private', 'public'] } = {}) {
    this.ignore = ignore
    this.env = changeToArr(env)
    this.initMap()
  }
  initMap () {
    this.hypervisorMap = Object.assign({}, HYPERVISORS_MAP, EXTRA_HYPERVISORS)
    // 支持 hypervisor、brand、provider、host_type
    R.forEachObjIndexed((obj, key) => {
      if (this.env.includes(obj.env)) {
        this.brandMap[obj.brand] = {
          ...obj,
          key: obj.brand,
        }
        this.providerMap[obj.provider] = {
          ...obj,
          key: obj.provider,
        }
        this.hosttypeMap[obj.host_type] = {
          ...obj,
          key: obj.host_type,
        }
      }
    }, this.hypervisorMap)
  }
  commonGet (map) {
    const currentMap = {}
    R.forEachObjIndexed((obj, key) => {
      if (!this.ignore.includes(key.toLowerCase())) {
        currentMap[key] = obj
      }
    }, map)
    return currentMap
  }
  getHypervisor () {
    return this.commonGet(this.hypervisorMap)
  }
  getProvider () {
    return this.commonGet(this.providerMap)
  }
  getBrand () {
    return this.commonGet(this.brandMap)
  }
  getHosttype () {
    return this.commonGet(this.hosttypeMap)
  }
}
