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
      :hypervisor="hypervisor" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import storage from '@/utils/storage'
import ImageSelect from './ImageSelect'

export default {
  name: 'OsSelect',
  components: {
    ImageSelect,
  },
  props: {
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
      const prefer = this.decorator.imageType[1].initialValue || this.mirrorTypeOptions[0]?.key
      this.applyImageTypeValue(prefer)
    },
    'form.fd.image.key': {
      handler () {
        if (!this.isFirstLoad) return
        // 重装等 edit 场景：禁止用 storage 里跨云的 imageType（如 public）覆盖当前页默认值
        // 否则会出现：类型单选空白 + 误走 cachedimages 且无 os_arch
        let prefer
        if (this.edit) {
          prefer = this.decorator.imageType?.[1]?.initialValue
        } else {
          const lastSelectedImageInfo = storage.get('oc_selected_image') || {}
          const { imageType = lastSelectedImageInfo.imageType } = this.$route.query || {}
          prefer = imageType || this.decorator.imageType?.[1]?.initialValue
        }
        if (!prefer && !this.edit) return
        this.$nextTick(() => {
          this.applyImageTypeValue(prefer)
        })
      },
      immediate: true,
    },
  },
  methods: {
    /** 仅采用当前可见且未禁用的镜像类型，避免 storage/query 污染 */
    pickValidImageType (prefer) {
      const opts = this.mirrorTypeOptions || []
      const availableKeys = opts.filter(o => o && !o.disabled).map(o => o.key)
      if (prefer && availableKeys.includes(prefer)) return prefer
      const initial = this.decorator.imageType?.[1]?.initialValue
      if (initial && availableKeys.includes(initial)) return initial
      return availableKeys[0]
    },
    applyImageTypeValue (prefer) {
      const next = this.pickValidImageType(prefer)
      if (!next) return
      this.imageType = next
      if (this.form?.fc) {
        this.form.fc.setFieldsValue({
          [this.decorator.imageType[0]]: next,
        })
      }
    },
    imageInput (image) {
      this.$emit('change', image)
    },
    change (e) {
      this.isFirstLoad = false
      this.imageType = e.target.value
      const lastSelectedImageInfo = storage.get('oc_selected_image') || {}
      storage.set('oc_selected_image', { ...lastSelectedImageInfo, imageType: e.target.value })
      this.$emit('update:imageType', e.target.value)
    },
    updateImageMsg (...ret) {
      const lastSelectedImageInfo = storage.get('oc_selected_image') || {}
      const image = ret[0].imageMsg

      if (image?.properties) {
        let os_distribution = image.properties.os_distribution
        const os_type = image.properties.os_type
        // 同步当前 imageType，避免只保留旧的跨场景类型（如 public）
        const payload = {
          ...lastSelectedImageInfo,
          imageType: this.imageType,
          imageId: image.id,
        }
        if (os_distribution) {
          os_distribution = os_distribution.includes('Windows') ? 'Windows' : os_distribution
          payload.imageOs = os_distribution
          storage.set('oc_selected_image', payload)
        } else if (os_type) {
          payload.imageOs = os_type
          storage.set('oc_selected_image', payload)
        }
      }
      this.$emit('updateImageMsg', ...ret)
    },
  },
}
</script>
