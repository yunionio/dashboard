<template>
  <a-select
    :value="value"
    @change="handleChange"
    :filterOption="filterOption"
    showSearch
    optionLabelProp="title">
    <a-select-option v-for="item of scopedUsages" :value="item.key" :key="item.key" :title="item.label">
      <div style="font-size: 14px;">{{ item.label }}</div>
      <div class="text-color-help">{{ item.key }}</div>
    </a-select-option>
  </a-select>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'DashboardUsageSelect',
  props: {
    usages: {
      type: Array,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  computed: {
    scopedUsages () {
      const ret = {}
      for (const k in this.usages) {
        if (this.usages[k].scope === this.$store.getters.scope) {
          ret[k] = this.usages[k]
        }
      }
      return ret
    },
  },
  methods: {
    filterOption (input, option) {
      const desc = _.get(option, 'componentOptions.children[1].children[0].text', '')
      return option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0 || desc.includes(input)
    },
    handleChange (val) {
      this.$emit('change', val)
      this.$emit('input', val)
    },
  },
}
</script>
