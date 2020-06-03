<template>
  <a-popconfirm placement="bottom" @confirm="submit" @cancel="cancel" v-model="visible">
    <template v-slot:icon><i /></template>
    <template v-slot:title>
      <a-form-model ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <a-form-model-item label="开始时间" prop="startValue">
          <a-date-picker
            v-model="formData.startValue"
            :disabled-date="disabledStartDate"
            :disabled-time="disabledDateTime"
            :show-time="{ defaultValue: $moment('00:00:00', 'HH:mm') }"
            format="YYYY-MM-DD HH:mm"
            placeholder="开始时间"
            @openChange="handleStartOpenChange" />
        </a-form-model-item>
        <a-form-model-item label="结束时间" prop="endValue">
          <a-date-picker
            v-model="formData.endValue"
            :disabled-date="disabledEndDate"
            :disabled-time="disabledDateTime"
            :show-time="{ defaultValue: $moment('00:00:00', 'HH:mm') }"
            format="YYYY-MM-DD HH:mm"
            placeholder="结束时间"
            :open="endOpen"
            @openChange="handleEndOpenChange" />
        </a-form-model-item>
      </a-form-model>
    </template>
    <a-radio-button value="custom">自定义</a-radio-button>
  </a-popconfirm>
</template>

<script>
export default {
  data () {
    return {
      formData: {
        startValue: null,
        endValue: null,
      },
      visible: false,
      endOpen: false,
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      },
      rules: {
        startValue: [
          { required: true, message: '请选择开始时间' },
        ],
        endValue: [
          { required: true, message: '请选择结束时间' },
        ],
      },
    }
  },
  watch: {
    startValue (val) {
      console.log('startValue', val)
    },
    endValue (val) {
      console.log('endValue', val)
    },
  },
  methods: {
    cancel () {
      this.visible = false
    },
    getCustomTime () {
      const from = this.formData.startValue.diff(this.$moment(), 'hours')
      const to = this.formData.endValue.diff(this.$moment(), 'hours')
      return {
        from: `now${from}h`, // from 是负数
        to: `now${to}h`, // to 是负数
      }
    },
    async submit () {
      try {
        const valid = await this.$refs.ruleForm.validate()
        if (valid) {
          this.$emit('update:time', 'custom')
          this.$emit('update:customTime', this.getCustomTime())
          this.visible = false
        } else {
          this.visible = true
        }
      } catch (error) {
        this.visible = true
        throw error
      }
    },
    disabledStartDate (startValue) {
      const endValue = this.formData.endValue
      if (!startValue || !endValue) {
        return startValue && (startValue > this.$moment().endOf('day'))
      }
      return (startValue && (startValue > this.$moment().endOf('day'))) || (startValue.valueOf() > endValue.valueOf())
    },
    disabledEndDate (endValue) {
      const startValue = this.formData.startValue
      if (!endValue || !startValue) {
        return endValue && (endValue > this.$moment().endOf('day'))
      }
      return (endValue && (endValue > this.$moment().endOf('day'))) || (startValue.valueOf() >= endValue.valueOf())
    },
    handleStartOpenChange (open) {
      if (!open) {
        this.endOpen = true
      }
    },
    handleEndOpenChange (open) {
      this.endOpen = open
    },
    disabledDateTime () {
      return {
        disabledSeconds: () => this._range(1, 60),
      }
    },
    _range (start, end) {
      const result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    },
  },
}
</script>
