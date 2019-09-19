<template>
  <div class="image-select">
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorator.imageType" @change="change">
        <a-radio-button v-for="item in mirrorTypeOptions" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <image-select :image-type="imageType" :decorator="decorator" @input="imageInput" :image-params="imageSelectParams" />
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
      required: true,
    },
  },
  data () {
    return {
      imageType: IMAGES_TYPE_MAP.standard.key,
    }
  },
  computed: {
    imageSelectParams () {
      if (this.imageType === IMAGES_TYPE_MAP.standard.key) {
        return Object.assign({}, this.imageParams, { is_standard: true })
      } else {
        return Object.assign({}, this.imageParams, { is_standard: false })
      }
    },
    mirrorTypeOptions () {
      const ret = [IMAGES_TYPE_MAP.standard, IMAGES_TYPE_MAP.customize]
      if (this.isIDC && this.fd.hypervisor === HYPERVISORS_MAP.kvm.key) {
        ret.push(IMAGES_TYPE_MAP.iso)
      } else if (this.isPublic) {
        ret.unshift(IMAGES_TYPE_MAP.publicCustomize)
        ret.unshift(IMAGES_TYPE_MAP.public)
      } else if (this.isPrivate) {
        ret.unshift(IMAGES_TYPE_MAP.private)
      }
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
