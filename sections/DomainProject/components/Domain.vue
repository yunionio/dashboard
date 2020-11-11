<template>
  <a-select
    :allowClear="allowClear"
    dropdownClassName="oc-select-dropdown"
    :value="valueC"
    :loading="loading"
    :placeholder="$t('rules.domain')"
    @change="change"
    :filterOption="filterOption"
    showSearch>
    <a-select-option v-for="item of options" :value="item.key" :key="item.key">
      <span class="text-color-secondary option-prefix">{{ $t('dictionary.domain') }}: </span>{{ item.label }}
    </a-select-option>
  </a-select>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'DomainProjectDomain',
  props: ['allowClear', 'labelInValue', 'value', 'loading', 'filterOption', 'options'],
  computed: {
    valueC () {
      if (R.is(Object, this.value)) {
        return this.value.key
      }
      return this.value
    },
  },
  methods: {
    change (value) {
      let v = value
      if (this.labelInValue) {
        v = {
          key: v,
          label: this.options.find(item => item.id === v).name,
        }
      }
      this.$emit('change', v)
    },
  },
}
</script>
