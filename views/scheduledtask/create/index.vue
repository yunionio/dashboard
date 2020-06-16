<template>
  <div>
    <page-header title="新建定时任务" />
    <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
      <a-form-item :label="`指定${$t('dictionary.project')}`" class="mt-3 mb-0" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input placeholder="请输入名称" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item label="触发频率">
        <a-radio-group v-decorator="decorators.cycle_type">
          <a-radio-button v-for="(v, k) in $t('cloudenv.ScheduledtaskGroupCycleType')" :key="k" :value="k">{{v}}</a-radio-button>
        </a-radio-group>
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
      <!-- 单次策略 -->
      <template v-if="form.fc.getFieldValue('cycleTimer.cycle_type') === 'one'">
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
      <!-- 非单次策略 -->
      <template v-if="form.fc.getFieldValue('cycleTimer.cycle_type') !== 'one'">
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
      <a-form-item label="资源类型">
        <a-select v-decorator="decorators.resourceType">
          <a-select-option v-for="(v, k) in $t('cloudenv.ScheduledtaskResourceType')" :key="k" :value="k">{{v}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="操作动作">
        <a-radio-group v-decorator="decorators.action">
          <a-radio-button v-for="(v, k) in $t('cloudenv.ScheduledtaskRuleAction')" :key="k" :value="k">{{v}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="绑定资源">
        <a-radio-group v-decorator="decorators.labelType">
          <a-radio-button v-for="(v, k) in $t('cloudenv.ScheduledtaskLabelType')" :key="k" :value="k">{{v}}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="指定虚拟机" v-if="form.fc.getFieldValue('labelType') === 'id'">
        <list-select
          v-decorator="decorators.servers"
          :list-props="serverProps"
          :multiple="true"
          :formatter="formatter" />
      </a-form-item>
      <a-form-item label="标签" class="mb-0" v-if="form.fc.getFieldValue('labelType') === 'tag'">
        <tag v-decorator="decorators.tag" extra="最多可绑定20个标签" />
      </a-form-item>
    </a-form>
    <page-footer>
      <template class="content" v-slot:right>
        <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
        <a-button @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import ServerPropsMixin from '../mixins/serverProps'
import Tag from '@/sections/Tag'
import DomainProject from '@/sections/DomainProject'
import ListSelect from '@/sections/ListSelect'
import { isRequired } from '@/utils/validate'

export default {
  name: 'ScheduledtaskCreateIndex',
  components: {
    DomainProject,
    Tag,
    ListSelect,
  },
  mixins: [ServerPropsMixin],
  data () {
    const validateTag = function (rule, value, callback) {
      if (R.is(Object, value) && Object.keys(value).length > 20) {
        return callback(new Error('标签不可超过20个'))
      }
      callback()
    }
    return {
      loading: false,
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
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
        resourceType: [
          'resourceType',
          {
            initialValue: 'server',
            rules: [
              { required: true, message: '请选择资源类型' },
            ],
          },
        ],
        action: [
          'action',
          {
            initialValue: 'start',
            rules: [
              { required: true, message: '请选择执行动作' },
            ],
          },
        ],
        labelType: [
          'labelType',
          {
            initialValue: 'id',
            rules: [
              { required: true, message: '请选择资源绑定' },
            ],
          },
        ],
        servers: [
          'servers',
          {
            rules: [
              { required: true, message: '请选择虚拟机' },
            ],
          },
        ],
        tag: [
          'tag',
          {
            // initialValue: { 'user:a': '3', 'user:b': '9' },
            rules: [
              { required: true, message: '请选择标签' },
              { validator: validateTag },
            ],
          },
        ],
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.hasOwnProperty('project')) {
              this.serverProps.list.getParams.tenant = values.project && values.project.key
            }
          },
        }),
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 21 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 3 },
          xxl: { span: 2 },
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
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
    generateData (values) {
      const { domain, project, name, action, labelType, servers, cycleTimer, resourceType } = values
      const params = {
        generate_name: name,
        resource_type: resourceType,
        project_domain: (domain && domain.key) || this.userInfo.projectDomainId,
        project_id: (project && project.key) || this.userInfo.projectId,
        operation: action,
        label_type: labelType,
      }
      if (cycleTimer.cycle_type === 'one') {
        params.scheduled_type = 'timing'
        params.timer = values.timer
      } else {
        params.scheduled_type = 'cycle'
        params.cycle_timer = { ...cycleTimer }
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
      if (labelType === 'id') {
        params.labels = servers
      } else if (labelType === 'tag') {
        const tags = Object.keys(values.tag).map((k) => {
          return `${k}:${values.tag[k]}`
        })
        params.labels = tags
      }
      return params
    },
    async handleConfirm () {
      const manager = new this.$Manager('scheduledtasks')
      try {
        const values = await this.form.fc.validateFields()
        this.loading = true
        await manager.create({
          data: this.generateData(values),
        })
        this.goBack()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    handleCancel () {
      this.goBack()
    },
    goBack () {
      this.$router.push('/scheduledtask')
    },
    formatter (val) {
      return `${val.name}`
    },
  },
}
</script>
