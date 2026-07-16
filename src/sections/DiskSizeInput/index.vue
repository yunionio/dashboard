<template>
  <div class="disk-size-input">
    <a-input-number
      class="disk-size-input__number"
      :value="displayValue"
      :min="displayMin"
      :max="displayMax"
      :step="displayStep"
      :precision="displayPrecision"
      :disabled="disabled"
      @change="onNumberChange" />
    <a-select
      class="disk-size-input__unit ml-1"
      :value="unit"
      :disabled="disabled"
      @change="onUnitChange">
      <a-select-option v-for="u in units" :key="u" :value="u">{{ u }}</a-select-option>
    </a-select>
  </div>
</template>

<script>
const UNIT_TO_MB = {
  MB: 1,
  GB: 1024,
  TB: 1024 * 1024,
}

export default {
  name: 'DiskSizeInput',
  props: {
    value: {
      type: [Number, String],
      default: undefined,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: Infinity,
    },
    step: {
      type: Number,
      default: 10,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    units: {
      type: Array,
      default: () => (['GB', 'TB']),
    },
    // 表单实际存储的单位，默认 GB（兼容数据盘）
    valueUnit: {
      type: String,
      default: 'GB',
    },
    // 展示默认单位，不传则取 units[0]
    defaultUnit: {
      type: String,
      default: undefined,
    },
    normalizeGb: {
      type: Function,
      default: undefined,
    },
  },
  data () {
    return {
      unit: this.defaultUnit || this.units[0],
    }
  },
  computed: {
    rawValue () {
      if (this.value === '' || this.value === null || this.value === undefined) return undefined
      const n = typeof this.value === 'string' ? Number(this.value) : this.value
      return Number.isFinite(n) ? n : undefined
    },
    displayFactor () {
      return UNIT_TO_MB[this.unit] / UNIT_TO_MB[this.valueUnit]
    },
    displayValue () {
      if (this.rawValue === undefined) return undefined
      return this.rawValue / this.displayFactor
    },
    displayMin () {
      return this.min / this.displayFactor
    },
    displayMax () {
      if (this.max === Infinity) return Infinity
      return this.max / this.displayFactor
    },
    displayStep () {
      const s = this.step / this.displayFactor
      return Number.isFinite(s) && s > 0 ? s : 1
    },
    displayPrecision () {
      // 与 valueUnit 相同时取整；更大单位时允许小数以覆盖最小步进
      if (this.unit === this.valueUnit) return 0
      if (this.unit === 'TB') return 3
      if (this.unit === 'GB' && this.valueUnit === 'MB') return 3
      return 0
    },
  },
  methods: {
    emitValue (val) {
      let next = val
      if (this.normalizeGb) {
        next = this.normalizeGb(next)
      }
      // 按存储单位取整
      next = Math.round(next)
      this.$emit('change', next)
    },
    onNumberChange (v) {
      if (v === '' || v === null || v === undefined) {
        this.$emit('change', undefined)
        return
      }
      const n = Number(v)
      if (!Number.isFinite(n)) return
      this.emitValue(n * this.displayFactor)
    },
    onUnitChange (u) {
      // 切换单位时保持实际 valueUnit 值不变，只改变展示
      this.unit = u
      this.$emit('unitChange', u)
      if (this.rawValue !== undefined) {
        this.emitValue(this.rawValue)
      }
    },
  },
}
</script>

<style scoped>
.disk-size-input {
  display: inline-flex;
  align-items: center;
}
.disk-size-input__number {
  width: 120px;
}
.disk-size-input__unit {
  width: 80px;
}
</style>
