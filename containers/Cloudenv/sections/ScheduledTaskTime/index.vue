<template>
  <div>
    <!-- 策略类型 -->
    <a-form-item :label="$t('cloudenv.text_433')">
      <a-radio-group v-decorator="decorators.cycle_type">
        <a-radio-button v-for="(v, k) in $t('cloudenvScheduledtaskGroupCycleType')" :key="k" :value="k">{{v}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <!-- 周期策略 -->
    <a-form-item :label="$t('cloudenv.frequency')" v-if="form.fc.getFieldValue('cycleTimer.cycle_type') === 'cycle'">
      <div class="d-flex align-items-center">
        {{$t('cloudenv.each')}}
        <a-input-number class="ml-2" :min="1" v-decorator="decorators.cycle_num" />
        <a-select class="mr-2" v-decorator="decorators.cycle_type2" style="width: 100px">
          <a-select-option v-for="(item,index) in cycleTypeOpts" :key="index" :value="item.key">{{item.label}}</a-select-option>
        </a-select>
        {{$t('cloudenv.cycle_once')}}
      </div>
    </a-form-item>
    <!-- 周 -->
    <a-form-item :label="$t('cloudenv.text_434')" v-if="form.fc.getFieldValue('cycleTimer.cycle_type') === 'week'">
      <a-select v-decorator="decorators.weekDays" mode="multiple">
        <a-select-option v-for="(v, k) in $t('flexGroupSubCycleTypeWeek')" :key="k" :value="parseInt(k)">{{v}}</a-select-option>
      </a-select>
    </a-form-item>
    <!-- 月 -->
    <a-form-item :label="$t('cloudenv.text_435')" v-if="form.fc.getFieldValue('cycleTimer.cycle_type') === 'month'">
      <a-select v-decorator="decorators.monthDays" mode="multiple">
        <a-select-option v-for="i in 31" :key="i" :value="parseInt(i)">{{$t('cloudenv.text_436', [i])}}</a-select-option>
      </a-select>
    </a-form-item>
    <!-- 单次策略 -->
    <template v-if="form.fc.getFieldValue('cycleTimer.cycle_type') === 'one'">
      <a-form-item :label="$t('cloudenv.text_437')">
        <a-date-picker
          :showTime="{
            format: 'HH:mm',
          }"
          :disabledDate="disabledDate"
          :disabledTime="disabledDateTime"
          v-decorator="decorators.execTime"
          format="YYYY-MM-DD HH:mm" />
      </a-form-item>
    </template>
    <!-- 非单次策略 -->
    <template v-if="form.fc.getFieldValue('cycleTimer.cycle_type') !== 'one'">
      <a-form-item :label="$t('cloudenv.text_437')" v-if="form.fc.getFieldValue('cycleTimer.cycle_type') !== 'cycle'">
        <a-time-picker v-decorator="decorators.hourMinute" format="HH:mm" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_438')" :help="$t('cloudenv.range_picker_help')">
        <a-range-picker
          v-decorator="decorators.startEndTime"
          :disabledDate="disabledDate"
          format="YYYY-MM-DD" />
      </a-form-item>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    form: Object,
  },
  data () {
    return {
      name: 'SckeduledTaskTime',
      decorators: {
        cycle_type: [
          'cycleTimer.cycle_type',
          {
            initialValue: 'day',
            rules: [
              { required: true, message: this.$t('cloudenv.text_443') },
            ],
          },
        ],
        weekDays: [
          'cycleTimer.week_days',
          {
            initialValue: [1, 2, 3, 4, 5],
            rules: [
              { required: true, message: this.$t('cloudenv.text_444') },
            ],
          },
        ],
        monthDays: [
          'cycleTimer.month_days',
          {
            initialValue: [1],
            rules: [
              { required: true, message: this.$t('cloudenv.text_445') },
            ],
          },
        ],
        cycle_num: [
          'cycleTimer.cycle_num',
          {
            initialValue: 1,
            rules: [
              { required: true, message: this.$t('cloudenv.input_cycle_num') },
            ],
          },
        ],
        cycle_type2: [
          'cycleTimer.cycle_type2',
          {
            initialValue: 'month',
          },
        ],
        // 小时：分钟
        hourMinute: [
          'hourMinute',
          {
            // initialValue: [1],
            rules: [
              { required: true, message: this.$t('cloudenv.text_446') },
            ],
          },
        ],
        // 有效时间
        startEndTime: [
          'startEndTime',
          {
            // initialValue: [1],
            rules: [
              { required: false, message: this.$t('cloudenv.text_447') },
            ],
          },
        ],
        execTime: [
          'timer.execTime',
          {
            initialValue: this.$moment().add(1, 'h'),
            rules: [
              { required: true, message: this.$t('cloudenv.text_437') },
            ],
          },
        ],
      },
      cycleTypeOpts: [
        { key: 'hour', label: this.$t('cloudenv.cycle_type.hour') },
        { key: 'day', label: this.$t('cloudenv.cycle_type.day') },
        { key: 'week', label: this.$t('cloudenv.cycle_type.week') },
        { key: 'month', label: this.$t('cloudenv.cycle_type.month') },
      ],
    }
  },
  methods: {
    disabledDate (current) {
      return current && current < this.$moment().subtract(1, 'd').endOf('day')
    },
    range (start, end) {
      const result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    },
    disabledDateTime (_ = this.$moment(), type) {
      let disabledHours = []
      let disabledMinutes = []
      let disabledSeconds = []
      const dayDiff = _.diff(this.$moment(), 'days', true)
      const hourDiff = _.diff(this.$moment(), 'hours', true)
      const minutesDiff = _.diff(this.$moment(), 'minutes', true)
      // 当天
      if (dayDiff > -1 && dayDiff < 0) {
        disabledHours = this.range(0, this.$moment().hour())
        if (hourDiff > -1 && hourDiff < 0) {
          disabledMinutes = this.range(0, this.$moment().minute())
          if (minutesDiff > -1 && minutesDiff < 0) {
            disabledSeconds = this.range(0, this.$moment().second())
          }
        }
      }
      return {
        disabledHours: () => disabledHours,
        disabledMinutes: () => disabledMinutes,
        disabledSeconds: () => disabledSeconds,
      }
    },
    transformParams (params, values) {
      if (values.cycleTimer.cycle_type === 'one') {
        params.scheduled_type = 'timing'
        params.timer = values.timer
      } else {
        params.scheduled_type = 'cycle'
        params.cycle_timer = { ...values.cycleTimer }
      }
      // 触发时间
      if (values.hourMinute) {
        // 转换为utc hour
        const time = this.$moment(values.hourMinute)
        params.cycle_timer.hour = time.subtract(time.utcOffset(), 'minutes').hour()
        params.cycle_timer.minute = values.hourMinute.minutes()
      }
      // 有效时间
      if (values.startEndTime && values.startEndTime.length > 0) {
        params.cycle_timer.startTime = values.startEndTime[0].set({
          hour: 0,
          minute: 0,
          second: 0,
        })
        params.cycle_timer.endTime = values.startEndTime[1].set({
          hour: 23,
          minute: 59,
          second: 59,
        })
      } else {
        // 未设置有效时间时，有效时间为 今天-100年
        if (!params.cycle_timer) params.cycle_timer = {}
        params.cycle_timer.startTime = this.$moment()
        params.cycle_timer.endTime = this.$moment().add('year', 100)
      }
      if (params.cycle_timer && params.cycle_timer.cycle_type === 'cycle') {
        params.cycle_timer.cycle_type = params.cycle_timer.cycle_type2
        delete params.cycle_timer.cycle_type2
      }
    },
  },
}
</script>
