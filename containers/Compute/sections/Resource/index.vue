<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator">
      <a-radio-button
        v-for="(item, key) in resourceTypesMap"
        :value="key"
        :key="key">{{ item.label }}</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import { RESOURCE_TYPES_MAP } from '@Compute/constants'

export default {
  name: 'Resource',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
  },
  data () {
    return {
      resourceTypesMap: RESOURCE_TYPES_MAP,
    }
  },
}
</script>

<style>

</style>
