<template>
  <a-select label-in-value :value="value" :loading="loading" @change="imageChange" :filterOption="filterOption" :showSearch="true" option-filter-prop="children" :placeholder="$t('compute.text_214')" allowClear>
    <a-select-option v-for="item in imageOptions" :key="item.id" :value="item.id">
      {{ item.name }}
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
  },
  computed: {
    imageOptions () {
      return this.imageOpts.filter((item) => { return !item.hidden })
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
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
