<template>
  <a-select
    dropdownClassName="oc-select-dropdown"
    allow-clear
    showSearch
    :value="valueC"
    :filterOption="filterOption"
    :disabled="disabledRegion"
    @change="handleChange">
    <a-select-option v-for="item in options" :key="item.id">
      <span class="text-color-secondary option-prefix">{{ $t('dictionary.region') }}: </span>{{ _$t(item) }}
    </a-select-option>
  </a-select>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'CloudregionZoneCloudregion',
  props: {
    value: {
    },
    options: {
      type: Array,
      default: () => [],
    },
    disabledRegion: Boolean,
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
      const opt = this.options.find(val => val.id === v)
      const label = opt ? opt.name : ''
      this.$emit('change', { key: v, label })
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[1].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
