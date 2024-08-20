<template>
  <a-popconfirm ref="customDate" placement="bottomRight" overlayClassName="custom-date-time" @confirm="submit" @cancel="cancel" v-model="visible">
      <template v-slot:icon><i /></template>
      <template v-slot:title class="pl-0">
        <div @click="hiddenMonthSelectVisble">
          <a-form-model hideRequiredMark v-if="isAdvancedView" ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
            <a-form-model-item :label="$t('common.date_range')" prop="date_range">
              <div class="mr-2" style="width:356px">
                <a-range-picker
                  v-model="formData.date_range"
                  :format="showFormat"
                  :disabled-time="disabledDate" />
              </div>
            </a-form-model-item>
          </a-form-model>
          <a-form-model hideRequiredMark v-else ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
            <a-form-model-item :label="$t('common.date_range')" prop="month_range">
              <month-range-picker ref="monthSelect" v-model="formData.month_range" :panelVisible="visible" />
            </a-form-model-item>
          </a-form-model>
          <a-button v-if="!isHideCustomAdvanced" type="link" class="position-absolute" style="bottom: -28px;" @click="toggleView">{{ isAdvancedView ? $t('common.date_time.quick') : $t('common.date_time.advanced') }}</a-button>
        </div>
      </template>
    <!-- </div> -->
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
      default: () => {
        return {
          start: moment(),
          end: moment(),
        }
      },
    },
    customTimeLabel: String,
    canSelectTodayAfter: {
      type: Boolean,
      default: true,
    },
    showFormat: String,
    isHideCustomAdvanced: Boolean,
  },
  data () {
    return {
      formData: {
        month_range: this.customDate.start ? [moment(this.customDate.start), moment(this.customDate.end)] : [null, null],
        date_range: [this.customDate.start, this.customDate.end],
      },
      monthChangeIndex: 0,
      isAdvancedView: false, // 是否展示高级窗口
      confirmView: true, // 确认状态下的是否展示高级窗口
      visible: false,
      monthSelectVisble: false,
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      rules: {
        date_range: [
          { required: true, validator: this.dateRangeValidate },
        ],
        start_month: [
          { required: true, validator: this.monthStartValidate },
        ],
        end_month: [
          { required: true, validator: this.monthEndValidate },
        ],
      },
    }
  },
  watch: {
    isAdvancedView (val) {
      if (!val && !this.visible) {
        this.monthChangeIndex = 0
      }
    },
    visible (val) {
      if (!val && !this.isAdvancedView) {
        this.monthChangeIndex = 0
      }
      if (!val) {
        this.monthSelectVisble = false
      }
      if (val) {
        this.$nextTick(() => {
          const that = this
          const tags = document.getElementsByClassName('ant-popover-inner-content')
          for (let i = 0; i < tags.length; i++) {
            tags[i].addEventListener('click', function () {
              that.$refs.monthSelect && that.$refs.monthSelect.hiddenPanel()
            })
          }
        })
      }
    },
  },
  methods: {
    hiddenMonthSelectVisble () {
      this.$refs.monthSelect && this.$refs.monthSelect.hiddenPanel()
    },
    startChange (value) {
      const dateEnd = this.formData.month_range[1]
      if (dateEnd && value > dateEnd) {
        this.formData.month_range[1] = value
      }
    },
    dateDisabledEnd (value) {
      const dateStart = this.formData.month_range[0]
      if (dateStart && value < dateStart) return true
      return false
    },
    handleOpenChange (val) {
      this.monthSelectVisble = val
    },
    handleMonthChange (val, str) {
      const val0 = val[0].format('YYYYMM')
      const val1 = val[1].format('YYYYMM')
      const ori0 = this.formData.month_range[0].format('YYYYMM')
      const ori1 = this.formData.month_range[0].format('YYYYMM')
      let changeIndex = 0
      if (val0 === ori0 && val1 !== ori1) {
        changeIndex = 1
      }
      const changeVal = val[changeIndex]
      if (this.monthChangeIndex === 0) {
        const otherVal = this.formData.month_range[1] > changeVal ? this.formData.month_range[1] : changeVal
        this.formData.month_range = [changeVal, otherVal]
        this.monthChangeIndex = 1
      } else {
        if (changeVal < this.formData.month_range[0]) {
          this.formData.month_range = [changeVal, this.formData.month_range[0]]
        } else {
          this.formData.month_range = [this.formData.month_range[0], changeVal]
        }
        this.monthChangeIndex = 0
        this.monthSelectVisble = false
      }
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
    monthStartValidate (rule, value, callback) {
      if (this.formData.month_range[0]) {
        callback()
      }
      callback(new Error(this.$t('common.tips.select', [this.$t('common.date_range')])))
    },
    monthEndValidate (rule, value, callback) {
      if (this.formData.month_range[1]) {
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
