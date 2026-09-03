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

import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import { pickFields } from '@/utils/createFormDraft'

// 磁盘最小值
const DISK_MIN_SIZE = 10
export default {
  name: 'dataDisk',
  components: {
    Disk,
  },
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
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
      diskDraftRestoring: false,
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
    typesMap: {
      immediate: true,
      handler (v, oldV) {
        // opts 就绪：自管草稿回填（不再依赖 mixin mounted）
        if (v && !R.isEmpty(v) && this.canRestoreFormFieldDraft()) {
          this.$nextTick(() => {
            const draft = this.sanitizeDraftForRestore(this.readFormFieldDraft())
            if (draft && Object.keys(draft).length) {
              this.applyCreateFormFieldDraft(draft)
            }
          })
        }
        if (oldV !== undefined && !R.equals(v, oldV)) {
          // 工单/控件草稿回填期间：typesMap 就绪后校正已占位的磁盘类型，禁止清空数据盘
          if (this.isInitForm || this.diskDraftRestoring) {
            if (v && !R.isEmpty(v) && this.dataDisks && this.dataDisks.length) {
              this.dataDisks.forEach((disk, index) => {
                const curKey = disk.diskType && disk.diskType.key
                let typeObj = curKey ? v[curKey] : null
                if (curKey && !typeObj) {
                  const backend = String(curKey).split('/')[0]
                  const matched = Object.keys(v).find(k => k === backend || k.startsWith(`${backend}/`))
                  if (matched) typeObj = v[matched]
                }
                // 类型当前不可用：回退首个可用类型，避免留下无效草稿类型
                if (!typeObj) {
                  const firstKey = Object.keys(v)[0]
                  if (!firstKey) return
                  typeObj = v[firstKey]
                }
                disk.diskType = {
                  key: typeObj.key,
                  label: typeObj.label,
                  index: disk.diskType?.index ?? index,
                }
                const sizeKey = this._fp('Sizes', disk.key)
                const curSize = this.form.fc.getFieldValue(sizeKey)
                const min = this.min(index)
                const max = this.max(index)
                const sizeSource = (curSize == null || curSize === '') ? (min || DISK_MIN_SIZE) : curSize
                const nextSize = this.clampDataDiskDraftSize(sizeSource, min, max)
                const patch = {
                  [this._fp('Types', disk.key)]: disk.diskType,
                  [sizeKey]: nextSize,
                }
                this.form.fc.setFieldsValue(patch)
              })
              // typesMap 就绪后再写一遍草稿字段（盖住异步默认值），并做合法夹取；size/iops/throughput 为输入字段不回填
              if (this.diskDraftRestoring) {
                const draft = this.sanitizeDraftForRestore(this.readFormFieldDraft())
                if (draft) this.$nextTick(() => this.applyDataDiskDraftFields(draft))
              }
            }
            return
          }
          if (this.dataDisks && this.dataDisks.length) {
            this.dataDisks.forEach((disk, index) => {
              this.form.fc.setFieldsValue({
                [this._fp('Sizes', disk.key)]: Math.max((disk.value || 0), this.min(index)),
              })
              if (!disk.disabled) this.decrease(disk.key)
            })
          }
        }
      },
    },
    defaultType (v, oldV) {
      // vmware系统盘改变清空数据盘，忽略调整配置初始化的情况
      if (this.isInitForm || this.diskDraftRestoring) return
      if (this.getHypervisor() === HYPERVISORS_MAP.esxi.key && oldV && oldV.label) {
        this.dataDisks = []
      }
    },
  },
  methods: {
    // 由 typesMap watch 自管回填；保留方法供页面编排兼容调用
    restoreFormFieldDraftFields () {
      if (!this.canRestoreFormFieldDraft()) return false
      if (typeof this.isCreateFormFieldTouched === 'function' && this.isCreateFormFieldTouched(this.resolveFormDraftKey())) return false
      if (!this.typesMap || R.isEmpty(this.typesMap)) return false
      const draft = this.sanitizeDraftForRestore(this.readFormFieldDraft())
      if (!draft || !Object.keys(draft).length) return false
      this.applyCreateFormFieldDraft(draft)
      return true
    },
    /**
     * 回填白名单：仅保留结构 + 选择型子字段（类型/调度标签/策略/快照/存储/文件系统/自动重置/预分配），
     * 输入子字段（大小/iops/吞吐/挂载路径）不回填，交由组件默认值
     */
    sanitizeDraftForRestore (draft) {
      if (draft == null || typeof draft !== 'object') return draft
      if (Array.isArray(this.formDraftRestoreFields) && this.formDraftRestoreFields.length) {
        return pickFields(draft, this.formDraftRestoreFields)
      }
      return this.pickDataDiskSelectionDraft(draft)
    },
    pickDataDiskSelectionDraft (draft) {
      const ret = {}
      if (Array.isArray(draft.__dataDiskKeys)) ret.__dataDiskKeys = draft.__dataDiskKeys
      const suffixes = ['Types', 'Schedtags', 'Policys', 'Snapshots', 'Storages', 'Filetypes', 'AutoReset', 'Preallocation']
      suffixes.forEach((suffix) => {
        const nested = `${this.fieldPrefix}${suffix}`
        if (draft[nested] && typeof draft[nested] === 'object') {
          ret[nested] = { ...draft[nested] }
        }
      })
      const keys = Array.isArray(draft.__dataDiskKeys)
        ? draft.__dataDiskKeys
        : Object.keys(draft[`${this.fieldPrefix}Types`] || {})
      keys.forEach((key) => {
        suffixes.forEach((suffix) => {
          const bracketKey = `${this.fieldPrefix}${suffix}[${key}]`
          if (draft[bracketKey] !== undefined) ret[bracketKey] = draft[bracketKey]
        })
      })
      return ret
    },
    /** 工单/草稿回填中：禁止把临时空盘状态写回草稿 */
    isDataDiskDraftWriteBlocked () {
      return !!(this.diskDraftRestoring || this.isInitForm || this.form?.fi?.diskDraftRestoring)
    },
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f) return undefined
      const pick = {}
      const keys = (this.dataDisks || []).map(d => d.key)
      // 显式空结构：删光数据盘后也要能落盘/清草稿，避免 undefined 跳过写入导致旧草稿残留
      if (!keys.length) {
        return { __dataDiskKeys: [] }
      }
      pick.__dataDiskKeys = keys
      const diskRefs = (() => {
        const refs = this.$refs.disks
        if (Array.isArray(refs)) return refs
        return refs ? [refs] : []
      })()
      keys.forEach((key) => {
        const diskComp = diskRefs.find(d => d && d.diskKey === key)
        const includeStorage = !diskComp || diskComp.showStorage
        const includeSchedtag = !diskComp || diskComp.showSchedtag
        const includeSnapshot = !diskComp || diskComp.showSnapshot
        const includeMount = !diskComp || diskComp.showMountpoint
        const includePreallocation = !diskComp || diskComp.showPreallocation
        const fieldKeys = [
          this._fp('Types', key),
          // Sizes / Iops / Throughputs / MountPaths 为输入字段：不写入草稿
          includeSchedtag ? this._fp('Schedtags', key) : null,
          includeSchedtag ? this._fp('Policys', key) : null,
          includeSnapshot ? this._fp('Snapshots', key) : null,
          includeStorage ? this._fp('Storages', key) : null,
          includeMount ? this._fp('Filetypes', key) : null,
          this._fp('AutoReset', key),
          includePreallocation ? this._fp('Preallocation', key) : null,
        ].filter(Boolean)
        fieldKeys.forEach((fk) => {
          const v = f.getFieldValue(fk)
          if (v !== undefined) pick[fk] = v
        })
        // diskType 兜底（form 尚未挂装饰器时）
        const disk = this.dataDisks.find(d => d.key === key)
        if (pick[this._fp('Types', key)] === undefined && disk?.diskType) {
          pick[this._fp('Types', key)] = disk.diskType
        }
      })
      // 落盘前校正类型
      keys.forEach((key, index) => {
        const typeField = this._fp('Types', key)
        if (pick[typeField] !== undefined) {
          pick[typeField] = this.resolveDataDiskTypeFromDraft(pick[typeField], index)
        }
      })
      return pick
    },
    flushFormFieldDraftOnSubmit () {
      if (this.isDataDiskDraftWriteBlocked()) return
      const data = this.serializeFormFieldDraft()
      if (data && Array.isArray(data.__dataDiskKeys) && data.__dataDiskKeys.length === 0) {
        this.clearFormFieldDraft()
        return
      }
      if (data !== undefined) {
        this.writeFormFieldDraft(data, { fromSubmit: true })
      }
    },
    applyCreateFormFieldDraft (draft, options = {}) {
      if (!draft || !this.form?.fc) return
      // 跨 tab（仅 local）：不回填数据盘；同 session 全量回填
      const fromLocal = options.fromLocal != null
        ? !!options.fromLocal
        : this.isFormFieldDraftFromLocal()
      if (fromLocal) return
      draft = this.sanitizeDraftForRestore(draft)
      if (!draft || !Object.keys(draft).length) return
      this.diskDraftRestoring = true
      if (this.form.fi) this.$set(this.form.fi, 'diskDraftRestoring', true)
      const run = () => this.applyDataDiskDraft(draft)
      this.$nextTick(run)
      // 盖住 typesMap/子组件就绪即可，勿长时间挡住系统盘默认 size
      if (this._dataDiskDraftApplyTimer) clearTimeout(this._dataDiskDraftApplyTimer)
      this._dataDiskDraftApplyTimer = setTimeout(() => {
        run()
        this.diskDraftRestoring = false
        if (this.form?.fi) this.$set(this.form.fi, 'diskDraftRestoring', false)
      }, 1100)
    },
    applyDataDiskDraft (draft) {
      if (!draft || !this.form?.fc) return
      const { __dataDiskKeys, ...rest } = draft
      // 用户删光后的空草稿：清空当前数据盘，勿 fallback 到其它残留字段
      if (Array.isArray(__dataDiskKeys) && __dataDiskKeys.length === 0) {
        this.dataDisks = []
        return
      }
      const keys = Array.isArray(__dataDiskKeys) && __dataDiskKeys.length
        ? __dataDiskKeys
        : Object.keys(rest.dataDiskSizes || {}).concat(
          Object.keys(rest).filter(k => k.startsWith('dataDiskSizes[')).map(k => {
            const m = k.match(/dataDiskSizes\[(.+)\]/)
            return m && m[1]
          }).filter(Boolean),
        )
      const uniqKeys = [...new Set(keys)].filter(Boolean)
      if (uniqKeys.length) {
        this.dataDisks = uniqKeys.map((key, idx) => {
          let typeVal = rest[this._fp('Types', key)] ||
            rest.dataDiskTypes?.[key] ||
            { key: '', label: '', index: idx }
          typeVal = this.resolveDataDiskTypeFromDraft(typeVal, idx)
          return {
            key,
            diskType: typeVal,
            iops: rest[this._fp('Iops', key)] ?? rest.dataDiskIops?.[key],
            throughput: rest[this._fp('Throughputs', key)] ?? rest.dataDiskThroughputs?.[key],
          }
        })
      }
      this.$nextTick(() => this.applyDataDiskDraftFields(draft))
    },
    resolveDataDiskTypeFromDraft (typeVal, index = 0) {
      const cur = typeVal && typeof typeVal === 'object' ? { ...typeVal, index: typeVal.index ?? index } : { key: '', label: '', index }
      if (!this.typesMap || R.isEmpty(this.typesMap)) return cur
      if (cur.key && this.typesMap[cur.key]) {
        return { key: cur.key, label: this.typesMap[cur.key].label || cur.label, index: cur.index }
      }
      if (cur.key) {
        const backend = String(cur.key).split('/')[0]
        const matched = Object.keys(this.typesMap).find(k => k === backend || k.startsWith(`${backend}/`))
        if (matched) {
          return { key: matched, label: this.typesMap[matched].label, index: cur.index }
        }
      }
      const firstKey = Object.keys(this.typesMap)[0]
      if (!firstKey) return cur
      return { key: firstKey, label: this.typesMap[firstKey].label, index: cur.index }
    },
    syncDataDiskFieldsToFd (flat) {
      if (!this.form?.fd || !flat || typeof flat !== 'object') return
      Object.keys(flat).forEach((key) => {
        this.$set(this.form.fd, key, flat[key])
      })
      const formValue = this.form.fc?.getFieldsValue?.() || {}
      if (formValue.dataDiskSizes) {
        this.$set(this.form.fd, 'dataDiskSizes', formValue.dataDiskSizes)
      }
      if (formValue.dataDiskTypes) {
        this.$set(this.form.fd, 'dataDiskTypes', formValue.dataDiskTypes)
      }
    },
    clampDataDiskDraftSize (sizeVal, min, max) {
      if (sizeVal == null || sizeVal === '') return sizeVal
      let size = Number(sizeVal)
      if (Number.isNaN(size)) return sizeVal
      const lo = min || DISK_MIN_SIZE
      const hi = max || Infinity
      if (size < lo) size = lo
      if (Number.isFinite(hi) && size > hi) size = hi
      return size
    },
    applyDataDiskDraftFields (draft) {
      if (!draft || !this.form?.fc) return
      const { __dataDiskKeys, ...rest } = draft
      const flat = { ...rest }
      // 嵌套结构展平，供 setFieldsValue
      ;['dataDiskSizes', 'dataDiskTypes', 'dataDiskSchedtags', 'dataDiskPolicys', 'dataDiskSnapshots', 'dataDiskStorages', 'dataDiskIops', 'dataDiskThroughputs', 'dataDiskFiletypes', 'dataDiskMountPaths', 'dataDiskAutoReset', 'dataDiskPreallocation'].forEach((prefix) => {
        const obj = rest[prefix]
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          Object.keys(obj).forEach((key) => {
            flat[`${prefix}[${key}]`] = obj[key]
          })
        }
      })
      delete flat.dataDiskSizes
      delete flat.dataDiskTypes
      delete flat.dataDiskSchedtags
      delete flat.dataDiskPolicys
      delete flat.dataDiskSnapshots
      delete flat.dataDiskStorages
      delete flat.dataDiskIops
      delete flat.dataDiskThroughputs
      delete flat.dataDiskFiletypes
      delete flat.dataDiskMountPaths
      delete flat.dataDiskAutoReset
      delete flat.dataDiskPreallocation
      // 对照当前 typesMap / min-max，保证回填合法；大小为输入字段不回填草稿，缺省时补默认 min
      ;(this.dataDisks || []).forEach((disk, index) => {
        const typeField = this._fp('Types', disk.key)
        const sizeField = this._fp('Sizes', disk.key)
        const resolvedType = this.resolveDataDiskTypeFromDraft(
          flat[typeField] || disk.diskType,
          index,
        )
        disk.diskType = resolvedType
        flat[typeField] = resolvedType
        const rawSize = flat[sizeField] != null ? flat[sizeField] : this.form.fc.getFieldValue(sizeField)
        const minSize = this.min(index) || DISK_MIN_SIZE
        const sizeSource = (rawSize == null || rawSize === '') ? minSize : rawSize
        flat[sizeField] = this.clampDataDiskDraftSize(sizeSource, minSize, this.max(index))
      })
      if (Object.keys(flat).length) {
        this.form.fc.setFieldsValue(flat)
        this.syncDataDiskFieldsToFd(flat)
      }
      // session 草稿（同 tab）完全恢复：打开高级并回填高级项
      this.$nextTick(() => {
        const refs = this.$refs.disks
        const diskRefs = Array.isArray(refs) ? refs : (refs ? [refs] : [])
        diskRefs.forEach((disk, i) => {
          const key = this.dataDisks[i]?.key
          if (!disk || !key) return
          const hasAdv = !!(
            flat[this._fp('Schedtags', key)] ||
            flat[this._fp('Policys', key)] ||
            flat[this._fp('Snapshots', key)] ||
            flat[this._fp('Storages', key)] ||
            flat[this._fp('Iops', key)] ||
            flat[this._fp('Throughputs', key)] ||
            flat[this._fp('Filetypes', key)] ||
            flat[this._fp('MountPaths', key)] ||
            flat[this._fp('AutoReset', key)] ||
            flat[this._fp('Preallocation', key)]
          )
          if (!hasAdv) return
          disk.showAdvanced = true
          if (flat[this._fp('Schedtags', key)] || flat[this._fp('Policys', key)]) disk.showSchedtag = true
          if (flat[this._fp('Snapshots', key)]) disk.showSnapshot = true
          if (flat[this._fp('Storages', key)]) disk.showStorage = true
          if (flat[this._fp('Iops', key)]) disk.showIops = true
          if (flat[this._fp('Throughputs', key)]) disk.showThroughput = true
          if (flat[this._fp('Filetypes', key)] || flat[this._fp('MountPaths', key)]) disk.showMountpoint = true
          if (flat[this._fp('Preallocation', key)]) disk.showPreallocation = true
        })
      })
    },

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
      } else if (diskType) {
        // typesMap 尚未就绪（公有云等 sku/capability）：先按草稿 backend 占位，就绪后再校正
        dataDiskTypes = {
          key: newDiskType || diskType,
          label: newDiskType || diskType,
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
