<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.text_432') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.text_12')" class="mt-3" :count="params.data.length" :action="$t('cloudenv.text_432')" />
      <dialog-table v-if="columns && columns.length" :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('cloudenv.text_95')">
          <a-input :placeholder="$t('cloudenv.text_190')" v-decorator="decorators.name" />
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
          <a-form-item :label="$t('cloudenv.text_438')">
            <a-range-picker
              v-decorator="decorators.startEndTime"
              :disabledDate="disabledDate"
              format="YYYY-MM-DD" />
          </a-form-item>
        </template>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import {
  getStatusTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ScheduledtaskCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      decorators: {
        name: [
          'name',
          {
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
              { required: true, message: this.$t('cloudenv.text_447') },
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
      form: {
        fc: this.$form.createForm(this),
      },
      columns: [
        {
          field: 'name',
          title: this.$t('table.title.name'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return row.name
            },
          },
        },
        getStatusTableColumn({ statusModule: 'cloudaccount', minWidth: 90 }),
        getEnabledTableColumn({ minWidth: 90 }),
      ],
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 3 },
        },
      },
    }
  },
  methods: {
    generateData (values) {
      const params = {
        resource_type: 'cloudaccount',
        label_type: 'id',
        label: this.params.resId,
        operation: 'sync',
        name: values.name,
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
        params.cycle_timer.hour = values.hourMinute.hours()
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
      }
      return params
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = this.generateData(values)
        new this.$Manager('scheduledtasks', 'v1').create({ data: params })
        this.params.callback && this.params.callback()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
