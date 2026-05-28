<template>
  <a-input :value="num" type="number" :min="min" @change="inputChange">
    <a-select slot="addonAfter" :value="unit" style="min-width: 72px;" @change="unitChange">
      <a-select-option v-for="item in resolvedUnitOptions" :key="item.key" :value="item.key">
        {{ item.label }}
      </a-select-option>
    </a-select>
  </a-input>
</template>

<script>
import i18n from '@/locales'

/**
 * Prometheus 风格间隔字符串，如 5m、1h（与监控 interval 一致）
 */
export function parseMonitorInterval (val) {
  const s = String(val || '').trim()
  const m = s.match(/^(\d+)([smhd])$/i)
  if (!m) {
    return { num: 5, unit: 'm' }
  }
  return { num: Math.max(1, Number(m[1])), unit: m[2].toLowerCase() }
}

export function formatMonitorInterval (num, unit) {
  return `${num}${unit}`
}

export default {
  name: 'MonitorIntervalInput',
  props: {
    value: {
      type: String,
      default: '5m',
    },
    unitOptions: {
      type: Array,
      default: () => [],
    },
    min: {
      type: Number,
      default: 1,
    },
  },
  data () {
    const parsed = parseMonitorInterval(this.value)
    return {
      num: parsed.num,
      unit: parsed.unit,
    }
  },
  computed: {
    resolvedUnitOptions () {
      if (this.unitOptions && this.unitOptions.length) {
        return this.unitOptions
      }
      return [
        { key: 'm', label: i18n.t('subDurations.minutes') },
        { key: 'h', label: i18n.t('subDurations.hours') },
      ]
    },
  },
  watch: {
    value (val) {
      const parsed = parseMonitorInterval(val)
      this.num = parsed.num
      this.unit = parsed.unit
    },
  },
  methods: {
    unitChange (val) {
      this.unit = val
      this.emit()
    },
    inputChange (e) {
      const val = Number(e.target.value)
      this.num = Number.isFinite(val) && val >= this.min ? Math.floor(val) : this.min
      this.emit()
    },
    emit () {
      const v = formatMonitorInterval(this.num, this.unit)
      this.$emit('change', v)
      this.$emit('input', v)
    },
  },
}
</script>
