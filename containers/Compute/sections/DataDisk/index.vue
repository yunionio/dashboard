<template>
  <div class="data-disk">
    <template v-if="dataDisks.length === 0 && (disabled || imageType === 'backup' || imageType === 'snapshot')"><span class="warning-color">{{$t('compute.text_128')}}</span></template>
    <template v-else>
      <div class="d-flex" v-for="(item, i) in dataDisks" :key="item.key">
        <disk
          :ref="'disks'"
          :diskKey="item.key"
          :max="max(i)"
          :min="item.min || min(i)"
          :form="form"
          :schedtagParams="getSchedtagParams()"
          :snapshots-params="getSnapshotsParams"
          :diskTypeLabel="getDiskTypeLabel(i, diskTypeLabel)"
          :decorator="genDecorator(item.key)"
          :hypervisor="hypervisor"
          :types-map="typesMap"
          :elements="elements"
          :disabled="getDisabled(item)"
          :size-disabled="item.sizeDisabled"
          :simplify="simplify"
          :storageParams="storageParams"
          :storageHostParams="storageHostParams"
          :isStorageShow="isStorageShow"
          :isIopsShow="isIopsShow"
          :isThroughputShow="isThroughputShow"
          :defaultIops="item.iops"
          :defaultThroughput="item.throughput"
          :iopsLimit="iopsLimit[item.key]"
          :isAutoResetShow="isAutoResetShow"
          :imageType="imageType"
          @snapshotChange="val => snapshotChange(item, val, i)"
          @diskTypeChange="val => diskTypeChange(item, val, i)"
          @storageHostChange="(val) => $emit('storageHostChange', val)" />
        <a-button v-if="!getDisabled(item, 'minus') && (dataDisks.length > 1 ? (i !== 0) : true) && isAddDiskShow" shape="circle" icon="minus" size="small" @click="decrease(item.key)" class="mt-2" />
      </div>
      <div class="d-flex align-items-center" v-if="diskRemain > 0 && !disabled && isAddDiskShow && imageType !== 'backup' && imageType !== 'snapshot'">
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
import { MEDIUM_MAP } from '@Compute/constants'
import { STORAGE_TYPES } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import { uuid, findAndUnshift, findAndPush } from '@/utils/utils'
import { diskSupportTypeMedium, getOriginDiskKey } from '@/utils/common/hypervisor'

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
    simplify: {
      type: Boolean,
      default: false,
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
    // 调整配置等场景：SKU 可能晚于磁盘组件就绪，仍需用 zone capability 构建 typesMap
    allowCapabilityTypesWithoutSku: {
      type: Boolean,
      default: false,
    },
    isStorageShow: {
      type: Boolean,
      default: false,
    },
    storageParams: {
      type: Object,
    },
    storageHostParams: Object,
    isIopsShow: {
      type: Boolean,
      default: false,
    },
    isThroughputShow: {
      type: Boolean,
      default: false,
    },
    isServertemplate: {
      type: Boolean,
      default: false,
    },
    isVminstanceContainer: {
      type: Boolean,
      default: false,
    },
    isAutoResetShow: {
      type: Boolean,
      default: false,
    },
    forceElements: {
      type: Array,
    },
    isAddDiskShow: {
      type: Boolean,
      default: true,
    },
    forceSizeDisabled: {
      type: Boolean,
      default: false,
    },
    imageType: {
      type: String,
    },
    isInitForm: {
      type: Boolean,
      default: false,
    },
    fieldPrefix: {
      type: String,
      default: 'dataDisk',
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
    isAws () {
      return this.hypervisor === HYPERVISORS_MAP.aws.key
    },
    elements () {
      const ret = []
      if (this.forceElements) return this.forceElements
      if (this.isSnapshotImageType) return ret
      if (this.isHostImageType) return ['snapshot', 'schedtag']
      if (this.isVminstanceContainer) return ['storage', 'schedtag']
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
      if (this.form.fd.hypervisor === HYPERVISORS_MAP.esxi.key ||
        this.hypervisor === HYPERVISORS_MAP.esxi.key ||
        this.form.fd.hypervisor === HYPERVISORS_MAP.kvm.key ||
        this.hypervisor === HYPERVISORS_MAP.kvm.key) {
        ret.push('storage') // vmware,kvm支持指定存储
      }
      if (this.isIDC || this.isPrivate) {
        // if (this.isStorageShow) {
        //   return ret // 指定块存储后，系统盘和数据盘均确定且不在支持设置调度标签
        // } else {
        ret.push('schedtag')
        // }
      }
      if (this.isAws && !this.isServertemplate) {
        if (this.currentTypeObj()?.key === 'gp3') {
          ret.push('iops', 'throughput')
        }
        if (['io1', 'io2'].includes(this.currentTypeObj()?.key)) {
          ret.push('iops')
        }
      }
      return ret
    },
    iopsLimit () {
      const value = {}
      if (!this.isAws || this.isServertemplate) return value
      this.dataDisks.map(item => {
        const type = item.diskType?.key
        let ret = { min: 0 }
        const sizes = this.form.fd[this._fp('Sizes')] || {}
        const size = sizes[item.key]
        // gp3 iops 不能超过磁盘500倍，最大80000
        if (type === 'gp3') {
          ret = { min: 3000, max: 80000 }
          if (size) {
            ret.max = Math.min(size * 500, ret.max)
          }
        }
        // io1 iops 不能超过磁盘50倍，最大64000
        if (type === 'io1') {
          ret = { min: 100, max: 64000 }
          if (size) {
            ret.max = Math.min(size * 50, ret.max)
          }
        }
        // io2 iops 不能超过磁盘1000倍，最大256000
        if (type === 'io2') {
          ret = { min: 100, max: 256000 }
          if (size) {
            ret.max = Math.min(size * 1000, ret.max)
          }
        }
        value[item.key] = ret
      })
      return value
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
        if (this.isPublic && !this.allowCapabilityTypesWithoutSku) {
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
        let opt = hypervisorDisks[type] || this.getExtraDiskOpt(type)
        // 磁盘区分介质
        if (diskSupportTypeMedium(hyper)) {
          opt = {
            ...opt,
            key: `${type}/${medium}`,
            label: `${opt.label}(${MEDIUM_MAP[medium]})`,
          }
        }
        if (opt) {
          const min = Math.max(DISK_MIN_SIZE, opt.min)
          let max = opt.max
          // 谷歌云共享核心磁盘最多为3072GB
          if (hyper === HYPERVISORS_MAP.google.key && this.sku && ['e2-micro', 'e2-small', 'e2-medium', 'f1-micro', 'g1-small'].includes(this.sku.name)) {
            max = 3072
          }
          if (opt) {
            ret[opt.key] = {
              ...opt,
              min,
              medium,
              max: max,
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
        os_arch: this.form.fd.os_arch,
      }
      const scopeParams = {}
      if (this.$store.getters.isAdminMode) {
        scopeParams.project_domain = this.domain
      } else {
        scopeParams.scope = this.$store.getters.scope
      }
      let diskTypeKey = _.get(this.dataDisks, '[0].diskType.key')
      const hypervisor = _.get(this.form.fd, 'hypervisor')

      if (diskTypeKey) {
        // 磁盘区分介质
        if (diskSupportTypeMedium(hypervisor)) {
          diskTypeKey = getOriginDiskKey(diskTypeKey)
        }
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
          this.dataDisks.forEach((disk, index) => {
            this.form.fc.setFieldsValue({
              [this._fp('Sizes', disk.key)]: Math.max((disk.value || 0), this.min(index)),
            })
            if (this.isInitForm) return
            if (!disk.disabled) this.decrease(disk.key)
          })
        }
      }
    },
    defaultType (v, oldV) {
      // vmware系统盘改变清空数据盘，忽略调整配置初始化的情况
      if (this.getHypervisor() === HYPERVISORS_MAP.esxi.key && oldV && oldV.label) {
        this.dataDisks = []
      }
    },
  },
  methods: {
    _fp (suffix, key) {
      return key !== undefined ? `${this.fieldPrefix}${suffix}[${key}]` : `${this.fieldPrefix}${suffix}`
    },
    currentTypeObj (index = 0) {
      // 非阿里云 数据盘仅第一块盘的磁盘类型可以修改
      const diskTypeKey = _.get(this.dataDisks, `[${index}].diskType.key`)
      if (diskTypeKey) {
        return this.typesMap[diskTypeKey]
      }
      if (!R.isNil(this.typesMap) && !R.isEmpty(this.typesMap)) {
        const firstKey = Object.keys(this.typesMap)[0]
        return this.typesMap[firstKey]
      }
      return {}
    },
    currentDiskCapability (index = 0) {
      if (this.hypervisor !== HYPERVISORS_MAP.kvm.key) return {}
      const instance_capabilities = this.capabilityData.instance_capabilities || []
      const storages = instance_capabilities.find(item => item.hypervisor === this.hypervisor)?.storages || {}
      const data_disk = storages.data_disk || []
      const currentDisk = data_disk.find(item => this.currentTypeObj(index).key?.startsWith(item.storage_type))
      return currentDisk
    },
    max (index = 0) {
      return this.currentDiskCapability(index)?.max_size_gb || this.currentTypeObj(index)?.max || DISK_MIN_SIZE
    },
    min (index = 0) {
      return this.currentDiskCapability(index)?.min_size_gb || this.currentTypeObj(index)?.min || DISK_MIN_SIZE
    },
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
          const key = this._fp('Types', this.dataDisks[0].key)
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
          this.form.fd[this._fp('Sizes')] = formValue[this._fp('Sizes')] || {}
        }
      })
    },
    add ({ size, diskType, policy, schedtag, snapshot, filetype, mountPath, min, disabled = false, sizeDisabled = false, medium, preallocation, autoReset, ...ret } = {}) {
      const key = uuid()
      let newDiskType = diskType
      // 磁盘区分介质
      if (this.hypervisor && diskSupportTypeMedium(this.hypervisor) && medium) {
        newDiskType = `${diskType}/${medium}`
      }
      const typeObj = this.typesMap[newDiskType]
      const idx = this.dataDisks?.length || 0
      let dataDiskTypes = {
        key: _.get(this.dataDisks, '[0].diskType.key'),
        label: _.get(this.dataDisks, '[0].diskType.label'),
        index: idx,
      }
      if (R.is(Object, typeObj)) { // 传入diskType，回填
        dataDiskTypes = {
          key: typeObj.key || diskType,
          label: typeObj.label || diskType,
          index: idx,
        }
      } else if (!diskType && !_.get(this.dataDisks, '[0].diskType')) { // 表单中数据盘无第一项，需要 set 磁盘类型默认值
        const defaultKey = Object.keys(this.typesMap)[0]
        if (R.is(Object, this.defaultType) && this.defaultType.key && this.defaultType.label && this.typesMap[this.defaultType.key]) {
          dataDiskTypes = {
            ...this.defaultType,
            index: idx,
          }
        } else if (defaultKey) {
          dataDiskTypes = {
            key: this.typesMap[defaultKey].key,
            label: this.typesMap[defaultKey].label,
            index: idx,
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
        dataDiskItem.min = Math.max(min, this.min(idx), DISK_MIN_SIZE)
      }
      this.dataDisks.push(dataDiskItem)
      this.$nextTick(() => {
        const configs = {}
        const value = {
          [this._fp('Sizes', key)]: R.is(Number, size) ? size : (min || this.min(idx)),
        }
        value[this._fp('Types', key)] = dataDiskTypes
        if (schedtag) { // 磁盘调度标签
          configs.showAdvanced = true
          configs.showSchedtag = true
          value[this._fp('Schedtags', key)] = schedtag
        }
        if (policy) { // 磁盘调度策略
          value[this._fp('Policys', key)] = policy
          configs.showAdvanced = true
          configs.showSchedtag = true
        }
        if (snapshot && (filetype || mountPath)) {
          console.error(this.$t('compute.text_132'))
        }
        if (snapshot) { // 磁盘快照
          value[this._fp('Snapshots', key)] = snapshot
          configs.showAdvanced = true
          configs.showSnapshot = true
        }
        if (filetype) { // 磁盘文件系统
          value[this._fp('Filetypes', key)] = filetype
          configs.showAdvanced = true
          configs.showMountpoint = true
        }
        if (mountPath) { // 磁盘挂载路径
          value[this._fp('MountPaths', key)] = mountPath
          configs.showAdvanced = true
          configs.showMountpoint = true
        }
        if (autoReset) {
          value[this._fp('AutoReset', key)] = autoReset
          configs.showAdvanced = true
          configs.isAutoResetShow = true
        }
        if (this.getHypervisor() === HYPERVISORS_MAP.esxi.key) {
          value[this._fp('Preallocation', key)] = preallocation
          configs.showAdvanced = true
          configs.showPreallocation = true
        }
        if (configs.showAdvanced) {
          setTimeout(() => {
            this.$refs.disks[this.dataDisks.findIndex(val => val.key === key)].setValues(configs)
            setTimeout(() => {
              this.form.fc.setFieldsValue(value)
            }, 1000)
            this.setDiskMedium(dataDiskTypes)
          }, 1000)
        } else {
          this.form.fc.setFieldsValue(value)
          this.setDiskMedium(dataDiskTypes)
        }
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
      if (!this.forceSizeDisabled) {
        item.sizeDisabled = false
      }
      // 非阿里云 仅第一块盘可以更改磁盘类型
      if (this.getHypervisor() !== HYPERVISORS_MAP.aliyun.key) {
        this.$nextTick(() => {
          if (!this.forceSizeDisabled) {
            const dataDiskItem = {
              ...item,
              diskType: val,
            }
            if (item.min) {
              dataDiskItem.min = Math.max(item.min, this.min(0))
            }
            this.$set(this.dataDisks, 0, dataDiskItem)
            this.form.fc.setFieldsValue({
              [this._fp('Sizes', item.key)]: Math.max((dataDiskItem.min || 0), this.min(0)),
            })
          }
          // 数据盘更改类型
          if (val.key !== item.diskType?.key) {
            const diskSizes = this.form.fd[this._fp('Sizes')] || {}
            for (const diskId in diskSizes) {
              const curDiskType = this.form.fd[this._fp('Types', diskId)]
              if (curDiskType) {
                this.form.fc.setFieldsValue({
                  [this._fp('Types', diskId)]: { ...val, index: curDiskType?.index },
                })
              }
            }
          }
          this.setDiskMedium(val)
        })
      } else {
        this.$nextTick(() => {
          if (!this.forceSizeDisabled) {
            const dataDiskItem = {
              ...item,
              diskType: val,
            }
            const index = this.dataDisks.findIndex(val => val.key === item.key)
            if (item.min) {
              dataDiskItem.min = Math.max(item.min, this.min(index))
            }
            this.$set(this.dataDisks, index || 0, dataDiskItem)
            this.form.fc.setFieldsValue({
              [this._fp('Sizes', item.key)]: Math.max((dataDiskItem.min || 0), this.min(index)),
            })
          }
          // 数据盘更改类型
          if (val.key !== item.diskType?.key) {
            const diskSizes = this.form.fd[this._fp('Sizes')] || {}
            for (const diskId in diskSizes) {
              const curDiskType = this.form.fd[this._fp('Types', diskId)]
              if (curDiskType && diskId === val.key) {
                this.form.fc.setFieldsValue({
                  [this._fp('Types', diskId)]: { ...val, index: curDiskType?.index },
                })
              }
            }
          }
          this.setDiskMedium(val)
        })
      }
    },
    snapshotChange (item, val, i) {
      this.form.fc.setFieldsValue({
        [this._fp('Sizes', item.key)]: val,
      })
      item.sizeDisabled = true
    },
    setDiskMedium (v) {
      if (this.form.fi) {
        this.$set(this.form.fi, `${this.fieldPrefix}Medium`, _.get(this.typesMap, `[${v.key}].medium`))
      }
    },
    getDiskTypeLabel (i, diskTypeLabel) {
      if (this.getHypervisor() === HYPERVISORS_MAP.esxi.key) {
        return this.$te(`common.storage.${diskTypeLabel}`) ? this.$t(`common.storage.${diskTypeLabel}`) : diskTypeLabel
      }
      if (i === 0 || this.getHypervisor() === HYPERVISORS_MAP.aliyun.key) {
        return ''
      }
      if (this.$te(`common.storage.${diskTypeLabel}`)) {
        return this.$t(`common.storage.${diskTypeLabel}`)
      }
      if (_.get(this.typesMap, `[${diskTypeLabel}].label`)) {
        return _.get(this.typesMap, `[${diskTypeLabel}].label`)
      }
      return diskTypeLabel
    },
    isSomeLocal (types) {
      const localTypes = types.filter(item => item.indexOf('local') !== -1)
      return localTypes.length > 1
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
