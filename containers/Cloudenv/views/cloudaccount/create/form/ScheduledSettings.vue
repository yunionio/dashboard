<template>
  <div>
    <page-body>
      <a-form :form="form.fc" v-bind="formLayout" hideRequiredMark>
        <a-form-item :label="$t('cloudenv.text_95')">
          <a-input :placeholder="$t('cloudenv.text_190')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_360')">
          {{ $t('cloudenv.sync_account') }}
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_433')">
          <a-radio-group v-decorator="decorators.cycle_type">
            <a-radio-button v-for="(v, k) in $t('cloudenvScheduledtaskGroupCycleType')" :key="k" :value="k">{{v}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_434')" v-if="form.fc.getFieldValue('cycleTimer.cycle_type') === 'week'">
          <a-select v-decorator="decorators.weekDays" mode="multiple">
            <a-select-option v-for="(v, k) in $t('flexGroupSubCycleTypeWeek')" :key="k" :value="parseInt(k)">{{v}}</a-select-option>
          </a-select>
        </a-form-item>
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
          <a-form-item :label="$t('cloudenv.text_437')">
            <a-time-picker v-decorator="decorators.hourMinute" format="HH:mm" />
          </a-form-item>
          <a-form-item :label="$t('cloudenv.text_438')" :help="$t('cloudenv.range_picker_help')">
            <a-range-picker
              v-decorator="decorators.startEndTime"
              :disabledDate="disabledDate"
              format="YYYY-MM-DD" />
          </a-form-item>
        </template>
      </a-form>
    </page-body>
  </div>
</template>

<script>
export default {
  name: 'ScheduledSettings',
  props: {
    account: {
      type: Object,
      default: () => { return {} },
    },
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: this.account.name ? `aoto-sync-${this.account.name}-${this.$moment().format('YYYYMMDD')}` : '',
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
            ],
          },
        ],
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
        // 小时：分钟
        hourMinute: [
          'hourMinute',
          {
            initialValue: this.$moment().startOf('day').add(2, 'h'),
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
      formLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
    }
  },
  methods: {
    generateData (resId, values) {
      const params = {
        resource_type: 'cloudaccount',
        label_type: 'id',
        labels: [resId],
        operation: 'sync',
        generate_name: values.name,
      }
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
      return params
    },
    async handleConfirm (resId) {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = this.generateData(resId, values)
        await new this.$Manager('scheduledtasks', 'v1').create({ data: params })
        this.$router.push('/cloudaccount')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
