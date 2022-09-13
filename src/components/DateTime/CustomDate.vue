<template>
  <a-popconfirm placement="bottomRight" overlayClassName="custom-date-time" @confirm="submit" @cancel="cancel" v-model="visible">
    <template v-slot:icon><i /></template>
    <template v-slot:title class="pl-0">
      <a-form-model hideRequiredMark v-if="isAdvancedView" ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <a-form-model-item :label="$t('common.text00119')" prop="start">
          <a-date-picker
            v-model="formData.start"
            :disabled-date="disabledStartDate"
            :disabled-time="disabledDateTime"
            :format="showFormat"
            :open="startOpen"
            :placeholder="$t('common.text00119')"
            @openChange="handleStartOpenChange" />
        </a-form-model-item>
        <a-form-model-item :label="$t('common.text00120')" prop="end">
          <a-date-picker
            v-model="formData.end"
            :disabled-date="disabledEndDate"
            :disabled-time="disabledDateTime"
            :format="showFormat"
            :placeholder="$t('common.text00120')"
            :open="endOpen"
            @openChange="handleEndOpenChange" />
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
import * as R from 'ramda'

export default {
  name: 'CustomDate',
  props: {
    endTime: {
      type: Object,
      default: () => moment(),
    },
    customTimeLabel: String,
    canSelectTodayAfter: {
      type: Boolean,
      default: false,
    },
    showFormat: String,
  },
  data () {
    return {
      formData: {
        start: null,
        end: this.endTime,
      },
      shortcutData: {
        time: 1,
        timeMode: 'month',
      },
      isAdvancedView: false, // 是否展示高级窗口
      confirmView: false, // 确认状态下的是否展示高级窗口
      visible: false,
      startOpen: false,
      endOpen: false,
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      },
      timeMode: [
        { key: 'month', label: this.$t('common.date_time.month') },
        { key: 'quarter', label: this.$t('common.date_time.quarter') },
        { key: 'year', label: this.$t('common.date_time.year') },
      ],
      rules: {
        start: [
          { required: true, message: this.$t('common.date_time.please_select') },
        ],
        end: [
          { required: true, message: this.$t('common.date_time.please_select') },
        ],
      },
    }
  },
  methods: {
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
        return R.clone(this.formData)
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
        if (valid) {
          this.$emit('update:time', 'custom')
          this.$emit('update:customDate', this.getCustomTime())
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
    disabledStartDate (start) {
      const end = this.formData.end
      if (!end || !start) {
        return this.canSelectTodayAfter ? false : (start && (start > this.$moment().endOf('day')))
      }
      // 开始和结束可选择同一天
      if (start && end && start.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) {
        return false
      }
      return this.canSelectTodayAfter ? (start.valueOf() > end.valueOf()) : (start && (start > this.$moment().endOf('day'))) || (start.valueOf() > end.valueOf())
    },
    disabledEndDate (end) {
      const start = this.formData.start
      if (!start || !end) {
        return this.canSelectTodayAfter ? false : (end && (end > this.$moment().endOf('day')))
      }
      // 开始和结束可选择同一天
      if (start && end && start.format('YYYY-MM-DD') === end.format('YYYY-MM-DD')) {
        return false
      }
      return this.canSelectTodayAfter ? (start.valueOf() >= end.valueOf()) : (end && (end > this.$moment().endOf('day'))) || (start.valueOf() >= end.valueOf())
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

<style lang="less" scoped>
.custom-date-time ::v-deep .ant-popover-inner-content {
  min-width: 277px;
}
</style>
