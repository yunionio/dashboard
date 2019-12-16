<template>
  <div class="image-select">
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorator.imageType" @change="change">
        <a-tooltip v-for="item in mirrorTypeOptions" :key="item.key" :title="item.tooltip" :mouseEnterDelay="0.5">
          <a-radio-button :value="item.key">{{ item.label }}</a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </a-form-item>
    <image-select
      :cloud-type="type"
      :image-type="imageType"
      :decorator="decorator"
      @input="imageInput"
      :imageParams="imageParams"
      :cacheImageParams="cacheImageParams"
      :osType="osType"
      :form="form" />
  </div>
</template>

<script>
import * as R from 'ramda'
import ImageSelect from './ImageSelect'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'OsSelect',
  components: {
    ImageSelect,
  },
  props: {
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
  },
  inject: ['form'],
  data () {
    return {
      imageType: this.decorator.imageType[1].initialValue,
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
      } else if (this.isPublic) {
        ret.unshift(IMAGES_TYPE_MAP.public_customize)
        ret.unshift(IMAGES_TYPE_MAP.public)
      } else if (this.isPrivate) {
        ret.unshift(IMAGES_TYPE_MAP.private)
      }
      ret = ret.filter((item) => {
        return !this.ignoreOptions.includes(item.key)
      })
      return ret
    },
  },
  methods: {
    imageInput (image) {
      this.$emit('change', image)
    },
    change (e) {
      this.imageType = e.target.value
    },
  },
}
</script>
