<template>
  <a-select label-in-value :value="value" :loading="loading" @change="imageChange" :filterOption="filterOption" :showSearch="true" option-filter-prop="children" :placeholder="$t('compute.text_214')" allowClear>
    <a-select-option v-for="item in imageOptions" :key="item.id" :value="item.id">
      <div>
        <div>{{ item.name }}</div>
        <div class="oc-selected-display-none text-color-secondary" v-if="showExternalId && item.external_id">镜像ID: {{ item.external_id }}</div>
      </div>
      <!-- <div class="d-flex align-items-center">
        <span class="flex-fill mr-2">{{ item.name }}</span>
        <a-tag v-show="item.feData.cached" color="green">{{$t('compute.text_152')}}</a-tag>
      </div> -->
    </a-select-option>
  </a-select>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { IMAGES_TYPE_MAP } from '@/constants/compute'

export default {
  name: 'ImageSelectTemplate',
  props: {
    value: {
    },
    imageOpts: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    imageType: {
      type: String,
      required: true,
    },
  },
  computed: {
    imageOptions () {
      return this.imageOpts.filter((item) => { return !item.hidden })
    },
    showExternalId () {
      const showExternalIdList = [IMAGES_TYPE_MAP.public.key, IMAGES_TYPE_MAP.public_customize.key]
      if (showExternalIdList.includes(this.imageType)) {
        return true
      }
      return false
    },
  },
  methods: {
    imageChange (imageObj) {
      if (imageObj && R.is(Object, imageObj)) {
        if (R.is(Array, imageObj.label)) {
          const label = _.get(imageObj, 'label[0].children[0].children[0].text')
          imageObj = {
            ...imageObj,
            label,
          }
        }
      }
      this.$emit('change', imageObj)
      this.$emit('imageChange', imageObj)
    },
    filterOption (inp, option) {
      const input = inp.toLowerCase()
      const text = _.get(option.componentOptions, 'children[0].children[0].children[0].text') || ''
      const textId = _.get(option.componentOptions, 'children[0].children[1].children[0].text') || ''
      return text.toLowerCase().indexOf(input) >= 0 || textId.toLowerCase().indexOf(input) >= 0
    },
  },
}
</script>
