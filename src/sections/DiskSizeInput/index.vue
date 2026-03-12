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
    normalizeGb: {
      type: Function,
      default: undefined,
    },
  },
  data () {
    return {
      unit: 'GB',
    }
  },
  computed: {
    gbValue () {
      if (this.value === '' || this.value === null || this.value === undefined) return undefined
      const n = typeof this.value === 'string' ? Number(this.value) : this.value
      return Number.isFinite(n) ? n : undefined
    },
    factor () {
      return this.unit === 'TB' ? 1024 : 1
    },
    displayValue () {
      if (this.gbValue === undefined) return undefined
      return this.gbValue / this.factor
    },
    displayMin () {
      return this.min / this.factor
    },
    displayMax () {
      if (this.max === Infinity) return Infinity
      return this.max / this.factor
    },
    displayStep () {
      const s = this.step / this.factor
      return Number.isFinite(s) && s > 0 ? s : 1
    },
    displayPrecision () {
      // GB 一般整数；TB 时允许小数以覆盖最小步进
      return this.unit === 'TB' ? 3 : 0
    },
  },
  methods: {
    emitGb (gb) {
      let val = gb
      if (this.normalizeGb) {
        val = this.normalizeGb(val)
      }
      // 磁盘大小在现有逻辑里以 GB 整数为主，避免产生小数 GB
      val = Math.round(val)
      this.$emit('change', val)
    },
    onNumberChange (v) {
      if (v === '' || v === null || v === undefined) {
        this.$emit('change', undefined)
        return
      }
      const n = Number(v)
      if (!Number.isFinite(n)) return
      this.emitGb(n * this.factor)
    },
    onUnitChange (u) {
      // 切换单位时保持实际 GB 值不变，只改变展示
      this.unit = u
      // 触发一次 change，让表单重新校验（值不变也不影响）
      if (this.gbValue !== undefined) {
        this.emitGb(this.gbValue)
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
