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
  methods: {
    handleBlurDiskSize (e, step = this.numberProps.step) {
      const val = parseFloat(e.target.value)
      if (!val) {
        this.form.setFieldsValue({
          disk_size_gb: this.numberProps.min,
        })
      }
      if (val > 0) {
        const num = val % step
        if (num > 0) {
          this.form.setFieldsValue({
            disk_size_gb: val + (step - num),
          })
        }
      }
    },
  },
}
</script>
