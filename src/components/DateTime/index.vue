<template>
  <div>
    <a-radio-group v-model="time.dateMode" @change="handleDateModeChange">
      <a-radio-button v-for="item in timeOpts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      <custom-date :customDate.sync="customDate" :time.sync="time.dateMode" :customTimeLabel="customTimeLabel" :showFormat="customTimeFormat" :canSelectTodayAfter="canSelectTodayAfter" />
    </a-radio-group>
  </div>
</template>

<script>
import moment from 'moment'
import i18n from '@/locales'
import storage from '@/utils/storage'
import WindowsMixin from '@/mixins/windows'
import CustomDate from './CustomDate'

const localTimeKey = '__oc_date_time_'
const ignoreTipTime = '__oc_ignore_tip_time_'

const TIME_SIZE = {
  week: 'day',
  last_week: 'day',
  month: 'day', // 近一个月的时间粒度为1天
  year: 'month', // 近一年的时间密粒度1个月
  last_month: 'day',
  month_before_last_month: 'day',
  last_6_month: 'month',
  last_12_month: 'month',
  quarter: 'month',
  last_quarter: 'month',
  half_year: 'month',
}

export default {
  name: 'DateTime',
  components: {
    CustomDate,
  },
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: Object,
      default: () => ({}),
    },
    start: {
      type: String,
      default: 'start_date',
    },
    end: {
      type: String,
      default: 'end_date',
    },
    supportDatatype: {
      type: Boolean,
      default: false,
    },
    timeOpts: {
      type: Array,
      default: () => [
        { key: 'month', label: i18n.t('common.date_time.month') },
        { key: 'last_month', label: i18n.t('common.date_time.last_month') },
        { key: 'month_before_last_month', label: i18n.t('common.date_time.month_before_last_month') },
        { key: 'last_6_month', label: i18n.t('common.date_time.last_6_month') },
        { key: 'last_12_month', label: i18n.t('common.date_time.last_12_month') },
        { key: 'year', label: i18n.t('common.date_time.year') },
      ],
    },
    timeToEnd: { // 选择本月指定到月末
      type: Boolean,
      default: true,
    },
    // 是否默认选中一个
    hasDefaultTime: {
      type: Boolean,
      default: true,
    },
    defaultDateMode: {
      type: String,
      default: 'month',
    },
    defaultTime: {
      type: Object,
      default: () => { return { start: null, end: null } },
    },
    // 是否可以选择今天之后的日期
    canSelectTodayAfter: {
      type: Boolean,
      default: true,
    },
    // 添加到参数中的日期格式
    paramTimeFormatter: {
      type: String,
      default: 'YYYYMMDD',
    },
    // 添加到参数中的日期格式方法
    timeFormatter: {
      type: Function,
      default: (time) => {
        return moment(time).format('YYYYMMDD')
      },
    },
    // 自定义 展示格式
    customTimeFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    // 是否禁用从本地存储取时间值
    disableLocalTime: {
      type: Boolean,
      default: false,
    },
    showStartMonthTip: {
      type: Boolean,
      default: false,
    },
    useMonthlyMonth: {
      type: Number,
      default: 1,
    },
  },
  data () {
    let initDateMode = this.hasDefaultTime ? this.defaultDateMode : ''
    let initCustomDate = this.defaultTime
    if (!this.disableLocalTime) {
      const localTime = storage.get(localTimeKey, {})
      const { dateMode, time = { } } = localTime
      if (dateMode && this.timeOpts.some(item => item.key === dateMode)) {
        initDateMode = dateMode
      }
      if (dateMode === 'custom' && time.start && time.end) {
        initDateMode = dateMode
        initCustomDate = {
          start: this.$moment(time.start),
          end: this.$moment(time.end),
        }
      }
    }
    return {
      time: {
        dateMode: initDateMode,
        date: [],
      },
      customDate: initCustomDate,
      customTimeLabel: '',
    }
  },
  watch: {
    customDate () {
      this.handleDateModeChange()
    },
    'time.dateMode' (v) {
      this.$emit('update:dateMode', v)
      this.initTipModel()
    },
  },
  created () {
    if (this.hasDefaultTime || !this.disableLocalTime) {
      this.handleDateModeChange()
      this.$emit('update:dateMode', this.time.dateMode)
    }
    this.initTipModel()
  },
  methods: {
    initTipModel () {
      if (!this.showStartMonthTip) return
      const { dateMode = '' } = this.time
      const ignoreTime = storage.get(ignoreTipTime)
      if (ignoreTime && this.$moment(ignoreTime).format('YYYYMM') === this.$moment().format('YYYYMM')) return
      if (dateMode !== 'month' || new Date().getDate() !== 1) return
      setTimeout(() => {
        this.createDialog('BillNoDataTipDialog', {
          ignoreTipTimeKey: ignoreTipTime,
          switchMethod: () => {
            this.time.dateMode = 'last_month'
            this.handleDateModeChange()
          },
        })
      }, 1000)
    },
    handleDateModeChange ({ ignoreEmitDataType = false } = {}) {
      let start = this.$moment()
      let end = this.$moment()
      if (this.time.dateMode === 'week') {
        start = this.$moment().startOf('week')
      } else if (this.time.dateMode === 'last_week') {
        start = this.$moment().subtract(1, 'week').startOf('week')
        end = this.$moment().subtract(1, 'week').endOf('week')
      } else if (this.time.dateMode === 'month') {
        start = this.$moment().startOf('month')
      } else if (this.time.dateMode === 'last_month') {
        start = this.$moment().subtract(1, 'month').startOf('month')
        end = this.$moment().subtract(1, 'month').endOf('month')
      } else if (this.time.dateMode === 'month_before_last_month') {
        start = this.$moment().subtract(2, 'month').startOf('month')
        end = this.$moment().subtract(2, 'month').endOf('month')
      } else if (this.time.dateMode === 'last_6_month') {
        start = this.$moment().subtract(6, 'month').startOf('month')
        end = this.$moment().subtract(1, 'month').endOf('month')
      } else if (this.time.dateMode === 'last_12_month') {
        start = this.$moment().subtract(12, 'month').startOf('month')
        end = this.$moment().subtract(1, 'month').endOf('month')
      } else if (this.time.dateMode === 'quarter') {
        start = this.$moment().startOf('quarter')
      } else if (this.time.dateMode === 'last_quarter') {
        start = this.$moment().subtract(1, 'Q').startOf('quarter')
        end = this.$moment().subtract(1, 'Q').endOf('quarter')
      } else if (this.time.dateMode === 'year') {
        start = this.$moment().startOf('year')
      } else { // 自定义
        start = this.customDate.start
        end = this.customDate.end
      }
      if (['week', 'month', 'quarter', 'year'].includes(this.time.dateMode) && this.timeToEnd) {
        end = this.$moment().endOf(this.time.dateMode)
      }
      this.time.date = [start, end]
      const params = {
        ...this.getParams,
        [this.start]: this.formatter(this.time.date[0]),
        [this.end]: this.formatter(this.time.date[1]),
      }
      if (this.supportDatatype) {
        if (this.time.dateMode !== 'custom') {
          params.data_type = TIME_SIZE[this.time.dateMode]
          const diffMonth = this.$moment(end).add(1, 'seconds').diff(start, 'months') // 相差几个月
          if (diffMonth > this.useMonthlyMonth && params.data_type === 'day') params.data_type = 'month'
        } else {
          let data_type = 'month'
          const diffMonth = this.$moment(end).add(1, 'seconds').diff(start, 'months') // 相差几个月
          if (diffMonth <= Math.min(1, this.useMonthlyMonth)) data_type = 'day'
          else data_type = 'month'
          params.data_type = data_type
        }
        this.$emit('update:dataType', params.data_type)
      }
      this.$emit('update:getParams', params)
      this.$emit('update:dateMode', this.time.dateMode)
      this.$emit('refresh')
      this.setLocalTime()
      this.updateCustomTimeLabel(this.time.dateMode, params)
    },
    handleDateChange () {
      this.time.dateMode = ''
      const params = {
        ...this.getParams,
        [this.start]: this.formatter(this.time.date[0]),
        [this.end]: this.formatter(this.time.date[1]),
      }
      if (this.supportDatatype) {
        params.data_type = TIME_SIZE.month
      }
      this.$emit('update:getParams', params)
      this.$emit('refresh')
      this.updateCustomTimeLabel(this.time.dateMode, params)
    },
    reset () {
      this.time.dateMode = 'month'
    },
    updateCustomTimeLabel (type, date) {
      try {
        if (type === 'custom') {
          const start = this.$moment(date[this.start].replace('TZ', '')).format(this.customTimeFormat)
          const end = this.$moment(date[this.end].replace('TZ', '')).format(this.customTimeFormat)
          this.customTimeLabel = ` (${start} - ${end})`
        } else {
          this.customTimeLabel = ''
        }
      } catch (err) {
        this.customTimeLabel = ''
      }
    },
    formatter (date) {
      if (this.paramTimeFormatter === 'YYYYMMDD') {
        return this.$moment(date).format('YYYYMMDD')
      }
      if (this.paramTimeFormatter === 'YYYY-MM-DDTZ') {
        return this.$moment(date).format('YYYY-MM-DD') + 'TZ'
      }
      if (this.timeFormatter) {
        return this.timeFormatter(date)
      }
      return this.$moment(date).format('YYYY-MM-DD')
    },
    setLocalTime () {
      if (!this.disableLocalTime) {
        storage.set(localTimeKey, {
          dateMode: this.time.dateMode,
          time: this.time.dateMode === 'custom' ? this.customDate : { },
        })
      }
    },
  },
}
</script>
