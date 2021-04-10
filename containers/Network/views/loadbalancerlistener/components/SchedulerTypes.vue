<template>
  <a-form-item>
    <a-radio-group v-decorator="decorators.scheduler">
      <a-tooltip v-for="item in schedulerTypeOpts" :key="item.key" :title="item.tooltip" :mouseEnterDelay="0.5">
        <a-radio-button :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
      </a-tooltip>
    </a-radio-group>
  </a-form-item>
</template>

<script>
export default {
  name: 'LbSchedulerType',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.scheduler,
    },
    schedulerTypeOpts: {
      type: Array,
      default: () => [
        { key: 'rr', label: this.$t('network.text_375') },
        { key: 'wrr', label: this.$t('network.text_376') },
        { key: 'wlc', label: this.$t('network.text_377') },
        { key: 'sch', label: this.$t('network.text_378') },
      ],
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
  },
  watch: {
    schedulerTypeOpts (val) {
      if (val) {
        this.form.fc.getFieldDecorator(this.decorators.scheduler[0], this.decorators.scheduler[1])
        this.form.fc.setFieldsValue({
          [this.decorators.scheduler[0]]: this.form.fc.getFieldValue(this.decorators.scheduler[0]) || val[0].key,
        })
      }
    },
  },
}
</script>
