<template>
  <a-select dropdownClassName="oc-select-dropdown" :value="valueC" allow-clear @change="handleChange">
    <a-select-option v-for="item in options" :key="item.id">
      <span class="text-color-secondary option-prefix">{{ $t('dictionary.zone') }}: </span>{{ item.name }}
    </a-select-option>
  </a-select>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'CloudregionZoneZone',
  props: {
    value: {
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    valueC () {
      if (R.is(Object, this.value)) {
        return this.value.key
      }
      return undefined
    },
  },
  methods: {
    handleChange (v) {
      const label = this.options.find(val => val.id === v).name
      this.$emit('change', { key: v, label })
    },
  },
}
</script>
