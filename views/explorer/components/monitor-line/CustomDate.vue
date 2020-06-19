<template>
  <a-popconfirm placement="bottom" @confirm="submit" @cancel="cancel" v-model="visible">
    <template v-slot:icon><i /></template>
    <template v-slot:title>
      <a-form-model ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <a-form-model-item :label="$t('common.text00119')" prop="startValue">
          <a-date-picker
            v-model="formData.startValue"
            :disabled-date="disabledStartDate"
            :disabled-time="disabledDateTime"
            :show-time="{ defaultValue: $moment('00:00:00', 'HH:mm') }"
            format="YYYY-MM-DD HH:mm"
            :open="startOpen"
            :placeholder="$t('common.text00119')"
            @openChange="handleStartOpenChange" />
        </a-form-model-item>
        <a-form-model-item :label="$t('common.text00120')" prop="endValue">
          <a-date-picker
            v-model="formData.endValue"
            :disabled-date="disabledEndDate"
            :disabled-time="disabledDateTime"
            :show-time="{ defaultValue: $moment('00:00:00', 'HH:mm') }"
            format="YYYY-MM-DD HH:mm"
            :placeholder="$t('common.text00120')"
            :open="endOpen"
            @openChange="handleEndOpenChange" />
        </a-form-model-item>
      </a-form-model>
    </template>
    <a-radio-button value="custom">{{ $t('common.text00121') }}</a-radio-button>
  </a-popconfirm>
</template>

<script>
import moment from 'moment'

export default {
  name: 'CustomDate',
  props: {
    endTime: {
      type: Object,
      default: () => moment(),
    },
  },
  data () {
    return {
      formData: {
        startValue: null,
        endValue: this.endTime,
      },
      visible: false,
      startOpen: false,
      endOpen: false,
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      },
      rules: {
        startValue: [
          { required: true, message: this.$t('common.select') },
        ],
        endValue: [
          { required: true, message: this.$t('common.select') },
        ],
      },
    }
  },
  methods: {
    cancel () {
      this.visible = false
    },
    getCustomTime () {
      const from = this.formData.startValue.diff(this.$moment(), 'hours')
      const to = this.formData.endValue.diff(this.$moment(), 'hours')
      return {
        from: from === 0 ? 'now' : `now${from}h`, // from 是负数
        to: to === 0 ? 'now' : `now${to}h`, // to 是负数
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
      this.startOpen = open
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
