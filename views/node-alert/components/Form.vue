<template>
  <a-form :form="form.fc" style="wdith: 400px;">
    <a-form-item :label="$t('compute.text_732')" v-bind="formItemLayout">
      <a-select v-decorator="decorators.metric" :disabled="metricDisabled" @change="metricChange">
        <a-select-option v-for="item in metricOpts" :key="item.key" :value="item.key">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('compute.text_733')" v-bind="formItemLayout">
      <a-input-number v-decorator="decorators.window" :min="windowMin" />{{$t('compute.text_734')}}</a-form-item>
    <a-form-item :label="$t('compute.text_735')" v-bind="formItemLayout">
      <a-select v-decorator="decorators.comparator">
        <a-select-option v-for="item in comparatorOpts" :key="item.key" :value="item.key">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('compute.text_736')" v-bind="formItemLayout">
      <a-input type="number" :min="0" v-decorator="[
          'threshold',
          {
            initialValue: fdInitailValue.threshold,
            normalize: value => {
              if (R.isNil(value) || R.isEmpty(value)) return undefined
              return Number(value)
            },
            rules: [
              { required: true, message: $t('compute.text_737') },
              ...thresholdRules
            ]
          }
        ]">
        <div slot="addonAfter" v-if="thresholdUnit">{{ thresholdUnit }}</div>
      </a-input>
    </a-form-item>
    <a-form-item :label="$t('monitor.level')" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.level">
        <a-radio-button v-for="item in levelOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('compute.text_739')" v-bind="formItemLayout">
      <a-select v-decorator="decorators.channel">
        <a-select-option v-for="item in channelOpts" :key="item.key" :value="item.key">
          {{ item.label }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('compute.text_740')" v-bind="formItemLayout">
      <a-spin v-show="!recipientsLoaded" />
      <base-select
        v-show="recipientsLoaded"
        v-decorator="decorators.recipients"
        class="w-100"
        :filterable="true"
        needParams
        resource="users"
        version="v1"
        :params="recipientParams"
        :resList.sync="recipientOpts"
        :initLoaded.sync="recipientsLoaded"
        :select-props="{ placeholder: $t('compute.text_741'), allowClear: true, mode: 'multiple' }" />
    </a-form-item>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import { LEVEL_CN } from '@Compute/views/node-alert/constants'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'NodeAlertForm',
  props: {
    metricOpts: {
      type: Array,
      // required: true,
    },
    alertType: {
      type: String,
      required: true,
      validator: val => ['guest', 'host'].includes(val),
    },
    hypervisor: {
      type: String,
    },
    fdInitailValue: { // 表单初始化数据
      type: Object,
      default: () => {
        return {
          window: 5,
          comparator: '>=',
          level: 'normal',
          channel: 'email',
        }
      },
    },
    monitorMetric: {
      type: String,
    },
  },
  data () {
    const metric = this.monitorMetric || this.fdInitailValue.metric || this.metricOpts[0].key
    return {
      form: {
        fc: this.$form.createForm(this),
      },
      metric,
      recipientsLoaded: false, // 报警接收人是否加载完成
      decorators: {
        metric: [
          'metric',
          {
            initialValue: metric,
            rules: [
              { required: true, message: this.$t('compute.text_742') },
            ],
          },
        ],
        window: [
          'window',
          {
            initialValue: this.fdInitailValue.window,
          },
        ],
        comparator: [
          'comparator',
          {
            initialValue: this.fdInitailValue.comparator,
          },
        ],
        // threshold 是动态表单规则，需在 template 里面写
        level: [
          'level',
          {
            initialValue: this.fdInitailValue.level,
          },
        ],
        channel: [
          'channel',
          {
            initialValue: this.fdInitailValue.channel,
          },
        ],
        recipients: [
          'recipients',
          {
            initialValue: this.fdInitailValue.recipients,
            rules: [
              { required: true, message: this.$t('compute.text_742'), type: 'array' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      comparatorOpts: [
        { key: '>=', label: '>=' },
        { key: '<=', label: '<=' },
        // { key: '=', label: '=' },
        // { key: '!=', label: '!=' }
      ],
      levelOpts: [
        { key: 'normal', label: LEVEL_CN.normal.label },
        { key: 'important', label: LEVEL_CN.important.label },
        { key: 'fatal', label: LEVEL_CN.fatal.label },
      ],
      channelOpts: [
        { key: 'email', label: this.$t('compute.text_743') },
        // { key: 'moblie', label: '短信' },
        // { key: 'dingtalk', label: '钉钉通知' }
      ],
      recipientOpts: [], // 由 base-select 组件同步出来
      thresholdRules: [], // threshold 的规则
      windowMin: 5,
      R,
    }
  },
  computed: {
    domainParams () {
      // if (this.$store.getters.isAdminMode) {
      //   return {}
      // }
      return {
        scope: this.$store.getters.scope,
      }
    },
    metricDisabled () {
      return R.is(String, this.fdInitailValue.metric) || R.is(String, this.monitorMetric) // 外部传递 metric 或者是 监控指标 则监控项不可变
    },
    thresholdUnit () {
      if (this.metric) {
        const metricItem = this.metricOpts.find(val => val.key === this.metric)
        if (metricItem && metricItem.unit) return metricItem.unit
      }
      return ''
    },
    recipientParams () {
      const params = {
        is_system_account: false,
        ...this.domainParams,
      }
      return params
    },
  },
  created () {
    this.getThresholdRules(this.metric)
    this.getWindowRules()
  },
  methods: {
    metricChange (val) {
      this.metric = val
      this.getThresholdRules(val)
      this.$nextTick(() => {
        this.form.fc.validateFields(['threshold'], { force: true }) // 动态校验规则
      })
    },
    getThresholdRules (metric) {
      let rules = []
      const metricObj = this.metricOpts.find(item => item.key === this.metric)
      if (metricObj && metricObj.rules) {
        rules = metricObj.rules
      }
      this.thresholdRules = rules
    },
    getWindowRules () {
      let min = 5
      if (this.alertType === 'host') {
        min = 10
      }
      if (this.hypervisor) {
        const platform = findPlatform(this.hypervisor, 'hypervisor')
        if (platform === 'public') {
          min = 10
        }
      }
      this.windowMin = min
    },
    async validateForm () {
      try {
        const values = await this.form.fc.validateFields()
        return values
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
