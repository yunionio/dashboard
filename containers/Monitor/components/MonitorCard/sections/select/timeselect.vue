<template>
  <div>
    <div v-if="isRadioGroup">
      <a-radio-group class="mr-3" v-model="selected" @change="handleChange">
        <a-radio-button v-for="m of options" :key="m.label" :value="m.value">
          {{ m.label }}
        </a-radio-button>
      </a-radio-group>
    </div>
    <div v-else>
      <a-select :value="selected" :dropdownMatchSelectWidth="false" @change="handleChange">
        <a-select-option v-for="m of options" :key="m.label" :value="m.value">
          {{ m.label }}
        </a-select-option>
      </a-select>
    </div>
  </div>
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
  { label: i18n.t('common.last_month'), value: 'last_month' },
]

export default {
  name: 'TimeSelect',
  props: {
    defaultValue: {
      type: Number,
      default: 7 * 24 * 60,
    },
    value: {
      type: Number, // minutes
    },
    isRadioGroup: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const selected = this.value || this.defaultValue
    return {
      selected: selected,
      options: options,
    }
  },
  watch: {
    value (v = '') {
      this.selected = v || this.defaultValue
    },
  },
  methods: {
    handleChange (v) {
      if (this.isRadioGroup) {
        this.$emit('change', v.target.value)
      } else {
        this.$emit('change', v)
      }
    },
    parseTimeRange (v) {
      if (v === 'last_month') {
        const now = this.$moment()
        const lastMonthStart = this.$moment().subtract(1, 'month').startOf('month') // 上个月1号0点
        const lastMonthEnd = this.$moment().subtract(1, 'month').endOf('month') // 上个月最后一天最后一刻
        const fromHours = now.diff(lastMonthStart, 'hours')
        const toHours = now.diff(lastMonthEnd, 'hours')
        return { from: fromHours, to: toHours, value: v }
      }
      const to = new Date()
      const from = new Date(to - v * 60 * 1000)
      return { from: from, to: to, value: v }
    },
  },
}
</script>
