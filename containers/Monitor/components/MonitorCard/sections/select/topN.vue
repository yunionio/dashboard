<template>
  <a-select :value="selected" :dropdownMatchSelectWidth="false" @change="handleChange">
    <a-select-option v-for="m of options" :key="m.label" :value="m.value">
      {{ m.label }}
    </a-select-option>
  </a-select>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'TopNSelect',
  props: {
    value: {
      type: Number,
    },
  },
  data () {
    const options = [
      { label: 'Top 5', value: 5 },
      { label: 'Top 10', value: 10 },
      { label: 'Top 20', value: 20 },
      { label: i18n.t('monitor.text_3'), value: null },
    ]
    return {
      selected: this.value || 10,
      options: options,
    }
  },
  methods: {
    handleChange (v) {
      this.selected = v
      this.$emit('change', v)
    },
  },
}
</script>
