<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
       <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="名称">
          <a-input :placeholder="$t('validator.serverCreateName')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item label="策略类型">
          <a-radio-group v-decorator="decorators.trigger_type">
            <a-radio-button v-for="(v, k) in $t('flexGrouTriggerType')" :key="k" :value="k">{{v}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <!-- 告警策略 -->
        <template v-if="form.fc.getFieldValue('trigger_type') === 'alarm' || !form.fc.getFieldValue('trigger_type')">
          <a-form-item label="触发条件">
            <a-input-group compact>
              <a-select style="width: 50%" v-decorator="decorators.indicator">
                <a-select-option  v-for="(v, k) in $t('flexGroupIndicator')" :key="k" :value="k">{{v}}</a-select-option>
              </a-select>
              <a-select style="width: 25%" v-decorator="decorators.operator">
                <a-select-option value="lt">小于</a-select-option>
                <a-select-option value="gt">大于</a-select-option>
              </a-select>
              <a-input-number v-decorator="decorators.value" :min="0" :max="form.fc.getFieldValue('alarm.indicator') && form.fc.getFieldValue('alarm.indicator') !== 'cpu' ? 999999999 : 100" />
              <span style="margin:5px 0 0 5px">
                {{ form.fc.getFieldValue('alarm.indicator') && form.fc.getFieldValue('alarm.indicator') !== 'cpu' ? 'b/s' : '%' }}
              </span>
            </a-input-group>
          </a-form-item>
          <a-form-item label="监控周期">
            <a-select style="width: 50%" v-decorator="decorators.cycle">
              <a-select-option  v-for="(v, k) in $t('flexGroupCycles')" :key="k" :value="parseInt(k)">{{v}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="连续出现次数">
            <a-tooltip placement="top" title="范围在1 ～ 1000">
              <a-input-number  v-decorator="decorators.cumulate" :min="1" :max="1000" />
            </a-tooltip>
            <div slot="extra">
              例如设置为 {{form.fc.getFieldValue('alarm.cumulate') || 3}}，则表示连续 {{form.fc.getFieldValue('alarm.cumulate') || 3}} 次超过阈值后才会触发告警
            </div>
          </a-form-item>
        </template>
        <!-- 定时策略 -->
        <template v-if="form.fc.getFieldValue('trigger_type') === 'timing'">
          <a-form-item label="触发时间">
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
        <!-- 周期策略 -->
        <template v-if="form.fc.getFieldValue('trigger_type') === 'cycle'">
          <a-form-item label="重复周期">
            <a-select v-decorator="decorators.cycle_type">
              <a-select-option v-for="(v, k) in $t('flexGroupCycleType')" :key="k" :value="k">{{v}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="触发星期" v-if="form.fc.getFieldValue('cycleTimer.cycle_type') === 'week'">
            <a-select v-decorator="decorators.weekDays" mode="multiple">
              <a-select-option v-for="(v, k) in $t('flexGroupSubCycleTypeWeek')" :key="k" :value="parseInt(k)">{{v}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="触发日期" v-if="form.fc.getFieldValue('cycleTimer.cycle_type') === 'month'">
            <a-select v-decorator="decorators.monthDays" mode="multiple">
              <a-select-option v-for="i in 31" :key="i" :value="parseInt(i)">{{i}}号</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="触发时间">
            <a-time-picker v-decorator="decorators.hourMinute" format="HH:mm" />
          </a-form-item>
          <a-form-item label="有效时间">
            <a-range-picker
              v-decorator="decorators.startEndTime"
              :disabledDate="disabledDate"
              format="YYYY-MM-DD" />
          </a-form-item>
        </template>
        <a-form-item label="执行动作">
          <a-input-group compact>
            <a-select style="width: 50%" v-decorator="decorators.action">
              <a-select-option v-for="(v, k) in $t('flexGroupRuleAction')" :key="k" :value="k">{{v}}</a-select-option>
            </a-select>
            <a-tooltip>
              <span slot="title">
                {{actionConfig(form.fc.getFieldValue('action')).tooltip}}
              </span>
              <a-input-number v-bind="actionConfig(form.fc.getFieldValue('action')).number" v-decorator="decorators.number" />
            </a-tooltip>
            <span style="margin:5px 0 0 5px">
              个实例
            </span>
          </a-input-group>
        </a-form-item>
        <a-form-item label="默认冷却时间">
          <a-tooltip placement="top" title="范围在0 ～ 1000">
            <a-input-number v-decorator="decorators.cooling_time" :min="0" :max="1000" />
          </a-tooltip>
          <span style="margin:5px 0 0 5px">
             秒
          </span>
          <div slot="extra">
           一个伸缩活动执行完成后的 {{form.fc.getFieldValue('cooling_time') || 180}}秒 内，该伸缩组不执行其它的伸缩活动(仅针对告警策略有效)
          </div>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
// import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm from '@/utils/validate'

export default {
  name: 'FiexRuleListCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
      decorators: {
        name: [
          'name',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: validateForm('serverCreateName') },
            ],
          },
        ],
        trigger_type: [
          'trigger_type',
          {
            initialValue: 'alarm',
            rules: [
              { required: true, message: '请选择策略类型' },
            ],
          },
        ],
        indicator: [
          'alarm.indicator',
          {
            initialValue: 'cpu',
            rules: [
              { required: true, message: '请选择触发条件' },
            ],
          },
        ],
        operator: [
          'alarm.operator',
          {
            initialValue: 'gt',
          },
        ],
        value: [
          'alarm.value',
          {
            initialValue: 80,
          },
        ],
        cumulate: [
          'alarm.cumulate',
          {
            initialValue: 3,
            rules: [
              { required: true, message: '请输入连续出现次数' },
            ],
          },
        ],
        cooling_time: [
          'cooling_time',
          {
            initialValue: 180,
            rules: [
              { required: true, message: '请输入默认冷却时间' },
            ],
          },
        ],
        action: [
          'action',
          {
            initialValue: 'add',
            rules: [
              { required: true, message: '请选择执行动作' },
            ],
          },
        ],
        number: [
          'number',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请输入实例数量' },
            ],
          },
        ],
        cycle_type: [
          'cycleTimer.cycle_type',
          {
            initialValue: 'day',
            rules: [
              { required: true, message: '请选择重复周期' },
            ],
          },
        ],
        weekDays: [
          'cycleTimer.week_days',
          {
            initialValue: [1, 2, 3, 4, 5],
            rules: [
              { required: true, message: '请选择触发星期' },
            ],
          },
        ],
        monthDays: [
          'cycleTimer.month_days',
          {
            initialValue: [1],
            rules: [
              { required: true, message: '请选择触发日期' },
            ],
          },
        ],
        // 小时：分钟
        hourMinute: [
          'hourMinute',
          {
            // initialValue: [1],
            rules: [
              { required: true, message: '请选择触发时间' },
            ],
          },
        ],
        // 有效时间
        startEndTime: [
          'startEndTime',
          {
            // initialValue: [1],
            rules: [
              { required: true, message: '请选择有效期' },
            ],
          },
        ],
        execTime: [
          'timer.execTime',
          {
            rules: [
              { required: true, message: '触发时间' },
            ],
          },
        ],
        cycle: [
          'alarm.cycle',
          {
            initialValue: 300,
            rules: [
              { required: true, message: '请选择监控周期' },
            ],
          },
        ],
      },
    }
  },
  methods: {
    actionConfig (type) {
      const { resData } = this.params
      if (type === 'set') {
        let number = {
          min: resData.min_instance_number,
          max: resData.max_instance_number,
        }
        let tooltip = `范围在最小值(${number.min}) ～ 最大值(${number.max})`
        return {
          number,
          tooltip,
        }
      } else {
        let number = {
          min: 1,
          max: resData.max_instance_number,
        }
        let tooltip = `范围在1 ～ 最大值(${number.max})`
        return {
          number,
          tooltip,
        }
      }
    },
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
    formatValues (values) {
      if (values.hourMinute) {
        values.cycleTimer['hour'] = values.hourMinute.hours()
        values.cycleTimer['minute'] = values.hourMinute.minutes()
        delete values.hourMinute
      }
      if (values.startEndTime && values.startEndTime.length > 0) {
        values.cycleTimer['startTime'] = values.startEndTime[0].set({
          hour: 0,
          minute: 0,
          second: 0,
        })
        values.cycleTimer['endTime'] = values.startEndTime[1].set({
          hour: 23,
          minute: 59,
          second: 59,
        })
        delete values.startEndTime
      }
      if (values.alarm) {
        values['alarm']['wrapper'] = 'average'
      }
      return values
    },
    async handleConfirm () {
      const manager = new this.$Manager('scalingpolicies', 'v1')
      const { validateFields } = this.form.fc
      const defaultParams = {
        unit: 's',
        scaling_group: this.params.resData.id,
      }
      try {
        const values = await validateFields()
        this.formatValues(values)
        this.loading = true
        await manager.create({
          data: Object.assign({}, defaultParams, this.formatValues(values)),
        })
        this.params.refresh()
        this.cancelDialog()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
