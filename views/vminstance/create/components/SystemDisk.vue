<template>
  <div class="system-disk">
    <disk
      :max="max"
      :min="min"
      :decorator="decorator"
      :hypervisor="hypervisor"
      :types-map="typesMap"
      :elements="elements" />
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import Disk from '@Compute/sections/Disk'
import { STORAGE_AUTO } from '@Compute/constants'
import { STORAGE_TYPES } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'

// 磁盘最小值
export const DISK_MIN_SIZE = 10

export default {
  name: 'SystemDisk',
  inject: ['form'],
  components: {
    Disk,
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: val => ['idc', 'private', 'public'].includes(val),
    },
    hypervisor: {
      type: String,
      required: true,
    },
    sku: {
      type: Object,
    },
    capabilityData: {
      type: Object,
      required: true,
    },
    image: {
      type: Object,
    },
    decorator: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isPublic () {
      return this.type === 'public'
    },
    isPrivate () {
      return this.type === 'private'
    },
    isIDC () {
      return this.type === 'idc'
    },
    imageMinDisk () {
      const image = this.image
      if (image.info) {
        return (image.info.min_disk / 1024) || 0
      }
      return (image.min_disk / 1024) || 0
    },
    elements () {
      let ret = ['disk-select']
      if (!this.isPublic) {
        ret.push('schedtag')
      }
      return ret
    },
    typesMap () {
      const ret = {}
      const hypervisorDisks = { ...STORAGE_TYPES[this.getHypervisor()] } || {}
      let currentTypes = this.capabilityData.storage_types || []

      if (!R.isNil(this.sku) && !R.isEmpty(this.sku)) {
        for (let obj in hypervisorDisks) {
          if (hypervisorDisks[obj].skuFamily && !hypervisorDisks[obj].skuFamily.includes(this.sku.instance_type_family)) {
            delete hypervisorDisks[obj]
          }
        }
      } else {
        if (this.isPublic) {
          currentTypes = []
        }
      }
      for (let i = 0, len = currentTypes.length; i < len; i++) {
        const type = currentTypes[i].split('/')[0]
        let opt = hypervisorDisks[type] || this.getExtraDiskOpt(type)
        if (opt && !opt.sysUnusable) {
          // 新建ucloud云服务器时，系统盘类型选择普通本地盘或SSD本地盘，其大小只能是系统镜像min_disk大小
          let max = opt.sysMax
          if (this.getHypervisor() === HYPERVISORS_MAP.ucloud.key && ['LOCAL_NORMAL', 'LOCAL_SSD'].includes(opt.key)) {
            max = this.imageMinDisk
          }
          ret[opt.key] = {
            ...opt,
            min: Math.max(this.imageMinDisk, DISK_MIN_SIZE),
            max: max,
          }
        }
      }
      if (this.isIDC && this.hypervisor !== HYPERVISORS_MAP.kvm.key) {
        ret[STORAGE_AUTO.key] = {
          ...STORAGE_AUTO,
          min: Math.max(this.imageMinDisk, DISK_MIN_SIZE),
          max: STORAGE_AUTO.sysMax,
        }
      }
      return ret
    },
    currentTypeObj () {
      return this.typesMap[_.get(this.form, 'fd.systemDiskType.key')] || {}
    },
    max () {
      return this.currentTypeObj.sysMax || 0
    },
    min () {
      return this.currentTypeObj.sysMin || 0
    },
  },
  watch: {
    typesMap: {
      handler () {
        this.setDefaultType()
      },
      deep: true,
      immedate: true,
    },
  },
  methods: {
    setDefaultType () {
      const keys = Object.keys(this.typesMap)
      const firstKey = keys[0]
      let diskMsg = this.typesMap[firstKey]
      if (keys.includes(STORAGE_AUTO.key)) diskMsg = STORAGE_AUTO
      this.form.fc.setFieldsValue({
        systemDiskType: { key: diskMsg.key, label: diskMsg.label },
        systemDiskSize: diskMsg.sysMin,
      })
    },
    getExtraDiskOpt (type) {
      // 腾讯云过滤掉local_basic和local_ssd类型的盘
      if (this.getHypervisor() === HYPERVISORS_MAP.qcloud.key) {
        if (['local_basic', 'local_ssd'].includes(type)) {
          return
        }
      }
      // VMware过滤掉rbd类型的盘
      if (this.getHypervisor() === HYPERVISORS_MAP.esxi.key) {
        if (['rbd'].includes(type)) {
          return
        }
      }
      return {
        label: `${type}`,
        key: `${type}`,
        min: 1,
        max: 3 * 1024,
        sysMin: 10,
        sysMax: 500,
      }
    },
    getHypervisor () {
      let ret = this.hypervisor
      if (this.isPublic) {
        if (this.sku.provider) {
          ret = this.sku.provider.toLowerCase()
        }
      }
      return ret
    },
  },
}
</script>
