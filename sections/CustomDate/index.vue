<template>
  <a-popconfirm placement="bottom" overlayClassName="custom-date-time" @confirm="submit" @cancel="cancel" v-model="visible">
    <template v-slot:icon><i /></template>
    <template v-slot:title>
      <a-alert v-if="diffHours < 1" class="mb-2" :message="$t('common_587')" type="error" show-icon />
      <a-form-model hideRequiredMark ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <a-form-model-item :label="$t('common.text00119')" prop="startValue">
          <a-date-picker
            v-model="formData.startValue"
            :disabled-date="disabledStartDate"
            :disabled-time="disabledDateTime"
            :show-time="{ defaultValue: $moment('00:00:00', 'HH:mm:ss') }"
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
            :show-time="{ defaultValue: $moment('00:00:00', 'HH:mm:ss') }"
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
import * as R from 'ramda'
import moment from 'moment'

export default {
  name: 'CustomDate',
  props: {
    endTime: {
      type: Object,
      default: () => moment(),
    },
    customTime: {
      type: Object,
      validator: val => val.from,
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
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
      },
      rules: {
        startValue: [
          { required: true, message: this.$t('common.select') },
        ],
        endValue: [
          { required: true, message: this.$t('common.select') },
        ],
      },
      diffHours: 1,
    }
  },
  watch: {
    customTime (val) {
      if (val && val.from) {
        const hours = +val.from.replace(/^now-(\w+)h$/, '$1')
        if (R.is(Number, hours) && !Number.isNaN(hours)) this.formData.startValue = this.$moment().subtract(hours, 'hours')
      }
      if (val && val.to) {
        const hours = +val.to.replace(/^now-(\w+)h$/, '$1')
        if (R.is(Number, hours) && !Number.isNaN(hours)) this.formData.endValue = this.$moment().subtract(hours, 'hours')
      }
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
        from: from === 0 ? 'now' : `now${from}h`, // from 是负数
        to: to === 0 ? 'now' : `now${to}h`, // to 是负数
      }
    },
    async submit () {
      try {
        const valid = await this.$refs.ruleForm.validate()
        this.diffHours = this.formData.endValue.diff(this.formData.startValue, 'hours')
        if (this.diffHours < 1) {
          this.visible = true
          return false
        }
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
    _range (start, end) {
      const result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    },
    disabledDateTime () {
      const currentHour = this.$moment().hour()
      return {
        disabledHours: () => this._range(currentHour + 1, 24),
      }
    },
  },
}
</script>
