<template>
  <a-steps :current="value.currentStep" :style="{ width: `${value.steps.length * 300}px` }">
    <a-step v-for="(item, idx) in value.steps" :title="item.title" :key="idx" @click="stepItemClick(idx, item)">
      <a-icon v-if="item.iconType" :type="item.iconType" slot="icon" />
      <span v-if="item.description" slot="description">{{ item.description }}</span>
    </a-step>
  </a-steps>
</template>
<script>
import * as R from 'ramda'

export default {
  name: 'Steps',
  props: {
    value: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.steps) && R.is(Number, val.currentStep),
    },
  },
  methods: {
    stepItemClick (idx, item) {
      this.$emit('stepClick', idx, item)
    },
  },
}
</script>
