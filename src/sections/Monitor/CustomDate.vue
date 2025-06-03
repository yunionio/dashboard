<template>
  <a-popconfirm placement="bottom" overlayClassName="custom-date-time" @confirm="submit" @cancel="cancel" v-model="visible">
    <template v-slot:icon><i /></template>
    <template v-slot:title>
      <a-alert v-if="diffHours < 1" class="mb-2" :message="$t('common_587')" type="error" show-icon />
      <a-form-model hideRequiredMark ref="ruleForm" :model="formData" :rules="rules" v-bind="layout" style="min-width: 300px;">
        <a-form-model-item :label="$t('common.text00119')" prop="startValue">
          <a-date-picker
            v-model="formData.startValue"
            :show-time="{ format: 'HH:mm', defaultValue: $moment('00:00:00', 'HH:mm:ss') }"
            format="YYYY-MM-DD HH:mm"
            :open="startOpen"
            :placeholder="$t('common.text00119')"
            @openChange="handleStartOpenChange" />
        </a-form-model-item>
        <a-form-model-item :label="$t('common.text00120')" prop="endValue">
          <a-date-picker
            v-model="formData.endValue"
            :show-time="{ format: 'HH:mm', defaultValue: $moment('00:00:00', 'HH:mm:ss') }"
            format="YYYY-MM-DD HH:mm"
            :placeholder="$t('common.text00120')"
            :open="endOpen"
            @openChange="handleEndOpenChange" />
        </a-form-model-item>
      </a-form-model>
    </template>
    <a-radio-button value="custom">{{ $t('common.text00121') }}{{customTimeText}}</a-radio-button>
  </a-popconfirm>
</template>

<script>
import * as R from 'ramda'
import moment from 'moment'

export default {
  name: 'MonitorCustomDate',
  props: {
    startTime: {
      type: Object,
      required: false,
      default: () => { return null },
    },
    endTime: {
      type: Object,
      default: () => moment(),
    },
    customTime: {
      type: Object,
      validator: val => val.from,
    },
    allowFutureTime: {
      type: Boolean,
      default: false,
    },
    showCustomTimeText: {
      type: Boolean,
      default: false,
    },
    customTimeUseTimeStamp: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      formData: {
        startValue: this.startTime,
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
  computed: {
    customTimeText () {
      const { startValue, endValue } = this.formData
      if (startValue && endValue && this.showCustomTimeText) {
        return ` (${this.$moment(startValue).format('YYYY-MM-DD HH:mm')} ~ ${this.$moment(endValue).format('YYYY-MM-DD HH:mm')})`
      }
      return ''
    },
  },
  watch: {
    customTime: {
      handler: function (val) {
        if (val && val.from) {
          if (this.customTimeUseTimeStamp) {
            const time = this.$moment(parseInt(val.from + ''))
            this.formData.startValue = time
          } else {
            // 兼容 now-h 的格式
            const hours = +val.from.replace(/^now-(\w+)h$/, '$1').replace('now', 0)
            if (R.is(Number, hours) && !Number.isNaN(hours)) this.formData.startValue = this.$moment().subtract(hours, 'hours')
          }
        }
        if (val && val.to) {
          if (this.customTimeUseTimeStamp) {
            const time = this.$moment(parseInt(val.to + ''))
            this.formData.endValue = time
          } else {
            // 兼容 now-h 的格式
            const hours = +val.to.replace(/^now-(\w+)h$/, '$1').replace('now', 0)
            if (R.is(Number, hours) && !Number.isNaN(hours)) this.formData.endValue = this.$moment().subtract(hours, 'hours')
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    cancel () {
      this.visible = false
    },
    getCustomTime () {
      if (this.customTimeUseTimeStamp) {
        const from = this.formData.startValue.valueOf()
        const to = this.formData.endValue.valueOf()
        return {
          from,
          to,
        }
      }
      const from = this.formData.startValue.diff(this.$moment(), 'hours')
      const to = this.formData.endValue.diff(this.$moment(), 'hours')
      return {
        from: from === 0 ? 'now' : `now${from}h`, // from 是负数
        to: to === 0 ? 'now' : `now${to}h`, // to 是负数
      }
    },
    async submit () {
      console.log(' submit')
      try {
        const valid = await this.$refs.ruleForm.validate()
        this.diffHours = this.formData.endValue.diff(this.formData.startValue, 'hours')
        if (this.diffHours < 1) {
          this.visible = true
          return false
        }
        if (valid) {
          console.log(' valid')
          this.$emit('update:time', 'custom')
          this.$emit('click', 'custom')
          this.$emit('update:customTime', this.getCustomTime())
          this.visible = false
        } else {
          console.log(' un valid')
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
        return this.disablefutureDate(startValue)
      }
      return this.disablefutureDate(startValue) || (startValue.valueOf() > endValue.valueOf())
    },
    disablefutureDate (v) {
      if (this.allowFutureTime) {
        return false
      }
      return v && (v > this.$moment().endOf('day'))
    },
    disabledEndDate (endValue) {
      const startValue = this.formData.startValue
      if (!endValue || !startValue) {
        return this.disablefutureDate(endValue)
      }
      return this.disablefutureDate(endValue) || (startValue.valueOf() >= endValue.valueOf())
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
