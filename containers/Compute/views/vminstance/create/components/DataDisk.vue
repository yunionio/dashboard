<template>
  <div class="data-disk">
    <template v-if="dataDisks.length === 0 && disabled"><span class="warning-color">无数据盘</span></template>
    <template v-else>
      <div class="d-flex" v-for="item in dataDisks" :key="item.key">
        <disk
          :max="max"
          :min="min"
          :diskTypeLabel="diskTypeLabel"
          :decorator="genDecorator(item.key)"
          :hypervisor="hypervisor"
          :types-map="typesMap"
          :elements="elements"
          :disabled="disabled" />
        <a-button v-if="!disabled" shape="circle" icon="minus" size="small" @click="decrease(item.key)" class="mt-2 ml-2" />
      </div>
      <div class="d-flex align-items-center" v-if="diskRemain > 0 && !disabled">
        <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" @click="add">添加新磁盘</a-button>
        <span class="count-tips">您还可以添加 <span class="remain-num">{{ diskRemain }}</span> 块</span>
      </div>
    </template>
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
    decorator: {
      type: Object,
      required: true,
      validator: val => {
        const fields = ['type', 'size', 'schedtag', 'policy', 'snapshot', 'filetype', 'mountPath']
        return fields.every(f => R.is(Function, val[f]))
      },
    },
    disabled: {
      type: Boolean,
      default: false,
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
        if (opt) {
          let min = Math.max(DISK_MIN_SIZE, opt.min)
          if (opt) {
            ret[opt.key] = {
              ...opt,
              min,
            }
          }
        }
      }
      if (this.isIDC && this.hypervisor !== HYPERVISORS_MAP.kvm.key) {
        ret[STORAGE_AUTO.key] = STORAGE_AUTO
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
    decrease (key) {
      const index = this.dataDisks.findIndex(val => val.key === key)
      this.dataDisks.splice(index, 1)
      this.$nextTick(() => {
        const formValue = this.form.fc.getFieldsValue()
        if (this.form.fd) { // 如果上层表单有fd时，需要在此同步数据(外层监听不到减少表单的情况)
          this.form.fd.dataDiskSizes = formValue.dataDiskSizes
        }
      })
    },
    add (size) {
      const key = uuid()
      this.dataDisks.push({
        key,
      })
      this.$nextTick(() => {
        console.log(size, 'size')
        this.form.fc.setFieldsValue({
          [`dataDiskSizes[${key}]`]: R.is(Number, size) ? size : this.min,
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

.data-disk {
  .count-tips {
    .remain-num {
      color: $primary-color;
    }
  }
}
</style>
