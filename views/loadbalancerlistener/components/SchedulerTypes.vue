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
        { key: 'rr', label: '轮询(RR)' },
        { key: 'wrr', label: '加权轮询(WRR)' },
        { key: 'wlc', label: '加权最小连接数(WLC)' },
        { key: 'sch', label: '源IP一致性哈希(SCH)' },
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
