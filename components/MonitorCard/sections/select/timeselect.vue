<template>
  <a-select :value="selected" :dropdownMatchSelectWidth="false" @change="handleChange" style="padding: 2px;">
    <a-select-option v-for="m of options" :key="m.label" :value="m.value">
      {{ m.label }}
    </a-select-option>
  </a-select>
</template>

<script>
import i18n from '@/locales'

const options = [
  { label: i18n.t('timeselect.hour', [1]), value: 60 },
  { label: i18n.t('timeselect.hours', [6]), value: 360 },
  { label: i18n.t('timeselect.hours', [12]), value: 12 * 60 },
  { label: i18n.t('timeselect.days', [1]), value: 24 * 60 },
  { label: i18n.t('timeselect.days', [7]), value: 7 * 24 * 60 },
  { label: i18n.t('timeselect.days', [14]), value: 14 * 24 * 60 },
  { label: i18n.t('timeselect.months', [1]), value: 30 * 24 * 60 },
  { label: i18n.t('timeselect.months', [3]), value: 90 * 24 * 60 },
  { label: i18n.t('timeselect.months', [6]), value: 180 * 24 * 60 },
  { label: i18n.t('timeselect.year', [1]), value: 365 * 24 * 60 },
  { label: i18n.t('timeselect.year', [3]), value: 3 * 365 * 24 * 60 },
]

export default {
  name: 'TimeSelect',
  props: {
    value: {
      type: Number, // minutes
    },
  },
  data () {
    const selected = this.value || 7 * 24 * 60
    return {
      selected: selected,
      options: options,
    }
  },
  watch: {
    value (v = '') {
      this.selected = v || 7 * 24 * 60
    },
  },
  methods: {
    handleChange (v) {
      this.$emit('change', v)
    },
    parseTimeRange (v) {
      const to = new Date()
      const from = new Date(to - v * 60 * 1000)
      return { from: from, to: to, value: v }
    },
  },
}
</script>
