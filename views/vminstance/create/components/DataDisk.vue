<template>
  <div class="system-disk">
    <div class="d-flex" v-for="(item, i) in dataDisks" :key="item.key">
      <disk
        :max="max"
        :min="min"
        :diskTypeLabel="diskTypeLabel"
        :decorator="genDecorator(item.key)"
        :hypervisor="hypervisor"
        :types-map="typesMap"
        :elements="elements" />
      <a-button shape="circle" icon="minus" size="small" @click="decrease(i)" class="mt-2 ml-2" />
    </div>
    <div class="d-flex align-items-center" v-if="diskRemain > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">添加新磁盘</a-button>
      <span class="count-tips">您还可以添加 <span class="remain-num">{{ diskRemain }}</span> 块</span>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import Disk from '@Compute/sections/Disk'
import { STORAGE_AUTO } from '@Compute/constants'
import { STORAGE_TYPES } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import { uuid } from '@/utils/utils'

// 磁盘最小值
const DISK_MIN_SIZE = 10

export default {
  name: 'dataDisk',
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
      validator: val => {
        const fields = ['type', 'size', 'schedtag', 'policy', 'snapshot', 'filetype', 'mountPath']
        return fields.every(f => R.is(Function, val[f]))
      },
    },
  },
  data () {
    return {
      dataDisks: [],
    }
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
      let ret = []
      if (this.hypervisor === HYPERVISORS_MAP.kvm.key) {
        ret.push('mount-point')
        ret.push('snapshot')
      }
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
      return this.currentTypeObj.max || 0
    },
    min () {
      return this.currentTypeObj.min || 0
    },
    diskTypeLabel () {
      return _.get(this.form, 'fd.systemDiskType.label')
    },
    diskRemain () {
      const remain = this.capabilityData.max_data_disk_count - this.dataDisks.length
      return Math.max(remain, 0)
    },
  },
  methods: {
    genDecorator (uid) {
      const ret = {}
      R.forEachObjIndexed((item, key) => {
        ret[key] = item(uid)
      }, this.decorator)
      return ret
    },
    decrease (index) {
      this.dataDisks.splice(index, 1)
    },
    add () {
      const key = uuid()
      this.dataDisks.push({
        key,
      })
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          [`dataDiskSizes[${key}]`]: this.min,
        })
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

<style lang="scss" scoped>
@import '../../../../../../src/styles/variables';

.system-disk {
  .count-tips {
    .remain-num {
      color: $primary-color;
    }
  }
}
</style>
