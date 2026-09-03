<template>
  <div class="system-disk">
    <disk
      ref="disk"
      diskKey="system"
      :max="max"
      :min="min"
      :form="form"
      :decorator="decorator"
      :hypervisor="hypervisor"
      :types-map="typesMap"
      :elements="elements"
      :disabled="disabled"
      :image-type="imageType"
      :storageParams="storageParams"
      :storageHostParams="storageHostParams"
      :schedtagParams="getSchedtagParams()"
      :size-disabled="sizeDisabled || disabled"
      :storage-status-map="storageStatusMap"
      :isStorageShow="isStorageShow"
      :isIopsShow="isIopsShow"
      :isThroughputShow="isThroughputShow"
      :iopsLimit="iopsLimit"
      :isAutoResetShow="isAutoResetShow"
      :defaultIops="defaultIops"
      :defaultThroughput="defaultThroughput"
      @showStorageChange="showStorageChange"
      @optionalChange="onDiskOptionalChange"
      @advancedChange="onDiskAdvancedChange"
      @diskTypeChange="setDiskMedium"
      @storageHostChange="(val) => $emit('storageHostChange', val)"
      @diskStorageOptionsReady="tryApplySessionDiskDraft" />
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import Disk from '@Compute/sections/Disk'
import { MEDIUM_MAP } from '@Compute/constants'
import { IMAGES_TYPE_MAP, STORAGE_TYPES, DISK_LABEL_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP, isUcloudLikeHypervisor } from '@/constants'
import { findAndUnshift, findAndPush } from '@/utils/utils'
import { diskSupportTypeMedium, getOriginDiskKey } from '@/utils/common/hypervisor'
// let isFirstSetDefaultSize = true

import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import { DRAFT_KIND } from '@/utils/createFormDraft'

// 磁盘最小值
export const DISK_MIN_SIZE = 10
export default {
  name: 'SystemDisk',
  components: {
    Disk,
  },
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    // 选择类：类型等可跨 tab；高级项跨 tab 不展开/不回填（见 applyCreateFormFieldDraft）
    formDraftKind: {
      type: String,
      default: DRAFT_KIND.SELECTION,
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fd && val.fc,
    },
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
    imageType: {
      type: String,
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
    domain: {
      type: String,
      default: 'default',
    },
    sizeDisabled: {
      type: Boolean,
      default: false,
    },
    defaultSize: {
      type: Number,
    },
    defaultIops: {
      type: Number,
    },
    defaultThroughput: {
      type: Number,
    },
    defaultType: {
      type: Object,
    },
    // 调整配置等场景：SKU 可能晚于磁盘组件就绪，仍需用 zone capability 构建 typesMap
    allowCapabilityTypesWithoutSku: {
      type: Boolean,
      default: false,
    },
    isServertemplate: {
      type: Boolean,
      default: false,
    },
    storageParams: {
      type: Object,
    },
    storageHostParams: Object,
    ignoreStorageStatus: {
      type: Boolean,
      default: false,
    },
    isStorageShow: {
      type: Boolean,
      default: false,
    },
    isIopsShow: {
      type: Boolean,
      default: false,
    },
    isThroughputShow: {
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
    isVMware () {
      return this.form.fd.hypervisor === HYPERVISORS_MAP.esxi.key
    },
    isAws () {
      return this.hypervisor === HYPERVISORS_MAP.aws.key
    },
    isCNware () {
      return this.hypervisor === HYPERVISORS_MAP.cnware.key
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
        minSize = ((image.info.min_disk_mb || image.info.min_disk) / 1024) || 0
      } else {
        minSize = ((image.min_disk_mb || image.min_disk) / 1024) || 0
      }
      return Math.ceil(minSize)
    },
    kvmSkuSysMaxDisk () {
      if (this.form.fd.hypervisor !== HYPERVISORS_MAP.kvm.key) return 0
      if (!this.sku) return 0
      return this.sku.sys_disk_max_size_gb || 0
    },
    elements () {
      const ret = ['disk-select']
      if (this.isIDC) {
        ret.push('schedtag')
        if (this.form.fd.hypervisor === HYPERVISORS_MAP.esxi.key || this.form.fd.hypervisor === HYPERVISORS_MAP.kvm.key) {
          ret.push('storage') // vmware,kvm 支持指定块存储
        }
        // if (this.isStorageShow) {
        //   return ret // 指定块存储后，系统盘和数据盘均确定且不在支持设置调度标签
        // } else {
        //   ret.push('schedtag')
        // }
      }
      if (this.isAws) {
        if (this.currentTypeObj?.key === 'gp3') {
          ret.push('iops', 'throughput')
        }
        if (['io1', 'io2'].includes(this.currentTypeObj?.key)) {
          ret.push('iops')
        }
      }
      if (this.forceElements) {
        return this.forceElements
      }
      return ret
    },
    iopsLimit () {
      let ret = { min: 0 }
      if (this.isAws) {
        const { systemDiskSize } = this.form.fd
        // gp3 iops 不能超过磁盘500倍，最大80000
        if (this.currentTypeObj?.key === 'gp3') {
          ret = { min: 3000, max: 80000 }
          if (systemDiskSize) {
            ret.max = Math.min(systemDiskSize * 500, ret.max)
          }
        }
        // io1 iops 不能超过磁盘50倍，最大64000
        if (this.currentTypeObj?.key === 'io1') {
          ret = { min: 100, max: 64000 }
          if (systemDiskSize) {
            ret.max = Math.min(systemDiskSize * 50, ret.max)
          }
        }
        // io2 iops 不能超过磁盘1000倍，最大256000
        if (this.currentTypeObj?.key === 'io2') {
          ret = { min: 100, max: 256000 }
          if (systemDiskSize) {
            ret.max = Math.min(systemDiskSize * 1000, ret.max)
          }
        }
      }
      return ret
    },
    typesMap () {
      const ret = {}
      const hyper = this.getHypervisor()
      if (!hyper) return ret
      const hypervisorDisks = { ...STORAGE_TYPES[hyper] } || {}
      if (!this.capabilityData || !this.capabilityData.storage_types2) return ret
      let currentTypes = this.capabilityData.storage_types2[hyper] || []

      if (!R.isNil(this.sku) && !R.isEmpty(this.sku)) {
        if (this.sku.sys_disk_type && !this.defaultSize) { // 有 defaultSize 表示是调整配置，不需要根据sku信息过滤
          const skuDiskTypes = this.sku.sys_disk_type.split(',')
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
      const localIndex = currentTypes.findIndex(item => item.includes('local'))
      const novaIndex = currentTypes.findIndex(item => item.includes('nova'))
      if (localIndex !== -1 && localIndex !== 0) { // 将local放置首位
        currentTypes = findAndUnshift(currentTypes, item => item.includes('local'))
      }
      if (novaIndex !== -1 && novaIndex !== (currentTypes.length - 1)) { // 将nova放置到最后
        currentTypes = findAndPush(currentTypes, item => item.includes('nova'))
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
        if (opt && !opt.sysUnusable) {
          // 新建ucloud虚拟机时，系统盘类型选择普通本地盘或SSD本地盘，其大小只能是系统镜像min_disk大小
          let max = opt.sysMax
          if (isUcloudLikeHypervisor(hyper) && ['LOCAL_NORMAL', 'LOCAL_SSD'].includes(getOriginDiskKey(opt.key))) {
            max = this.imageMinDisk
          }
          // 谷歌云共享核心磁盘最多为3072GB
          if (hyper === HYPERVISORS_MAP.google.key && this.sku && ['e2-micro', 'e2-small', 'e2-medium', 'f1-micro', 'g1-small'].includes(this.sku.name)) {
            max = 3072
          }
          ret[opt.key] = {
            ...opt,
            medium,
            sysMin: Math.max(this.imageMinDisk, opt.sysMin, DISK_MIN_SIZE),
            sysMax: max,
            label: opt.key === 'nova' ? this.$t('compute.text_1141') : (DISK_LABEL_MAP[opt.label] || opt.label),
          }
          if (this.hypervisor === HYPERVISORS_MAP.google.key) {
            ret[opt.key].sysMin = opt.sysMin
          }
        }
      }
      if (this.hypervisor === HYPERVISORS_MAP.google.key) {
        delete ret['local-ssd']
      }
      if (this.hypervisor === HYPERVISORS_MAP.qcloud.key) {
        delete ret.local_nvme
        delete ret.local_pro
      }
      this.$nextTick(this.setDefaultType)
      return ret
    },
    currentTypeObj () {
      if (R.is(Object, this.typesMap) && this.form.fd[this.decorator.type[0]] && this.form.fd[this.decorator.type[0]].key) {
        return this.typesMap[this.form.fd[this.decorator.type[0]].key] || {}
      }
      return {}
    },
    currentDiskCapability () {
      if (this.hypervisor !== HYPERVISORS_MAP.kvm.key) return {}
      const instance_capabilities = this.capabilityData?.instance_capabilities || []
      const storages = instance_capabilities.find(item => item.hypervisor === this.hypervisor)?.storages
      const sys_disk = storages?.sys_disk || []
      const currentDisk = sys_disk.find(item => this.currentTypeObj.key?.startsWith(item.storage_type))
      return currentDisk
    },
    max () {
      if (this.kvmSkuSysMaxDisk && this.kvmSkuSysMaxDisk > this.min) {
        return this.kvmSkuSysMaxDisk
      }
      if (!this.currentDiskCapability?.max_size_gb) {
        return this.currentTypeObj.sysMax || this.defaultSize
      }
      return Math.min(this.currentDiskCapability?.max_size_gb, (this.currentTypeObj.sysMax || this.defaultSize))
    },
    min () {
      if (!this.currentDiskCapability?.min_size_gb) {
        return this.currentTypeObj.sysMin || 0
      }
      return Math.max(this.currentDiskCapability?.min_size_gb, (this.currentTypeObj.sysMin || 0))
    },
    storageStatusMap () {
      var statusMap = {
        type: '',
        tooltip: '',
        isError: false,
      }
      if (this.ignoreStorageStatus || !this.form.fd.systemDiskType || !this.form.fd.systemDiskType.key) return statusMap
      if (this.capabilityData.storage_types3 && this.hypervisor && this.hypervisor === HYPERVISORS_MAP.openstack.hypervisor) {
        const storageTypes3 = this.capabilityData.storage_types3[this.hypervisor] || {}
        const storages = []
        for (const prop in storageTypes3) {
          if (prop.startsWith(this.currentTypeObj.key)) {
            storages.push(storageTypes3[prop])
          }
        }
        const isAllEmpty = storages.every(v => v.capacity === 0)
        if (isAllEmpty) {
          // 没有设置容量：XXX存储的容量没有设置，无法创建虚拟机，请到存储--块存储进行设置，如无法查看请联系管理员设置
          statusMap = { type: 'error', tooltip: this.$t('compute.text_1142', [this.currentTypeObj.key]), isError: true }
          return
        }
        const isNotEnough = storages.every(v => v.free_capacity === 0 || v.free_capacity / 1024 < this.form.fd.systemDiskSize)
        if (isNotEnough) {
          // 选择磁盘容量不足：XXX存储的容量不足，无法创建虚拟机，请到存储--块存储进行查看，如无法查看请联系管理员查看
          statusMap = { type: 'error', tooltip: this.$t('compute.text_1143', [this.currentTypeObj.key]), isError: true }
          return
        }
      }
      this.$bus.$emit('VMCreateDisabled', statusMap.isError)
      return statusMap
    },
  },
  watch: {
    typesMap: {
      immediate: true,
      handler (map) {
        if (R.isEmpty(map)) return
        this.tryApplySessionDiskDraft()
        this.ensureSysDiskDefaultSize()
      },
      deep: true,
    },
    imageMinDisk (val) {
      if (!val || !this.form?.fc) return
      const sizeKey = this.decorator.size[0]
      const cur = this.form.fc.getFieldValue(sizeKey)
      // VMware：系统盘需等于镜像最小盘
      if (this.isVMware) {
        this.setFormDiskFields({ [sizeKey]: val })
        return
      }
      // 其它平台：当前值小于镜像最小盘时抬到合法下限（草稿回填过小等）
      if (cur == null || cur === '' || Number(cur) < val) {
        this.setFormDiskFields({ [sizeKey]: val })
      }
    },
  },
  created () {
    this.setDefaultType = _.debounce(this.setDefaultType, 1000)
    this.sysDiskDraftRestoring = false
    this._pendingSessionDiskDraft = null
    this._pendingSessionFromLocal = false
  },
  methods: {
    finishSessionDiskDraftRestore () {
      this.sysDiskDraftRestoring = false
      if (this.form?.fi) this.$set(this.form.fi, 'diskDraftRestoring', false)
      this.ensureSysDiskDefaultSize()
    },
    /** 同 tab：typesMap、Disk 子组件、块存储 options 就绪后再视为完成 */
    isSessionDiskDraftRestoreComplete (draft) {
      const disk = this.$refs.disk
      if (!disk) return false
      const adv = this.pickSysDiskAdvancedDraft(draft)
      if (!Object.keys(adv).length) return true
      if (!disk.showAdvanced) return false
      const storageKey = this.decorator.storage?.[0]
      const storageVal = storageKey && (adv[storageKey] !== undefined ? adv[storageKey] : adv.systemDiskStorage)
      if (storageVal) {
        if (!disk.showStorage) return false
      }
      if ((adv.systemDiskSchedtag || adv.systemDiskPolicy ||
        adv[this.decorator.schedtag?.[0]] || adv[this.decorator.policy?.[0]]) &&
        !disk.showSchedtag) return false
      if ((adv.systemDiskSnapshot || adv[this.decorator.snapshot?.[0]]) && !disk.showSnapshot) return false
      if ((adv.systemDiskPreallocation || adv[this.decorator.preallocation?.[0]]) && !disk.showPreallocation) {
        return false
      }
      return true
    },
    /**
     * 就绪驱动回填：typesMap / Disk / Storage options 变化时重入，直到完成或草稿清空
     * @returns {boolean} 是否已完成
     */
    tryApplySessionDiskDraft (options = {}) {
      if (!this.form?.fc) return true
      const fromLocal = options.fromLocal != null
        ? !!options.fromLocal
        : (this._pendingSessionFromLocal || this.isFormFieldDraftFromLocal())
      let draft = options.draft || this._pendingSessionDiskDraft
      if (!draft && this.canRestoreFormFieldDraft()) {
        const raw = this.readFormFieldDraft()
        if (raw) draft = this.sanitizeDraftForRestore(raw)
      }
      if (!draft || !Object.keys(draft).length) {
        this._pendingSessionDiskDraft = null
        return true
      }
      if (R.isEmpty(this.typesMap)) return false

      this.sysDiskDraftRestoring = true
      if (this.form.fi) this.$set(this.form.fi, 'diskDraftRestoring', true)

      if (fromLocal) {
        this._sysDiskLocalFullDraft = { ...draft }
        this._sysDiskGatedApplied = Object.create(null)
        this._sysDiskFromLocal = true
        this._sysDiskLocalAdvanceApplied = false
        this.applySysDiskDraftToForm(this.pickSysDiskBaseDraft(draft))
        this.finishSessionDiskDraftRestore()
        this._pendingSessionDiskDraft = null
        return true
      }

      this._sysDiskFromLocal = false
      this._sysDiskLocalAdvanceApplied = true
      this.applySysDiskDraftToForm(this.sanitizeDraftForRestore(draft))

      if (!this.hasSysDiskAdvancedDraft(draft)) {
        this.finishSessionDiskDraftRestore()
        this._pendingSessionDiskDraft = null
        return true
      }

      const disk = this.$refs.disk
      if (!disk) return false

      disk.showAdvanced = true
      this.applySysDiskAdvancedDraft(draft)

      if (this.isSessionDiskDraftRestoreComplete(draft)) {
        this.finishSessionDiskDraftRestore()
        this._pendingSessionDiskDraft = null
        return true
      }
      this._pendingSessionDiskDraft = draft
      this._pendingSessionFromLocal = false
      return false
    },
    /** 写 fc 并同步 fd（setFieldsValue 不会触发 onValuesChange） */
    setFormDiskFields (values) {
      if (!this.form?.fc || !values || typeof values !== 'object') return
      this.form.fc.setFieldsValue(values)
      if (!this.form.fd) return
      Object.keys(values).forEach((key) => {
        this.$set(this.form.fd, key, values[key])
      })
    },
    // 由 typesMap watch → tryApplySessionDiskDraft 自管；保留方法供页面编排兼容调用
    restoreFormFieldDraftFields () {
      if (!this.canRestoreFormFieldDraft()) return false
      if (typeof this.isCreateFormFieldTouched === 'function' && this.isCreateFormFieldTouched(this.resolveFormDraftKey())) {
        return false
      }
      if (R.isEmpty(this.typesMap)) return false
      return !!this.tryApplySessionDiskDraft()
    },
    /**
     * 回填白名单：仅保留选择型子字段（类型/存储/调度标签/策略/快照/自动重置/预分配），
     * 输入子字段（大小/iops/throughput）不回填，交由组件默认值
     */
    sanitizeDraftForRestore (draft) {
      if (draft == null || typeof draft !== 'object') return draft
      const pairs = [
        [this.decorator.type?.[0], 'systemDiskType'],
        [this.decorator.storage?.[0], 'systemDiskStorage'],
        [this.decorator.schedtag?.[0], 'systemDiskSchedtag'],
        [this.decorator.policy?.[0], 'systemDiskPolicy'],
        [this.decorator.snapshot?.[0], 'systemDiskSnapshot'],
        [this.decorator.auto_reset?.[0], 'systemDiskAutoReset'],
        [this.decorator.preallocation?.[0], 'systemDiskPreallocation'],
      ]
      const ret = {}
      pairs.forEach(([key, alias]) => {
        if (!key) return
        const val = draft[key] !== undefined ? draft[key] : draft[alias]
        if (val !== undefined) {
          ret[key] = val
          ret[alias] = val
        }
      })
      return ret
    },
    /** 系统盘类型（非高级）；跨 tab local 仅回填此项 */
    pickSysDiskBaseDraft (draft) {
      if (!draft || typeof draft !== 'object') return {}
      const typeKey = this.decorator.type?.[0]
      const ret = {}
      const typeVal = draft[typeKey] !== undefined ? draft[typeKey] : draft.systemDiskType
      if (typeVal !== undefined) {
        if (typeKey) ret[typeKey] = typeVal
        ret.systemDiskType = typeVal
      }
      return ret
    },
    /** 系统盘高级项；跨 tab 仅在用户手动打开高级后回填 */
    pickSysDiskAdvancedDraft (draft) {
      if (!draft || typeof draft !== 'object') return {}
      const pairs = [
        [this.decorator.storage?.[0], 'systemDiskStorage'],
        [this.decorator.schedtag?.[0], 'systemDiskSchedtag'],
        [this.decorator.policy?.[0], 'systemDiskPolicy'],
        [this.decorator.snapshot?.[0], 'systemDiskSnapshot'],
        [this.decorator.auto_reset?.[0], 'systemDiskAutoReset'],
        [this.decorator.preallocation?.[0], 'systemDiskPreallocation'],
      ]
      const ret = {}
      pairs.forEach(([key, alias]) => {
        if (!key) return
        const val = draft[key] !== undefined ? draft[key] : draft[alias]
        if (val !== undefined) {
          ret[key] = val
          ret[alias] = val
        }
      })
      return ret
    },
    hasSysDiskAdvancedDraft (draft) {
      const adv = this.pickSysDiskAdvancedDraft(draft)
      return Object.keys(adv).length > 0
    },
    applySysDiskAdvancedDraft (draft, options = {}) {
      if (!draft || !this.form?.fc) return
      const adv = this.pickSysDiskAdvancedDraft(draft)
      if (!Object.keys(adv).length) return
      const openToggles = options.openToggles !== false
      // 跨 tab：用户刚展开高级时，不自动打开「指定块存储」等开关，仅回填始终可见项（如关机重置）
      if (!openToggles) {
        const autoKey = this.decorator.auto_reset?.[0]
        const autoVal = adv[autoKey] !== undefined ? adv[autoKey] : adv.systemDiskAutoReset
        if (autoKey && autoVal !== undefined) {
          this.setFormDiskFields({ [autoKey]: autoVal })
        }
        return
      }
      this.applySysDiskDraftToForm(adv)
      const disk = this.$refs.disk
      if (!disk) return
      if (adv.systemDiskStorage || adv[this.decorator.storage?.[0]]) disk.showStorage = true
      if (adv.systemDiskSchedtag || adv.systemDiskPolicy ||
        adv[this.decorator.schedtag?.[0]] || adv[this.decorator.policy?.[0]]) {
        disk.showSchedtag = true
      }
      if (adv.systemDiskSnapshot || adv[this.decorator.snapshot?.[0]]) disk.showSnapshot = true
      if (adv.systemDiskPreallocation || adv[this.decorator.preallocation?.[0]]) disk.showPreallocation = true
    },
    /** 跨 tab：优先用进页时缓存的完整草稿（避免类型落盘冲掉高级选择） */
    isSysDiskDraftFromLocal () {
      return !!(this._sysDiskFromLocal || this.isFormFieldDraftFromLocal())
    },
    resolveSysDiskLocalDraft () {
      const raw = this._sysDiskLocalFullDraft || this.readFormFieldDraft()
      return this.sanitizeDraftForRestore(raw)
    },
    onDiskAdvancedChange (open) {
      if (!open || this._sysDiskLocalAdvanceApplied) return
      if (!this.isSysDiskDraftFromLocal()) return
      const draft = this.resolveSysDiskLocalDraft()
      if (!this.hasSysDiskAdvancedDraft(draft)) return
      this._sysDiskLocalAdvanceApplied = true
      // 跨 tab：展开高级后不自动打开子开关；子开关由 onDiskOptionalChange 再回填
      this.$nextTick(() => this.applySysDiskAdvancedDraft(draft, { openToggles: false }))
    },
    /**
     * 跨 tab：用户打开「指定块存储 / 调度标签 / 快照 / 预分配」后再回填对应选择值
     */
    applySysDiskGatedOptionalFromDraft (flag) {
      if (!flag || !this.isSysDiskDraftFromLocal()) return
      if (!this._sysDiskGatedApplied) this._sysDiskGatedApplied = Object.create(null)
      if (this._sysDiskGatedApplied[flag]) return
      const draft = this.resolveSysDiskLocalDraft()
      if (!draft) return
      const values = {}
      if (flag === 'showStorage') {
        const key = this.decorator.storage?.[0]
        const val = key && (draft[key] !== undefined ? draft[key] : draft.systemDiskStorage)
        if (key && val !== undefined) values[key] = val
      } else if (flag === 'showSchedtag') {
        const sk = this.decorator.schedtag?.[0]
        const pk = this.decorator.policy?.[0]
        const sv = sk && (draft[sk] !== undefined ? draft[sk] : draft.systemDiskSchedtag)
        const pv = pk && (draft[pk] !== undefined ? draft[pk] : draft.systemDiskPolicy)
        if (sk && sv !== undefined) values[sk] = sv
        if (pk && pv !== undefined) values[pk] = pv
      } else if (flag === 'showSnapshot') {
        const key = this.decorator.snapshot?.[0]
        const val = key && (draft[key] !== undefined ? draft[key] : draft.systemDiskSnapshot)
        if (key && val !== undefined) values[key] = val
      } else if (flag === 'showPreallocation') {
        const key = this.decorator.preallocation?.[0]
        const val = key && (draft[key] !== undefined ? draft[key] : draft.systemDiskPreallocation)
        const opts = this.$refs.disk?.preallocationOptions || []
        // 预分配选项固定：不在列表则不回填
        if (opts.length && val !== undefined && !opts.some(o => o.id === val || o.key === val || o.value === val)) {
          this._sysDiskGatedApplied[flag] = true
          return
        }
        if (key && val !== undefined) values[key] = val
      }
      if (!Object.keys(values).length) return
      this._sysDiskGatedApplied[flag] = true
      // Storage / BaseSelect 异步挂载后校验：不在 options 的会被组件清空
      const write = () => this.setFormDiskFields(values)
      write()
      this.$nextTick(() => {
        write()
        this.$nextTick(write)
      })
    },
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f) return undefined
      const pick = {}
      const disk = this.$refs.disk
      const storageKey = this.decorator.storage?.[0]
      const schedtagKey = this.decorator.schedtag?.[0]
      const policyKey = this.decorator.policy?.[0]
      const snapshotKey = this.decorator.snapshot?.[0]
      const preallocationKey = this.decorator.preallocation?.[0]
      const autoResetKey = this.decorator.auto_reset?.[0]
      // size / iops / throughput 为输入字段：不写入草稿，避免回填与默认值抢跑
      const keys = [
        this.decorator.type?.[0],
        storageKey,
        schedtagKey,
        policyKey,
        snapshotKey,
        autoResetKey,
        preallocationKey,
      ].filter(Boolean)
      // 未展开的可选高级项不写入草稿，保证展示与提交一致
      const skip = new Set()
      if (!disk?.showStorage && storageKey) skip.add(storageKey)
      if (!disk?.showSchedtag) {
        if (schedtagKey) skip.add(schedtagKey)
        if (policyKey) skip.add(policyKey)
      }
      if (!disk?.showSnapshot && snapshotKey) skip.add(snapshotKey)
      if (!disk?.showPreallocation && preallocationKey) skip.add(preallocationKey)
      keys.forEach((k) => {
        if (skip.has(k)) return
        const v = f.getFieldValue(k)
        if (v !== undefined) pick[k] = v
      })
      // 跨 tab：未展开子项时用进页 stash 保留高级选择，避免类型变更落盘冲掉
      if (this.isSysDiskDraftFromLocal() && this._sysDiskLocalFullDraft) {
        const kept = this.pickSysDiskAdvancedDraft(this.sanitizeDraftForRestore(this._sysDiskLocalFullDraft))
        const skipMerge = new Set()
        if (disk?.showStorage) {
          if (storageKey) skipMerge.add(storageKey)
          skipMerge.add('systemDiskStorage')
        }
        if (disk?.showSchedtag) {
          if (schedtagKey) skipMerge.add(schedtagKey)
          if (policyKey) skipMerge.add(policyKey)
          skipMerge.add('systemDiskSchedtag')
          skipMerge.add('systemDiskPolicy')
        }
        if (disk?.showSnapshot) {
          if (snapshotKey) skipMerge.add(snapshotKey)
          skipMerge.add('systemDiskSnapshot')
        }
        if (disk?.showPreallocation) {
          if (preallocationKey) skipMerge.add(preallocationKey)
          skipMerge.add('systemDiskPreallocation')
        }
        // 高级已展开：关机重置以表单为准
        if (disk?.showAdvanced) {
          if (autoResetKey) skipMerge.add(autoResetKey)
          skipMerge.add('systemDiskAutoReset')
        }
        Object.keys(kept).forEach((k) => {
          if (skipMerge.has(k)) return
          if (pick[k] === undefined && kept[k] !== undefined) pick[k] = kept[k]
        })
      }
      // 落盘前对照 typesMap 校正类型
      const typeKey = this.decorator.type?.[0]
      if (typeKey && pick[typeKey]) {
        pick[typeKey] = this.resolveSysDiskTypeFromDraft(pick[typeKey])
      }
      return Object.keys(pick).length ? pick : undefined
    },
    /** 草稿磁盘类型对照当前 typesMap，不可用则回退首项 */
    resolveSysDiskTypeFromDraft (typeVal) {
      if (!typeVal?.key) return typeVal
      if (!this.typesMap || R.isEmpty(this.typesMap)) return typeVal
      if (this.typesMap[typeVal.key]) {
        return { key: typeVal.key, label: this.typesMap[typeVal.key].label || typeVal.label }
      }
      const backend = String(typeVal.key).split('/')[0]
      const matched = Object.keys(this.typesMap).find(k => k === backend || k.startsWith(`${backend}/`))
      if (matched) {
        return { key: matched, label: this.typesMap[matched].label }
      }
      const firstKey = Object.keys(this.typesMap)[0]
      return firstKey ? { key: firstKey, label: this.typesMap[firstKey].label } : typeVal
    },
    /** 草稿大小夹到 [镜像min / sysMin, sysMax]，保证合法；NaN/非法值返回 undefined 表示无需回填 */
    clampSysDiskDraftSize (sizeVal, typeKey) {
      if (sizeVal == null || sizeVal === '') return sizeVal
      let size = Number(sizeVal)
      if (Number.isNaN(size)) return undefined
      const diskMsg = (typeKey && this.typesMap?.[typeKey]) || {}
      const min = Math.max(this.imageMinDisk || 0, diskMsg.sysMin || this.min || 0, 0)
      const max = diskMsg.sysMax || this.max || Infinity
      if (size < min) size = min
      if (Number.isFinite(max) && size > max) size = max
      return size
    },
    applyCreateFormFieldDraft (draft, options = {}) {
      if (!draft || !this.form?.fc) return
      draft = this.sanitizeDraftForRestore(draft)
      if (!draft || !Object.keys(draft).length) return
      const fromLocal = options.fromLocal != null
        ? !!options.fromLocal
        : this.isFormFieldDraftFromLocal()
      this._pendingSessionDiskDraft = draft
      this._pendingSessionFromLocal = fromLocal
      this.$nextTick(() => this.tryApplySessionDiskDraft({ draft, fromLocal }))
    },
    /**
     * 大小永不回填：不经 setDefaultType debounce，立刻写入镜像/类型默认值
     */
    ensureSysDiskDefaultSize () {
      if (!this.form?.fc) return
      const sizeKey = this.decorator.size?.[0]
      if (!sizeKey) return
      const cur = this.form.fc.getFieldValue(sizeKey) ?? this.form.fd?.[sizeKey]
      const valid = cur != null && cur !== '' && Number(cur) > 0 && !Number.isNaN(Number(cur))
      if (valid) return
      if (R.isNil(this.typesMap) || R.isEmpty(this.typesMap)) {
        return
      }
      if ([IMAGES_TYPE_MAP.host.key, IMAGES_TYPE_MAP.snapshot.key].includes(this.form.fd?.imageType)) return
      const typeKey = this.decorator.type?.[0]
      const typeVal = this.form.fc.getFieldValue(typeKey) || this.form.fd?.[typeKey]
      const keys = Object.keys(this.typesMap)
      let firstKey = keys[0]
      if (typeVal?.key) {
        if (this.typesMap[typeVal.key]) {
          firstKey = typeVal.key
        } else {
          const backend = String(typeVal.key).split('/')[0]
          const matched = keys.find(k => k === backend || k.startsWith(`${backend}/`))
          if (matched) firstKey = matched
        }
      }
      const diskMsg = this.typesMap[firstKey] || {}
      const initSize = this.defaultSize && this.defaultSize > this.imageMinDisk ? this.defaultSize : this.imageMinDisk
      const newDiskSize = initSize || +diskMsg.sysMin || this.min || DISK_MIN_SIZE
      this.setFormDiskFields({ [sizeKey]: newDiskSize })
    },

    setDefaultType () {
      // 草稿回填窗口：先落草稿类型，再继续走默认 size（大小永不回填）
      if (this.sysDiskDraftRestoring) {
        let draft = this.sanitizeDraftForRestore(this.readFormFieldDraft())
        if (this.isFormFieldDraftFromLocal()) draft = this.pickSysDiskBaseDraft(draft)
        if (draft && Object.keys(draft).length) this.applySysDiskDraftToForm(draft)
      }
      const typeKey = this.decorator.type[0]
      const sizeKey = this.decorator.size[0]
      const resolveTypeSize = () => {
        let systemDiskType = this.form.fd?.[typeKey] || this.form.fd?.systemDiskType
        let systemDiskSize = this.form.fd?.[sizeKey] ?? this.form.fd?.systemDiskSize
        if (!systemDiskType?.key && this.form?.fc) {
          systemDiskType = this.form.fc.getFieldValue(typeKey) || systemDiskType
        }
        if ((systemDiskSize == null || systemDiskSize === '') && this.form?.fc) {
          systemDiskSize = this.form.fc.getFieldValue(sizeKey)
        }
        return { systemDiskType, systemDiskSize }
      }
      if (R.isNil(this.typesMap) || R.isEmpty(this.typesMap)) {
        const { systemDiskSize, systemDiskType } = resolveTypeSize()
        // 草稿/工单回填：typesMap 尚未就绪时保留已写入的类型和大小，勿清空成 0
        if (systemDiskSize || (systemDiskType && systemDiskType.key)) {
          return
        }
        this.setFormDiskFields({
          [typeKey]: { key: '', label: '' },
          [sizeKey]: 0,
        })
        return
      }
      if ([IMAGES_TYPE_MAP.host.key, IMAGES_TYPE_MAP.snapshot.key].includes(this.form.fd.imageType)) return // 主机镜像和主机快照设置默认值交给外层处理
      const keys = Object.keys(this.typesMap)
      let firstKey = keys[0]
      const { systemDiskSize, systemDiskType } = resolveTypeSize()
      // 工单/草稿已写入的类型：精确匹配，或按 backend 前缀兜底（local/ssd ↔ typesMap）
      if (systemDiskType && systemDiskType.key) {
        if (this.typesMap[systemDiskType.key]) {
          firstKey = systemDiskType.key
        } else {
          const backend = String(systemDiskType.key).split('/')[0]
          const matched = keys.find(k => k === backend || k.startsWith(`${backend}/`))
          if (matched) firstKey = matched
        }
      }
      const diskMsg = this.typesMap[firstKey]
      const typeVal = { key: diskMsg.key, label: diskMsg.label }
      // 草稿回填中：保留草稿类型，勿被 defaultType 盖掉
      if (this.sysDiskDraftRestoring && systemDiskType?.key) {
        this.setFormDiskFields({ [typeKey]: this.typesMap[systemDiskType.key] ? { key: systemDiskType.key, label: this.typesMap[systemDiskType.key].label || systemDiskType.label } : typeVal })
      } else {
        this.setFormDiskFields(this.defaultType || { [typeKey]: typeVal })
      }
      this.setDiskMedium(diskMsg)
      this.$nextTick(() => { // 解决磁盘大小 inputNumber 第一次点击变为0 的bug
        const initSize = this.defaultSize && this.defaultSize > this.imageMinDisk ? this.defaultSize : this.imageMinDisk

        let newDiskSize = initSize || +diskMsg.sysMin
        // 已有合法大小则保留并夹取；否则用镜像/类型默认（大小永不从草稿回填）
        if (systemDiskSize != null && systemDiskSize !== '' && sizeKey === 'systemDiskSize' && !Number.isNaN(Number(systemDiskSize)) && Number(systemDiskSize) > 0) {
          newDiskSize = this.clampSysDiskDraftSize(systemDiskSize, firstKey)
        }
        this.setFormDiskFields({
          [typeKey]: this.form.fc.getFieldValue(typeKey) || typeVal,
          [sizeKey]: newDiskSize,
        })
      })
    },
    applySysDiskDraftToForm (draft) {
      if (!draft || !this.form?.fc) return
      const typeKey = this.decorator.type[0]
      const sizeKey = this.decorator.size[0]
      let typeVal = draft[typeKey] || draft.systemDiskType
      typeVal = this.resolveSysDiskTypeFromDraft(typeVal)
      const values = { ...draft }
      // 大小 / iops / throughput 永不回填
      delete values[sizeKey]
      delete values.systemDiskSize
      if (this.decorator.iops?.[0]) delete values[this.decorator.iops[0]]
      delete values.systemDiskIops
      if (this.decorator.throughput?.[0]) delete values[this.decorator.throughput[0]]
      delete values.systemDiskThroughput
      if (typeVal) values[typeKey] = typeVal
      this.setFormDiskFields(values)
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
    getSchedtagParams () {
      const params = {
        with_meta: true,
        cloud_env: 'onpremise',
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
    getHypervisor () {
      let ret = this.hypervisor
      if (this.isPublic) {
        if (this.sku && this.sku.provider) {
          ret = this.sku.provider.toLowerCase()
        }
      }
      return ret
    },
    showStorageChange (v) {
      if (this.form.fi) {
        this.$set(this.form.fi, 'showStorage', v)
      }
      const decoratorKey = this.decorator?.storage?.[0] || 'systemDiskStorage'
      if (!v) {
        this.setFormDiskFields({ [decoratorKey]: undefined })
        if (this.form.fd && Object.prototype.hasOwnProperty.call(this.form.fd, decoratorKey)) {
          this.$delete(this.form.fd, decoratorKey)
        }
        // 用户关闭后不再用 stash 保留该项
        if (this._sysDiskLocalFullDraft) {
          delete this._sysDiskLocalFullDraft[decoratorKey]
          delete this._sysDiskLocalFullDraft.systemDiskStorage
        }
        if (this._sysDiskGatedApplied) delete this._sysDiskGatedApplied.showStorage
      } else if (this.isSysDiskDraftFromLocal()) {
        this.$nextTick(() => this.applySysDiskGatedOptionalFromDraft('showStorage'))
      }
    },
    onDiskOptionalChange ({ flag, show }) {
      if (show && this._pendingSessionDiskDraft && !this.isSysDiskDraftFromLocal()) {
        this.$nextTick(() => this.tryApplySessionDiskDraft())
      }
      if (show && this.isSysDiskDraftFromLocal()) {
        this.$nextTick(() => this.applySysDiskGatedOptionalFromDraft(flag))
      }
      if (show || this.sysDiskDraftRestoring || this.form?.fi?.diskDraftRestoring) return
      // 关闭子项：同步清掉 stash
      if (!show && flag && this._sysDiskLocalFullDraft) {
        if (flag === 'showSchedtag') {
          const sk = this.decorator.schedtag?.[0]
          const pk = this.decorator.policy?.[0]
          if (sk) delete this._sysDiskLocalFullDraft[sk]
          if (pk) delete this._sysDiskLocalFullDraft[pk]
          delete this._sysDiskLocalFullDraft.systemDiskSchedtag
          delete this._sysDiskLocalFullDraft.systemDiskPolicy
        } else if (flag === 'showSnapshot') {
          const key = this.decorator.snapshot?.[0]
          if (key) delete this._sysDiskLocalFullDraft[key]
          delete this._sysDiskLocalFullDraft.systemDiskSnapshot
        } else if (flag === 'showPreallocation') {
          const key = this.decorator.preallocation?.[0]
          if (key) delete this._sysDiskLocalFullDraft[key]
          delete this._sysDiskLocalFullDraft.systemDiskPreallocation
        }
        if (this._sysDiskGatedApplied) delete this._sysDiskGatedApplied[flag]
      }
    },
    setDiskMedium (v) {
      if (this.form.fi) {
        this.$set(this.form.fi, 'systemDiskMedium', _.get(this.typesMap, `[${v.key}].medium`))
      }
    },
  },
}
</script>
