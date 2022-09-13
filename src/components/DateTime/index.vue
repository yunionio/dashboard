<template>
  <div>
    <a-radio-group v-model="time.dateMode" @change="handleDateModeChange">
      <a-radio-button v-for="item in timeOpts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      <custom-date :customDate.sync="customDate" :time.sync="time.dateMode" :customTimeLabel="customTimeLabel" :showFormat="showFormat" :canSelectTodayAfter="canSelectTodayAfter" />
    </a-radio-group>
  </div>
</template>

<script>
import moment from 'moment'
import i18n from '@/locales'
import CustomDate from './CustomDate'

const TIME_SIZE = {
  week: 'day',
  last_week: 'day',
  month: 'day', // 近一个月的时间粒度为1天
  year: 'month', // 近一年的时间密粒度1个月
  last_month: 'day',
  quarter: 'month',
  last_quarter: 'month',
  half_year: 'month',
}

export default {
  name: 'DateTime',
  components: {
    CustomDate,
  },
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
        { key: 'quarter', label: i18n.t('common.date_time.quarter') },
        { key: 'last_quarter', label: i18n.t('common.date_time.last_quarter') },
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
      default: false,
    },
    formatter: {
      type: Function,
      default: (time) => {
        return moment(time).format('YYYYMMDD')
      },
    },
    showFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
  },
  data () {
    return {
      time: {
        dateMode: this.hasDefaultTime ? this.defaultDateMode : '',
        date: [],
      },
      customDate: this.defaultTime,
      customTimeLabel: '',
    }
  },
  watch: {
    customDate () {
      this.handleDateModeChange()
    },
    'time.dateMode' (v) {
      this.$emit('update:dateMode', v)
    },
  },
  created () {
    if (this.hasDefaultTime) {
      this.handleDateModeChange()
      this.$emit('update:dateMode', this.time.dateMode)
    }
  },
  methods: {
    handleDateModeChange () {
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
        end = this.$moment().endOf(this.time.timeMode)
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
        } else {
          let data_type = 'month'
          const diffMonth = end.add(1, 'seconds').diff(start, 'months') // 相差几个月
          if (diffMonth <= 1) data_type = 'day'
          else data_type = 'month'
          params.data_type = data_type
        }
        this.$emit('update:dateType', params.data_type)
      }
      this.$emit('update:getParams', params)
      this.$emit('update:dateMode', this.time.dateMode)
      this.$emit('refresh')
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
          const start = this.$moment(date[this.start].replace('TZ', '')).format(this.showFormat)
          const end = this.$moment(date[this.end].replace('TZ', '')).format(this.showFormat)
          this.customTimeLabel = ` (${start} - ${end})`
        } else {
          this.customTimeLabel = ''
        }
      } catch (err) {
        this.customTimeLabel = ''
      }
    },
  },
}
</script>
