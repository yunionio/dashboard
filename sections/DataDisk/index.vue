<template>
  <div class="data-disk">
    <template v-if="dataDisks.length === 0 && disabled"><span class="warning-color">{{$t('compute.text_128')}}</span></template>
    <template v-else>
      <div class="d-flex" v-for="(item, i) in dataDisks" :key="item.key">
        <disk
          :max="max"
          :min="item.min || min"
          :form="form"
          :schedtagParams="getSchedtagParams()"
          :snapshots-params="getSnapshotsParams"
          :diskTypeLabel="i === 0 ? '' : diskTypeLabel"
          :decorator="genDecorator(item.key)"
          :hypervisor="hypervisor"
          :types-map="typesMap"
          :elements="elements"
          :disabled="getDisabled(item)"
          :size-disabled="item.sizeDisabled"
          @snapshotChange="val => snapshotChange(item, val, i)"
          @diskTypeChange="val => diskTypeChange(item, val)" />
        <a-button v-if="!getDisabled(item, 'minus') && (dataDisks.length > 1 ? (i !== 0) : true)" shape="circle" icon="minus" size="small" @click="decrease(item.key)" class="mt-2" />
      </div>
      <div class="d-flex align-items-center" v-if="diskRemain > 0 && !disabled">
        <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" @click="add">{{$t('compute.text_129')}}</a-button>
        <span class="count-tips">{{$t('compute.text_130')}}<span class="remain-num">{{ diskRemain }}</span>{{$t('compute.text_131')}}</span>
      </div>
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import Disk from '@Compute/sections/Disk'
// import { STORAGE_AUTO } from '@Compute/constants'
import { STORAGE_TYPES } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import { uuid, findAndUnshift, findAndPush } from '@/utils/utils'

// 磁盘最小值
const DISK_MIN_SIZE = 10

export default {
  name: 'dataDisk',
  components: {
    Disk,
  },
  props: {
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
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
    isHostImageType: {
      type: Boolean,
      default: false,
    },
    isSnapshotImageType: {
      type: Boolean,
      default: false,
    },
    domain: {
      type: String,
      default: 'default',
    },
    isWindows: {
      type: Boolean,
      default: false,
    },
    enableMointpoint: { // 允许支持挂载点(目前仅新建oncloud支持)
      type: Boolean,
      default: false, // 默认不支持挂载点
    },
    defaultType: {
      type: Object,
    },
    systemStorageShow: {
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
      const ret = []
      if (this.isSnapshotImageType) return ret
      if (this.isHostImageType) return ['snapshot', 'schedtag']
      if (this.enableMointpoint) {
        if (!this.isWindows) {
          if (this.hypervisor === HYPERVISORS_MAP.kvm.key) {
            ret.push('mount-point')
          }
        }
      }
      if (this.hypervisor === HYPERVISORS_MAP.kvm.key) {
        ret.push('snapshot')
      }
      if (this.isIDC || this.isPrivate) {
        if (this.systemStorageShow) {
          return ret // 指定块存储后，系统盘和数据盘均确定且不在支持设置调度标签
        } else {
          ret.push('schedtag')
        }
      }
      return ret
    },
    typesMap () {
      const ret = {}
      const hyper = this.getHypervisor()
      const hypervisorDisks = { ...STORAGE_TYPES[hyper] } || {}
      if (!this.capabilityData || !this.capabilityData.data_storage_types2) return ret
      let currentTypes = this.capabilityData.data_storage_types2[hyper] || []
      if (!R.isNil(this.sku) && !R.isEmpty(this.sku)) {
        if (this.sku.data_disk_types) {
          const skuDiskTypes = this.sku.data_disk_types.split(',')
          if (skuDiskTypes && skuDiskTypes.length) {
            currentTypes = currentTypes.filter(val => {
              const type = val.split('/')[0]
              return skuDiskTypes.includes(type)
            })
          }
        } else {
          for (const obj in hypervisorDisks) {
            if (hypervisorDisks[obj].skuFamily && !hypervisorDisks[obj].skuFamily.includes(this.sku.instance_type_family)) {
              delete hypervisorDisks[obj]
            }
          }
        }
      } else {
        if (this.isPublic) {
          currentTypes = []
        }
      }
      if (hyper === HYPERVISORS_MAP.openstack.key) { // 前端特殊处理：openstack数据盘不支持 nova
        currentTypes = currentTypes.filter(val => {
          const types = val.split('/')
          if (types.length > 0) {
            return types[0] !== 'nova'
          }
          return true
        })
      }
      if (currentTypes.find(val => val.includes('local'))) {
        if (this.hypervisor === HYPERVISORS_MAP.google.key) {
          currentTypes = findAndPush(currentTypes, item => item.includes('local'))
        } else {
          currentTypes = findAndUnshift(currentTypes, item => item.includes('local'))
        }
      }
      for (let i = 0, len = currentTypes.length; i < len; i++) {
        const typeItemArr = currentTypes[i].split('/')
        const type = typeItemArr[0]
        const medium = typeItemArr[1]
        const opt = hypervisorDisks[type] || this.getExtraDiskOpt(type)
        if (opt) {
          const min = Math.max(DISK_MIN_SIZE, opt.min)
          if (opt) {
            ret[opt.key] = {
              ...opt,
              min,
              medium,
            }
          }
        }
      }
      // if (this.isIDC && this.hypervisor !== HYPERVISORS_MAP.kvm.key) {
      //   ret[STORAGE_AUTO.key] = STORAGE_AUTO
      // }
      if (this.hypervisor === HYPERVISORS_MAP.qcloud.key) {
        delete ret.local_nvme
        delete ret.local_pro
      }
      return ret
    },
    currentTypeObj () {
      // 数据盘仅第一块盘的磁盘类型可以修改
      const diskTypeKey = _.get(this.dataDisks, '[0].diskType.key')
      if (diskTypeKey) {
        return this.typesMap[diskTypeKey]
      }
      if (!R.isNil(this.typesMap) && !R.isEmpty(this.typesMap)) {
        const firstKey = Object.keys(this.typesMap)[0]
        return this.typesMap[firstKey]
      }
      return {}
    },
    max () {
      return this.currentTypeObj ? (this.currentTypeObj.max || DISK_MIN_SIZE) : DISK_MIN_SIZE
    },
    min () {
      return this.currentTypeObj ? (this.currentTypeObj.min || DISK_MIN_SIZE) : DISK_MIN_SIZE
    },
    diskRemain () {
      const remain = this.capabilityData.max_data_disk_count - this.dataDisks.length
      return Math.max(remain, 0)
    },
    diskTypeLabel () {
      return _.get(this.dataDisks, '[0].diskType.label')
    },
    getSnapshotsParams () {
      const staticParams = {
        with_meta: true,
        cloud_env: 'onpremise',
        limit: 0,
        disk_type: 'data',
        is_instance_snapshot: false,
        $t: uuid(),
        status: 'ready',
      }
      const scopeParams = {}
      if (this.$store.getters.isAdminMode) {
        scopeParams.project_domain = this.domain
      } else {
        scopeParams.scope = this.$store.getters.scope
      }
      const diskTypeKey = _.get(this.dataDisks, '[0].diskType.key')

      if (diskTypeKey) {
        staticParams['joint_filter.0'] = `storages.id(storage_id).storage_type.equals(${diskTypeKey})`
      }
      return {
        ...staticParams,
        ...scopeParams,
      }
    },
  },
  watch: {
    typesMap (v, oldV) {
      if (!R.equals(v, oldV)) {
        if (this.dataDisks && this.dataDisks.length) {
          this.dataDisks.forEach(disk => {
            if (!disk.disabled) this.decrease(disk.key)
          })
        }
      }
    },
  },
  methods: {
    getDisabled (item, itemName) {
      if (item.disabled) return true
      if (itemName && item[`${itemName}Disabled`]) {
        return true // 这里目前仅针对 minus 按钮
      }
      return this.disabled
    },
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
        if (index === 0 && this.dataDisks.length > 0) {
          const key = `dataDiskTypes[${this.dataDisks[0].key}]`
          const defaultKey = Object.keys(this.typesMap)[0]
          if (defaultKey) {
            const dataDiskTypes = {
              key: this.typesMap[defaultKey].key,
              label: this.typesMap[defaultKey].label,
            }
            this.form.fc.setFieldsValue({
              [key]: dataDiskTypes,
            })
          }
        }
        const formValue = this.form.fc.getFieldsValue()
        if (this.form.fd) { // 如果上层表单有fd时，需要在此同步数据(外层监听不到减少表单的情况)
          this.form.fd.dataDiskSizes = formValue.dataDiskSizes || {}
        }
      })
    },
    add ({ size, diskType, policy, schedtag, snapshot, filetype, mountPath, min, disabled = false, sizeDisabled = false, ...ret } = {}) {
      const key = uuid()
      const typeObj = this.typesMap[diskType]
      let dataDiskTypes = {
        key: _.get(this.dataDisks, '[0].diskType.key'),
        label: _.get(this.dataDisks, '[0].diskType.label'),
      }
      if (R.is(Object, typeObj)) { // 传入diskType，回填
        dataDiskTypes = {
          key: typeObj.key || diskType,
          label: typeObj.label || diskType,
        }
      } else if (!diskType && !_.get(this.dataDisks, '[0].diskType')) { // 表单中数据盘无第一项，需要 set 磁盘类型默认值
        const defaultKey = Object.keys(this.typesMap)[0]
        if (R.is(Object, this.defaultType) && this.defaultType.key && this.defaultType.label && this.typesMap[this.defaultType.key]) {
          dataDiskTypes = this.defaultType
        } else if (defaultKey) {
          dataDiskTypes = {
            key: this.typesMap[defaultKey].key,
            label: this.typesMap[defaultKey].label,
          }
        }
      }
      const dataDiskItem = {
        key,
        disabled,
        sizeDisabled,
        diskType: dataDiskTypes,
        ...ret, // 目前仅用于 minus 按钮
      }
      if (min) {
        dataDiskItem.min = Math.max(min, this.min, DISK_MIN_SIZE)
      }
      this.dataDisks.push(dataDiskItem)
      this.$nextTick(() => {
        const value = {
          [`dataDiskSizes[${key}]`]: R.is(Number, size) ? size : (min || this.min),
        }
        value[`dataDiskTypes[${key}]`] = dataDiskTypes
        if (schedtag) { // 磁盘调度标签
          value[`dataDiskSchedtags[${key}]`] = schedtag
        }
        if (policy) { // 磁盘调度策略
          value[`dataDiskPolicys[${key}]`] = policy
        }
        if (snapshot && (filetype || mountPath)) {
          console.error(this.$t('compute.text_132'))
        }
        if (snapshot) { // 磁盘快照
          value[`dataDiskSnapshots[${key}]`] = snapshot
        }
        if (filetype) { // 磁盘文件系统
          value[`dataDiskFiletypes[${key}]`] = filetype
        }
        if (mountPath) { // 磁盘挂载路径
          value[`dataDiskMountPaths[${key}]`] = mountPath
        }
        this.form.fc.setFieldsValue(value)
        this.setDiskMedium(dataDiskTypes)
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
        if (this.sku && this.sku.provider) {
          ret = this.sku.provider.toLowerCase()
        }
      }
      return ret
    },
    getSchedtagParams () {
      const params = {
        with_meta: true,
        resource_type: 'storages',
        limit: 0,
      }
      const scopeParams = {}
      if (this.$store.getters.isAdminMode) {
        scopeParams.project_domain = this.domain
      } else {
        scopeParams.scope = this.$store.getters.scope
      }
      return {
        ...params,
        ...scopeParams,
      }
    },
    diskTypeChange (item, val) {
      item.sizeDisabled = false
      // 仅有第一块盘可以更改磁盘类型
      this.$nextTick(() => {
        const dataDiskItem = {
          ...item,
          diskType: val,
        }
        if (item.min) {
          dataDiskItem.min = Math.max(item.min, this.min)
        }
        this.$set(this.dataDisks, 0, dataDiskItem)
        this.form.fc.setFieldsValue({
          [`dataDiskSizes[${item.key}]`]: Math.max((dataDiskItem.min || 0), this.min),
        })
        this.setDiskMedium(val)
      })
    },
    snapshotChange (item, val, i) {
      this.form.fc.setFieldsValue({
        [`dataDiskSizes[${item.key}]`]: val,
      })
      item.sizeDisabled = true
    },
    setDiskMedium (v) {
      if (this.form.fi) {
        this.$set(this.form.fi, 'dataDiskMedium', _.get(this.typesMap, `[${v.key}].medium`))
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/less/theme';

.data-disk {
  .count-tips {
    .remain-num {
      color: @primary-color;
    }
  }
}
</style>
