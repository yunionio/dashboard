<template>
  <a-popconfirm placement="bottomRight" overlayClassName="custom-date-time" @confirm="submit" @cancel="cancel" v-model="visible">
    <template v-slot:icon><i /></template>
    <template v-slot:title class="pl-0">
      <a-form-model hideRequiredMark v-if="isAdvancedView" ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <a-form-model-item :label="$t('common.date_range')" prop="date_range">
          <a-range-picker
            v-model="formData.date_range"
            :format="showFormat"
            :disabled-time="disabledDate" />
        </a-form-model-item>
      </a-form-model>
      <a-form-model hideRequiredMark v-else ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <a-form-model-item :label="$t('common.date_range')" prop="month_range">
          <a-range-picker
            v-model="formData.month_range"
            format="YYYY-MM"
            :mode="['month', 'month']"
            :disabled-time="disabledDate"
            @panelChange="handleMonthChange" />
        </a-form-model-item>
      </a-form-model>
      <a-button type="link" class="position-absolute" style="bottom: -28px;" @click="toggleView">{{ isAdvancedView ? $t('common.date_time.quick') : $t('common.date_time.advanced') }}</a-button>
    </template>
    <a-radio-button value="custom">{{$t('common.date_time.custom')}}{{customTimeLabel}}</a-radio-button>
  </a-popconfirm>
</template>

<script>
import moment from 'moment'

export default {
  name: 'CustomDate',
  props: {
    customDate: {
      type: Object,
      default: () => [moment(), moment()],
    },
    customTimeLabel: String,
    canSelectTodayAfter: {
      type: Boolean,
      default: true,
    },
    showFormat: String,
  },
  data () {
    return {
      formData: {
        month_range: [moment().startOf('month'), moment().endOf('month')],
        date_range: [this.customDate.start, this.customDate.end],
      },
      isAdvancedView: false, // 是否展示高级窗口
      confirmView: true, // 确认状态下的是否展示高级窗口
      visible: false,
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      rules: {
        date_range: [
          { required: true, validator: this.dateRangeValidate },
        ],
        month_range: [
          { required: true, validator: this.monthRangeValidate },
        ],
      },
    }
  },
  methods: {
    handleMonthChange (val) {
      this.formData.month_range = val
    },
    dateRangeValidate (rule, value, callback) {
      if (value && value[0] && value[1]) {
        if (!this.canSelectTodayAfter && value[1] > this.$moment().endOf('day')) {
          callback(new Error(this.$t('common.select_time_little_current')))
        }
        callback()
      }
      callback(new Error(this.$t('common.tips.select', [this.$t('common.date_range')])))
    },
    monthRangeValidate (rule, value, callback) {
      if (value && value[0] && value[1]) {
        callback()
      }
      callback(new Error(this.$t('common.tips.select', [this.$t('common.date_range')])))
    },
    toggleView () {
      this.isAdvancedView = !this.isAdvancedView
    },
    cancel () {
      this.visible = false
      setTimeout(() => {
        this.isAdvancedView = this.confirmView
      }, 300)
    },
    getCustomTime () {
      if (this.isAdvancedView) {
        return { start: this.formData.date_range[0], end: this.formData.date_range[1] }
      } else {
        return {
          start: this.$moment(this.formData.month_range[0].startOf('month')),
          end: this.$moment(this.formData.month_range[1].endOf('month')),
        }
      }
    },
    async submit () {
      try {
        const valid = this.isAdvancedView ? await this.$refs.ruleForm.validate() : true
        const customDate = this.getCustomTime()
        if (valid) {
          this.$emit('update:time', 'custom')
          this.$emit('update:customDate', customDate)
          this.$emit('change', customDate)
          this.visible = false
        } else {
          this.visible = true
        }
        this.confirmView = this.isAdvancedView
      } catch (error) {
        this.visible = true
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
.custom-date-time ::v-deep .ant-popover-inner-content {
  min-width: 277px;
}
</style>
