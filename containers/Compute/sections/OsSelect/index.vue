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
      :edit="edit" />
  </div>
</template>

<script>
import * as R from 'ramda'
import ImageSelect from './ImageSelect'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import storage from '@/utils/storage'

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
      default: false,
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
        ret.push(IMAGES_TYPE_MAP.iso, IMAGES_TYPE_MAP.host, IMAGES_TYPE_MAP.snapshot)
      } else if (this.hypervisor === HYPERVISORS_MAP.esxi.key) {
        ret.unshift(IMAGES_TYPE_MAP.vmware)
        ret.push(IMAGES_TYPE_MAP.iso)
        ret.push(IMAGES_TYPE_MAP.snapshot)
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
      this.imageType = this.mirrorTypeOptions[0].key
      this.form.fc.setFieldsValue({
        [this.decorator.imageType[0]]: this.mirrorTypeOptions[0].key,
      })
    },
    'form.fd.image.key': {
      handler () {
        const lastSelectedImageInfo = storage.get('oc_selected_image') || {}
        const { imageType = lastSelectedImageInfo.imageType } = this.$route.query
        if (this.isFirstLoad && imageType) {
          setTimeout(() => {
            this.form.fc.setFieldsValue({ imageType })
          }, 0)
          this.imageType = imageType
        }
      },
      immediate: true,
    },
  },
  methods: {
    imageInput (image) {
      console.log(image)
      this.$emit('change', image)
    },
    change (e) {
      this.isFirstLoad = false
      this.imageType = e.target.value
      this.$emit('update:imageType', e.target.value)
    },
    updateImageMsg (...ret) {
      const lastSelectedImageInfo = storage.get('oc_selected_image') || {}
      const image = ret[0].imageMsg

      if (image?.properties) {
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
    },
  },
}
</script>
