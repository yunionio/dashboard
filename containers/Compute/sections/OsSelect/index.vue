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
      :ignore-storage="ignoreStorage"
      :prefer-draft="osSelectDraftPrefer"
      :hypervisor="hypervisor" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import storage from '@/utils/storage'
import { getComponentDraft } from '@/utils/createFormDraft'
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
    /** 传给 ImageSelect：列表就绪后再按草稿选 os/image */
    osSelectDraftPrefer () {
      if (!this.canReadWriteFormFieldDraft()) return null
      const draft = this.readFormFieldDraft()
      if (!draft || typeof draft !== 'object') return null
      return draft
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
    hypervisor () {
      this.lockDraftImageTypeFromStorage()
      const draft = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
      const prefer = this._lockedDraftImageType || draft?.imageType || this.form.fd?.imageType || this.decorator.imageType[1].initialValue
      const availableKeys = this.mirrorTypeOptions.map(item => item.key)
      // 草稿 imageType 尚未出现在 opts（如 kvm 未就绪）时，不要回落 standard 污染展示/后续逻辑
      if (this._lockedDraftImageType && !availableKeys.includes(this._lockedDraftImageType)) return
      // CAS/UIS/SangFor 等仅支持 private_iso，不能继续沿用私有云默认的 private
      const imageType = availableKeys.includes(prefer) ? prefer : (availableKeys[0] || prefer)
      this.applyImageTypeValue(imageType)
    },
    'form.fd.image.key': {
      handler () {
        const lastSelectedImageInfo = this.ignoreStorage ? {} : (storage.get('oc_selected_image') || {})
        const { imageType = lastSelectedImageInfo.imageType } = this.$route.query
        if (this.isFirstLoad && imageType) {
          // 有控件草稿时不要被 query/storage 盖掉
          this.lockDraftImageTypeFromStorage()
          if (this._lockedDraftImageType) return
          setTimeout(() => {
            this.applyImageTypeValue(imageType)
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
     * 首屏 ImageSelect 默认 standard 拉镜像后会 persist；
     * 挂载时锁定 storage 里的 imageType，避免被写成 standard。
     */
    lockDraftImageTypeFromStorage () {
      if (!this.formDraftKey || this._lockedDraftImageType) return
      const scope = this.resolveFormDraftScope?.()
      if (!scope) return
      const draft = getComponentDraft(scope, this.formDraftKey)
      if (draft?.imageType) {
        this._lockedDraftImageType = draft.imageType
      }
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
      if (this.isFirstLoad && this._lockedDraftImageType) {
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
      this._lockedDraftImageType = e.target.value
      this.applyImageTypeValue(e.target.value)
      this.$emit('update:imageType', e.target.value)
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
    updateImageMsg (...ret) {
      const image = ret[0].imageMsg
      if (!this.ignoreStorage && image?.properties) {
        const lastSelectedImageInfo = storage.get('oc_selected_image') || {}
        let os_distribution = image.properties.os_distribution
        const os_type = image.properties.os_type
        if (os_distribution) {
          os_distribution = os_distribution.includes('Windows') ? 'Windows' : os_distribution
          storage.set('oc_selected_image', { ...lastSelectedImageInfo, imageOs: os_distribution, imageId: image.id })
        } else if (os_type) {
          storage.set('oc_selected_image', { ...lastSelectedImageInfo, imageOs: os_type, imageId: image.id })
        }
      }
      this.$emit('updateImageMsg', ...ret)
      // 镜像类型尚未对齐草稿前不写，避免 standard 污染（snapshot 也会保护 imageType）
      if (this.isFirstLoad && this._lockedDraftImageType && this.imageType !== this._lockedDraftImageType) {
        return
      }
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
  },
}
</script>
