<template>
  <a-form-item :label="$t('db.text_116')" v-bind="formItemLayout">
    <a-tooltip placement="top">
      <template slot="title">
          <span v-if="selectedSku">{{$t('db.text_117', [numberProps.min,numberProps.max])}}</span>
          <span v-else>{{$t('db.text_118')}}</span>
        </template>
      <a-input-number  v-bind="numberProps" @blur="handleBlurDiskSize" v-decorator="['disk_size_gb', { initialValue: numberProps.min }]" /> GB
    </a-tooltip>
  </a-form-item>
</template>
<script>
export default {
  name: 'DiskSizeInput',
  inject: ['form', 'formItemLayout'],
  props: {
    selectedSku: {
      type: Object,
    },
    min: {
      type: Number,
    },
  },
  computed: {
    numberProps () {
      if (!this.selectedSku) {
        return {
          disabled: true,
        }
      }
      const min = this.min > 0 ? this.min : this.selectedSku.min_disk_size_gb
      const max = this.selectedSku.max_disk_size_gb
      const step = this.selectedSku.disk_size_step
      return {
        min,
        max,
        step,
      }
    },
  },
  watch: {
    // 套餐/约束变化时，把草稿或当前容量夹到合法区间
    numberProps: {
      handler (props) {
        if (!props || props.disabled || props.min == null || props.max == null) return
        this.$nextTick(() => this.clampDiskSizeToSku(props))
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    clampDiskSizeToSku (props = this.numberProps) {
      if (!this.form || props.disabled || props.min == null || props.max == null) return
      const setter = this.form.setFieldsValue || this.form.fc?.setFieldsValue
      const getter = this.form.getFieldValue || this.form.fc?.getFieldValue
      if (!setter || !getter) return
      const val = Number(getter.call(this.form.fc || this.form, 'disk_size_gb'))
      if (Number.isNaN(val) || val == null) {
        setter.call(this.form.fc || this.form, { disk_size_gb: props.min })
        return
      }
      let next = val
      if (next < props.min) next = props.min
      if (next > props.max) next = props.max
      const step = props.step || 1
      if (step > 0 && next > props.min) {
        const rem = (next - props.min) % step
        if (rem !== 0) next = next + (step - rem)
        if (next > props.max) next = props.max - ((props.max - props.min) % step)
      }
      if (next !== val) {
        setter.call(this.form.fc || this.form, { disk_size_gb: next })
      }
    },
    handleBlurDiskSize (e, step = this.numberProps.step) {
      const val = parseFloat(e.target.value)
      if (!val) {
        this.form.setFieldsValue({
          disk_size_gb: this.numberProps.min,
        })
        return
      }
      if (val > 0) {
        let next = val
        if (this.numberProps.max != null && next > this.numberProps.max) next = this.numberProps.max
        if (this.numberProps.min != null && next < this.numberProps.min) next = this.numberProps.min
        const num = next % step
        if (num > 0) {
          next = next + (step - num)
          if (this.numberProps.max != null && next > this.numberProps.max) {
            next = this.numberProps.max - ((this.numberProps.max - this.numberProps.min) % step)
          }
        }
        this.form.setFieldsValue({
          disk_size_gb: next,
        })
      }
    },
  },
}
</script>
