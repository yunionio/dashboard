<template>
  <a-select label-in-value :value="value" :loading="loading" @change="imageChange">
    <a-select-option v-for="item in imageOpts" :key="item.id" :value="item.id">
      <div class="d-flex align-items-center">
        <span class="flex-fill mr-2">{{ item.name }}</span>
        <a-tag v-show="item.feData.cached" color="green">已缓存</a-tag>
      </div>
    </a-select-option>
  </a-select>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'

export default {
  name: 'ImageSelectTemplate',
  props: {
    value: {
      type: Object,
    },
    imageOpts: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
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
        this.$emit('change', imageObj)
        this.$emit('imageChange', imageObj)
      }
    },
  },
}
</script>
