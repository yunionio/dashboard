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
      <div class="mb-3 d-flex align-items-center" v-else>
        <div class="ant-form-item-label">
          <label :title="$t('common.date_time.last')" class="ant-form-item-no-colon">{{$t('common.date_time.last')}}</label>
        </div>
        <a-input-group compact>
          <a-select v-model="shortcutData.time" style="width: 120px">
            <a-select-option v-for="item in (shortcutData.timeMode === 'month' ? 12 : 4)" :value="item" :key="item">{{ item }}</a-select-option>
          </a-select>
          <a-select v-model="shortcutData.timeMode" style="width: 120px" @change="timeModeChange">
            <a-select-option v-for="item in timeMode" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-input-group>
      </div>
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
        date_range: [this.customDate.start, this.customDate.end],
      },
      shortcutData: {
        time: 1,
        timeMode: 'month',
      },
      isAdvancedView: true, // 是否展示高级窗口
      confirmView: true, // 确认状态下的是否展示高级窗口
      visible: false,
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      timeMode: [
        { key: 'month', label: this.$t('common.whole_month') },
        { key: 'quarter', label: this.$t('common.whole_quarter') },
        { key: 'year', label: this.$t('common.whole_year') },
      ],
      rules: {
        date_range: [
          { required: true, validator: this.dateRangeValidate },
        ],
      },
    }
  },
  methods: {
    dateRangeValidate (rule, value, callback) {
      if (value && value[0] && value[1]) {
        if (!this.canSelectTodayAfter && value[1] > this.$moment().endOf('day')) {
          callback(new Error(this.$t('common.select_time_little_current')))
        }
        callback()
      }
      callback(new Error(this.$t('common.tips.select', [this.$t('common.date_range')])))
    },
    timeModeChange (val) {
      if (val === 'year' || val === 'quarter') {
        if (this.shortcutData.time > 4) {
          this.shortcutData.time = 1
        }
      }
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
        const { time, timeMode } = this.shortcutData
        let end = this.$moment().subtract(1, timeMode).endOf(timeMode)
        let start = this.$moment().subtract(time, timeMode).startOf(timeMode)
        if (timeMode === 'year') {
          start = this.$moment().subtract(time, timeMode).startOf('month')
          end = this.$moment().subtract(1, 'month').endOf('month')
        }
        return {
          start,
          end,
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
