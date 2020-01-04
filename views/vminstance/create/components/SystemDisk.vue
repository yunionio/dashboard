<template>
  <div class="system-disk">
    <disk
      :max="max"
      :min="min"
      :decorator="decorator"
      :hypervisor="hypervisor"
      :types-map="typesMap"
      :elements="elements"
      :disabled="disabled" />
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import Disk from '@Compute/sections/Disk'
import { STORAGE_AUTO } from '@Compute/constants'
import { IMAGES_TYPE_MAP, STORAGE_TYPES } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'

// 磁盘最小值
export const DISK_MIN_SIZE = 10
// let isFirstSetDefaultSize = true

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
    disabled: {
      type: Boolean,
      default: false,
    },
    isHostImageType: {
      type: Boolean,
      default: false,
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
      let minSize = 0
      if (!image) return 0
      if (this.isHostImageType) {
        if (image.root_image) {
          minSize = (image.root_image.min_disk_mb / 1024) || 0
        }
      } else if (image.info) {
        minSize = (image.info.min_disk / 1024) || 0
      } else {
        minSize = (image.min_disk / 1024) || 0
      }
      return Math.ceil(minSize)
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
      const hyper = this.getHypervisor()
      if (!hyper) return ret
      const hypervisorDisks = { ...STORAGE_TYPES[hyper] } || {}
      if (!this.capabilityData || !this.capabilityData.data_storage_types2) return ret
      let currentTypes = this.capabilityData.data_storage_types2[hyper] || []
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
          if (hyper === HYPERVISORS_MAP.ucloud.key && ['LOCAL_NORMAL', 'LOCAL_SSD'].includes(opt.key)) {
            max = this.imageMinDisk
          }
          ret[opt.key] = {
            ...opt,
            sysMin: Math.max(this.imageMinDisk, DISK_MIN_SIZE),
            sysMax: max,
          }
        }
      }
      if (this.isIDC && this.hypervisor !== HYPERVISORS_MAP.kvm.key) {
        ret[STORAGE_AUTO.key] = {
          ...STORAGE_AUTO,
          sysMin: Math.max(this.imageMinDisk, DISK_MIN_SIZE),
          sysMax: STORAGE_AUTO.sysMax,
        }
      }
      this.$nextTick(this.setDefaultType)
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
  created () {
    this.setDefaultType = _.debounce(this.setDefaultType, 300)
  },
  methods: {
    setDefaultType () {
      if (R.isNil(this.typesMap) || R.isEmpty(this.typesMap)) return
      if ([IMAGES_TYPE_MAP.host.key, IMAGES_TYPE_MAP.snapshot.key].includes(this.form.fd.imageType)) return // 主机镜像和主机快照设置默认值交给外层处理
      const keys = Object.keys(this.typesMap)
      const firstKey = keys[0]
      let diskMsg = this.typesMap[firstKey]
      this.form.fc.setFieldsValue({
        systemDiskType: { key: diskMsg.key, label: diskMsg.label },
      })
      this.$nextTick(() => { // 解决磁盘大小 inputNumber 第一次点击变为0 的bug
        this.form.fc.setFieldsValue({
          systemDiskSize: +diskMsg.sysMin,
        })
      })
    },
    getExtraDiskOpt (type) {
      const hyper = this.getHypervisor()
      // 腾讯云过滤掉local_basic和local_ssd类型的盘
      if (hyper === HYPERVISORS_MAP.qcloud.key) {
        if (['local_basic', 'local_ssd'].includes(type)) {
          return
        }
      }
      // VMware过滤掉rbd类型的盘
      if (hyper === HYPERVISORS_MAP.esxi.key) {
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
