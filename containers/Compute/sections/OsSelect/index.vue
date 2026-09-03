<template>
  <div class="image-select">
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorator.imageType" @change="change">
        <a-tooltip v-for="item in mirrorTypeOptions" :key="item.key" :title="item.tooltip" :mouseEnterDelay="0.5">
          <a-radio-button :value="item.key" :disabled="item.disabled">{{ item.label }}</a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </a-form-item>
    <image-select
      :cloud-type="type"
      :uefi="uefi"
      :vgaPci="vgaPci"
      :image-type="imageType"
      :decorator="decorator"
      @input="imageInput"
      @updateImageMsg="updateImageMsg"
      :imageParams="imageParams"
      :cacheImageParams="cacheImageParams"
      :osType="osType"
      :osArch="osArch"
      :cloudproviderParamsExtra="cloudproviderParamsExtra"
      :cloudaccountId="cloudaccountId"
      :imageCloudproviderDisabled="imageCloudproviderDisabled"
      :sys-disk-size="sysDiskSize"
      :form="form"
      :edit="edit"
      :ignore-storage="effectiveIgnoreStorage"
      :prefer-draft="osSelectDraftPrefer"
      :hypervisor="hypervisor" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import storage from '@/utils/storage'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import ImageSelect from './ImageSelect'

export default {
  name: 'OsSelect',
  components: {
    ImageSelect,
  },
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    /** selection：radio/单选 select/switch 类，local + session 双写、可跨 tab 回填 */
    formDraftKind: {
      type: String,
      default: 'selection',
    },
    types: {
      type: Array,
    },
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.imageType) && R.is(Array, val.os) && R.is(Array, val.image),
    },
    imageParams: {
      type: Object,
    },
    cacheImageParams: {
      type: Object,
    },
    type: {
      type: String,
      validator: val => ['public', 'private', 'idc', 'baremetal'].includes(val),
      required: true,
    },
    hypervisor: {
      type: String,
    },
    ignoreOptions: {
      type: Array,
      default: () => [],
    },
    osType: {
      type: String,
    },
    osArch: {
      type: String,
    },
    uefi: {
      type: Boolean,
      required: false,
    },
    vgaPci: {
      type: Boolean,
      required: false,
    },
    cloudproviderParamsExtra: {
      type: Object,
      default: () => ({}),
    },
    imageCloudproviderDisabled: {
      type: Boolean,
      default: false,
    },
    cloudaccountId: {
      type: String,
    },
    form: {
      type: Object,
      required: true,
    },
    sysDiskSize: {
      type: Number,
    },
    imageTypeMap: {
      type: Object,
      default: () => ({}),
    },
    edit: {
      type: Boolean,
      default: false,
    },
    ignoreStorage: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      imageType: this.decorator.imageType[1].initialValue,
      isFirstLoad: true,
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
    isBaremetal () {
      return this.type === 'baremetal'
    },
    /**
     * 回填优先级（互斥）：
     * 1) query / 工单修改 → 只跟 query、工单
     * 2) 否则有草稿 → 只跟草稿
     * 3) 否则 → 只跟 storage
     */
    hasOsQueryPrefer () {
      const q = this.$route?.query || {}
      return !!(q.imageType || q.imageOs || q.imageId)
    },
    hasOsWorkflowPrefer () {
      if (this.ignoreStorage || this.edit) return true
      const osInit = this.decorator?.os?.[1]?.initialValue
      const imageInit = this.decorator?.image?.[1]?.initialValue
      return !!(osInit && imageInit)
    },
    hasOsDraftPrefer () {
      if (this.hasOsQueryPrefer || this.hasOsWorkflowPrefer) return false
      if (!this.canRestoreFormFieldDraft()) return false
      const draft = this.readFormFieldDraft()
      if (!draft || typeof draft !== 'object') return false
      return !!(draft.imageType || draft.os || draft.image)
    },
    shouldRestoreOsFromStorage () {
      if (this.ignoreStorage) return false
      if (this.hasOsQueryPrefer || this.hasOsWorkflowPrefer || this.hasOsDraftPrefer) return false
      return true
    },
    /** query / 工单 / 草稿控制时不读 storage，避免双源抢填 */
    effectiveIgnoreStorage () {
      return this.ignoreStorage || this.hasOsQueryPrefer || this.hasOsWorkflowPrefer || this.hasOsDraftPrefer
    },
    /** 传给 ImageSelect：仅草稿独占时回填 os/image */
    osSelectDraftPrefer () {
      if (!this.hasOsDraftPrefer) return null
      const draft = this.readFormFieldDraft()
      return draft && typeof draft === 'object' ? draft : null
    },
    mirrorTypeOptions () {
      let ret = [IMAGES_TYPE_MAP.standard, IMAGES_TYPE_MAP.customize]
      if (this.isIDC && this.hypervisor === HYPERVISORS_MAP.kvm.key) {
        ret.push(IMAGES_TYPE_MAP.iso, IMAGES_TYPE_MAP.host, { ...IMAGES_TYPE_MAP.snapshot, label: this.$t(IMAGES_TYPE_MAP.snapshot.t) }, IMAGES_TYPE_MAP.backup)
      } else if (this.hypervisor === HYPERVISORS_MAP.esxi.key) {
        ret.unshift(IMAGES_TYPE_MAP.vmware)
        ret.push(IMAGES_TYPE_MAP.iso)
        ret.push({ ...IMAGES_TYPE_MAP.snapshot, label: this.$t(IMAGES_TYPE_MAP.snapshot.t) })
      } else if (this.hypervisor === HYPERVISORS_MAP.proxmox.key) {
        ret.push(IMAGES_TYPE_MAP.private, IMAGES_TYPE_MAP.iso)
      } else if (this.hypervisor === HYPERVISORS_MAP.uis.key) {
        ret = [IMAGES_TYPE_MAP.private_iso]
      } else if (this.hypervisor === HYPERVISORS_MAP.cas.key) {
        ret = [IMAGES_TYPE_MAP.private_iso]
      } else if (this.hypervisor === HYPERVISORS_MAP.sangfor.key) {
        ret = [IMAGES_TYPE_MAP.private_iso]
      } else if (this.isPublic) {
        ret.unshift(IMAGES_TYPE_MAP.public_customize)
        ret.unshift(IMAGES_TYPE_MAP.public)
      } else if (this.isPrivate) {
        ret.unshift(IMAGES_TYPE_MAP.private)
      } else if (this.isBaremetal) {
        ret.push(IMAGES_TYPE_MAP.iso)
      }
      ret = ret.filter((item) => {
        return !this.ignoreOptions.includes(item.key)
      })
      if (this.types && !R.isEmpty(this.types)) {
        ret = ret.filter(({ key }) => {
          return this.types.indexOf(key) > -1
        })
      }
      if (!R.isEmpty(this.imageTypeMap)) {
        ret = ret.map(val => {
          const imageTypeMapItem = this.imageTypeMap[val.key] // 如果传了外部的 imageTypeMap，采用外部
          if (R.is(Object, imageTypeMapItem)) {
            return { ...val, ...imageTypeMapItem }
          }
          return val
        })
      }
      return ret
    },
  },
  watch: {
    mirrorTypeOptions: {
      immediate: true,
      handler () {
        // query / 工单独占时不回填草稿
        if (this.hasOsQueryPrefer || this.hasOsWorkflowPrefer) return
        this.$nextTick(() => this.restoreFormFieldDraftFields())
      },
    },
    hypervisor () {
      this.lockDraftImageTypeFromStorage()
      const prefer = this.resolveImageTypePrefer()
      const availableKeys = this.mirrorTypeOptions.map(item => item.key)
      // 草稿 imageType 尚未出现在 opts（如 kvm 未就绪）时，不要回落 standard 污染展示/后续逻辑
      if (this.hasOsDraftPrefer && this._lockedDraftImageType && !availableKeys.includes(this._lockedDraftImageType)) return
      // CAS/UIS/SangFor 等仅支持 private_iso，不能继续沿用私有云默认的 private
      const imageType = availableKeys.includes(prefer) ? prefer : (availableKeys[0] || prefer)
      this.applyImageTypeValue(imageType)
    },
    'form.fd.image.key': {
      handler () {
        // query 独占：首屏按 query.imageType 回填，不看草稿 / storage
        const queryImageType = this.$route?.query?.imageType
        if (this.isFirstLoad && queryImageType) {
          setTimeout(() => {
            this.applyImageTypeValue(queryImageType)
          }, 0)
        }
      },
      immediate: true,
    },
  },
  created () {
    this.lockDraftImageTypeFromStorage()
  },
  methods: {
    /**
     * 解析 imageType 偏好（与 os/image 同源互斥）
     */
    resolveImageTypePrefer () {
      const q = this.$route?.query || {}
      if (q.imageType) return q.imageType
      if (this.hasOsWorkflowPrefer) {
        return this.form.fd?.imageType || this.decorator.imageType[1].initialValue
      }
      if (this.hasOsDraftPrefer) {
        const draft = this.readFormFieldDraft()
        return this._lockedDraftImageType || draft?.imageType || this.decorator.imageType[1].initialValue
      }
      if (this.shouldRestoreOsFromStorage) {
        const last = storage.get('oc_selected_image') || {}
        return last.imageType || this.form.fd?.imageType || this.decorator.imageType[1].initialValue
      }
      return this.form.fd?.imageType || this.decorator.imageType[1].initialValue
    },
    /**
     * 首屏 ImageSelect 默认 standard 拉镜像后会 persist；
     * 仅草稿独占时锁定草稿 imageType，避免被写成 standard。
     */
    lockDraftImageTypeFromStorage () {
      if (!this.formDraftKey || this._lockedDraftImageType) return
      if (!this.hasOsDraftPrefer) return
      const draft = this.readFormFieldDraft()
      if (draft?.imageType) {
        this._lockedDraftImageType = draft.imageType
      }
    },
    /** 合并写入 oc_selected_image（修改即记录） */
    persistSelectedImage (patch) {
      if (this.ignoreStorage || !patch || typeof patch !== 'object') return
      const last = storage.get('oc_selected_image') || {}
      storage.set('oc_selected_image', { ...last, ...patch })
    },
    /** 写 fc，并同步 fd/fi（setFieldsValue 不走 onValuesChange） */
    applyImageTypeValue (imageType) {
      if (!imageType || !this.form?.fc) return
      const field = this.decorator.imageType[0]
      this.imageType = imageType
      this.form.fc.setFieldsValue({ [field]: imageType })
      if (this.form.fd) {
        this.$set(this.form.fd, 'imageType', imageType)
      }
      if (this.form.fi) {
        this.$set(this.form.fi, 'imageType', imageType)
      }
    },
    getCreateFormFieldDraftSnapshot () {
      this.lockDraftImageTypeFromStorage()
      const f = this.form?.fc
      if (!f) return undefined
      let imageType = f.getFieldValue(this.decorator.imageType[0])
      // 用户未改镜像类型前：禁止用当前 UI（常为 standard）覆盖草稿
      if (this.isFirstLoad && this.hasOsDraftPrefer && this._lockedDraftImageType) {
        imageType = this._lockedDraftImageType
      }
      const os = f.getFieldValue(this.decorator.os[0])
      const image = f.getFieldValue(this.decorator.image[0])
      return {
        imageType,
        os,
        image: image && typeof image === 'object' ? { key: image.key, label: image.label } : image,
      }
    },
    applyCreateFormFieldDraft (draft) {
      // query / 工单独占时不应用草稿
      if (this.hasOsQueryPrefer || this.hasOsWorkflowPrefer) return
      if (!draft || !this.form?.fc) return
      if (draft.imageType && !this._lockedDraftImageType) {
        this._lockedDraftImageType = draft.imageType
      }
      // 仅先恢复镜像类型；os/image 等 ImageSelect 列表就绪后按 preferDraft 回填
      if (draft.imageType) {
        const available = this.mirrorTypeOptions.map(item => item.key)
        if (!available.length || available.includes(draft.imageType)) {
          this.applyImageTypeValue(draft.imageType)
        }
      }
    },

    imageInput (image) {
      this.$emit('change', image)
    },
    change (e) {
      this.isFirstLoad = false
      const imageType = e.target.value
      this._lockedDraftImageType = imageType
      this.applyImageTypeValue(imageType)
      this.$emit('update:imageType', imageType)
      // 切类型即写 imageType；自动选中的镜像由 updateImageMsg 补写 os/id
      this.persistSelectedImage({ imageType })
    },
    updateImageMsg (...ret) {
      const { imageMsg: image, isAuto } = ret[0] || {}
      // 首屏自动选中不写，避免默认 standard 覆盖历史；用户切类型后 isFirstLoad=false 可写
      const skipStorageWrite = isAuto && this.isFirstLoad
      if (!skipStorageWrite && !this.ignoreStorage && image?.properties) {
        const os_distribution = image.properties.os_distribution
        const os_type = image.properties.os_type
        const patch = { imageType: this.imageType, imageId: image.id }
        if (os_distribution) {
          patch.imageOs = os_distribution.includes('Windows') ? 'Windows' : os_distribution
        } else if (os_type) {
          patch.imageOs = os_type
        }
        if (patch.imageOs) {
          this.persistSelectedImage(patch)
        }
      }
      this.$emit('updateImageMsg', ...ret)
    },
  },
}
</script>
