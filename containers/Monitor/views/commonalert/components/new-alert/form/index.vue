<template>
  <a-form v-bind="formItemLayout" :form="form.fc">
    <container-title :title="$t('monitor.commonalert.base_info')" />
    <scope-radio :decorators="decorators" @change="scopeChange" :form="form" :disabled="disabled" :label="label" />
    <a-form-item :label="$t('common.name')">
      <a-input v-decorator="decorators.name" :placeholder="$t('common.placeholder')" :disabled="disabled" />
    </a-form-item>
    <a-form-item :label="$t('common.description')">
      <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
    </a-form-item>
    <a-form-item :label="$t('monitor.text_97')">
      <base-select
        v-decorator="decorators.metric_res_type"
        :options="metricTypeOpts"
        filterable
        :disabled="disabled"
        :select-props="{ placeholder: $t('monitor.text_111'), loading }"
        @change="metricTypeHandle" />
    </a-form-item>
    <container-title :title="$t('monitor.commonalert.alarm_strategy')" />
    <a-form-item :label="$t('monitor.commonalert.alert_condition')">{{$t('monitor.commonalert.alert_condition.content')}}</a-form-item>
    <a-form-item :label="$t('monitor.commonalert.query_condition')" class="mb-0">
      <a-row :gutter="2">
        <a-col :span="6">
          <a-form-item>
            <base-select v-decorator="decorators.period" :options="preiodOpts" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item>
            <base-select v-decorator="decorators.alert_duration" :options="durationOpts" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item :label="$t('monitor.condition')">
      <condition
        ref="conditionRef"
        :decorators="decorators.condition"
        :res_type_measurements="res_type_measurements"
        :metric_res_type="form.fd.metric_res_type"
        :disabled="disabled"
        @metricChange="metricChangeHandle" />
    </a-form-item>
    <a-form-item :label="$t('monitor.monitor_filters')">
      <a-row>
        <a-col>
          <a-radio-group v-decorator="decorators.res_scope" @change="resScopeChangeHandle">
            <a-radio-button value="all">{{$t('monitor.commonalert.res_scope.all')}}</a-radio-button>
            <a-radio-button value="custom">{{$t('monitor.commonalert.res_scope.custom')}}</a-radio-button>
          </a-radio-group>
        </a-col>
      </a-row>
      <a-row class="mt-4" v-if="form.fd.res_scope === 'custom'">
        <filters
          :form="form"
          ref="filtersRef"
          :tags="tags"
          :disabled="disabled"
          :decorators="decorators.filters"
          @remove="$nextTick(toParams)"
          :loading="metricInfoLoading"
          :metricInfo="metricInfo" />
      </a-row>
    </a-form-item>
    <container-title :title="$t('monitor.commonalert.alarm_notify')" />
    <a-form-item :label="$t('monitor.commonalerts.form.column.silent')" class="mb-0">
      <a-form-item class="mr-1">
        <base-select v-decorator="decorators.silent_period" :options="silentOpts" style="display: inline-flex;" />
        <a-tooltip style="padding-left: 5px;" placement="top"><a-icon type="question-circle" />
        <template slot="title">
          <span>{{ $t('monitor.commonalerts.form.column.silent.tips') }}</span>
        </template>
        </a-tooltip>
      </a-form-item>
    </a-form-item>
    <a-form-item :label="$t('monitor.level')">
      <a-radio-group v-decorator="decorators.level">
        <a-radio-button v-for="item in levelOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('monitor.notification_type')">
      <a-checkbox-group v-decorator="decorators.notify_type">
        <a-checkbox value="recipient">{{ $t('monitor.recipient') }}</a-checkbox>
        <a-checkbox v-if="currentScope!=='project'" value="role">{{ $t('monitor.role') }}</a-checkbox>
        <a-checkbox value="robot">{{ $t('monitor.text_11') }}</a-checkbox>
      </a-checkbox-group>
    </a-form-item>
    <a-form-item v-if="notifyTypes.includes('recipient')" :label="$t('monitor.recipient')" style="white-space: nowrap;">
      <template #extra style="width: 1200px;" v-if="scope !== 'project'">
        <i18n tag="div" path="monitor_text00001">
          <help-link slot="new" href="/contact">{{$t('monitor.text_15')}}</help-link>
        </i18n>
      </template>
      <base-select
        v-decorator="decorators.recipients"
        optionLabelProp="label"
        resource="receivers"
        version="v1"
        filterable
        show-sync
        @change="contactArrOptsChange"
        :resList.sync="recipientOpts"
        :select-props="{ mode: 'multiple', placeholder: $t('common.tips.select', [$t('monitor.recipient')]) }"
        :params="contactParams" />
    </a-form-item>
    <a-form-item v-if="contactArrAllOpts && contactArrAllOpts.length > 0" :label="$t('monitor.channel')">
      <a-checkbox-group
        v-decorator="decorators.channel">
        <a-checkbox
          v-for="v in contactArrAllOpts"
          :key="v.label"
          :value="v.value"
          :disabled="v.disabled">
          <template v-if="v.disabled">
            <a-tooltip placement="top">
              <template slot="title">
               {{$t('monitor.commonalerts.channel.disable.tips', [v.label])}}
              </template>
              {{ v.label }}
            </a-tooltip>
          </template>
          <template v-else>
            {{ v.label }}
          </template>
        </a-checkbox>
      </a-checkbox-group>
    </a-form-item>
    <a-form-item v-if="notifyTypes.includes('role') && currentScope!=='project'" :label="$t('monitor.role')">
      <base-select
        v-decorator="decorators.roles"
        resource="roles"
        version="v1"
        filterable
        show-sync
        :select-props="{ mode: 'multiple', placeholder: $t('common.tips.select', [$t('monitor.role')]) }"
        :params="rolesParams" />
    </a-form-item>
    <notify-types
      v-if="notifyTypes.includes('robot')"
      :label="$t('monitor.text_11')"
      :placeholder="$t('common.tips.select', [$t('monitor.text_11')])"
      :decorator="decorators.robot_ids"
      :getParams="robotParams" />
  </a-form>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import Filters from '@Monitor/sections/Filters'
import ScopeRadio from '@/sections/ScopeRadio'
import { levelMaps, preiodMaps } from '@Monitor/constants'
import { resolveValueChangeField } from '@/utils/common/ant'
import NotifyTypes from '@/sections/NotifyTypes'
import workflowMixin from '@/mixins/workflow'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import Condition from './Condition'

export default {
  name: 'CommonalertForm',
  components: {
    ScopeRadio,
    Filters,
    Condition,
    NotifyTypes,
  },
  provide: function () {
    return {
      form: this.form,
    }
  },
  mixins: [workflowMixin],
  props: {
    formItemLayout: {
      type: Object,
      default: () => ({
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      }),
    },
    alertData: {},
    timeRangeParams: {
      type: Object,
      default: () => ({}),
    },
    commonalertId: {
      type: String,
    },
    isUpdate: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    let tags = []
    const initialValue = {
      period: '5m',
      comparator: '>=',
      alert_duration: 2,
      silent_period: '360m',
      reduce: 'avg',
      level: 'normal',
      scope: this.$store.getters.scope,
      recipients: [],
      robot_ids: [],
      channel: ['webconsole'],
      notifyTypes: [],
    }
    if (this.commonalertId) {
      initialValue.name = this.alertData.name
      initialValue.period = this.alertData.period
      initialValue.level = this.alertData.level
      initialValue.domain = this.alertData.domain_id
      initialValue.project = this.alertData.tenant_id
      initialValue.silent_period = this.alertData.silent_period
      initialValue.res_type = _.get(this.alertData, 'common_alert_metric_details[0].res_type')
      tags = _.get(this.alertData, 'common_alert_metric_details[0].filters') || []

      if (this.alertData.robot_ids && this.alertData.robot_ids.length) {
        initialValue.robot_ids = this.alertData.robot_ids
        initialValue.notifyTypes.push('robot')
      }
      if (this.alertData.recipients && this.alertData.recipients.length) {
        initialValue.recipients = this.alertData.recipients
        initialValue.notifyTypes.push('recipient')
      }
      if (this.alertData.role_ids && this.alertData.role_ids.length) {
        initialValue.roles = this.alertData.role_ids
        initialValue.notifyTypes.push('role')
      }
      if (this.alertData.channel && this.alertData.channel.length) {
        if (this.alertData.channel.indexOf('webconsole') < 0) {
          initialValue.channel.push(...this.alertData.channel.filter((c) => !c.endsWith('robot')))
        } else {
          initialValue.channel = this.alertData.channel.filter((c) => !c.endsWith('robot'))
        }
      }
      if (!initialValue.project && !initialValue.domain) {
        initialValue.scope = 'system'
      }
      if (this.alertData.alert_duration) initialValue.alert_duration = this.alertData.alert_duration
      if (!initialValue.project && initialValue.domain) {
        initialValue.scope = 'domain'
      }
      if (initialValue.project) {
        initialValue.scope = 'project'
      }
    }

    if (!initialValue.notifyTypes.length) {
      initialValue.notifyTypes.push('recipient')
    }
    return {
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.onValuesChange,
        }),
        fd: {
          notify_type: initialValue.notifyTypes,
        },
      },
      formScopeParams: {
        scope: initialValue.scope,
      },
      decorators: {
        scope: [
          'scope',
          {
            initialValue: initialValue.scope,
          },
        ],
        domain: [
          'domain',
          {
            initialValue: initialValue.domain,
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: initialValue.project,
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: initialValue.name,
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
            ],
          },
        ],
        description: ['description'],
        metric_res_type: [
          'metric_res_type',
          {
            initialValue: initialValue.res_type,
            rules: [
              { required: true, message: this.$t('monitor.text_111') },
            ],
          },
        ],
        res_scope: [
          'res_scope',
          {
            initialValue: 'all',
          },
        ],
        condition: {
          metric_key: i => [
            `metric_key[${i}]`,
            {
              initialValue: initialValue.metric_key,
              rules: [
                { required: true, message: this.$t('monitor.text_112') },
              ],
            },
          ],
          metric_value: i => [
            `metric_value[${i}]`,
            {
              initialValue: initialValue.metric_value,
              rules: [
                { required: true, message: this.$t('monitor.text_113') },
              ],
            },
          ],
          reduce: i => [
            `reduce[${i}]`,
            {
              initialValue: initialValue.reduce,
              rules: [
                { required: true, message: this.$t('common.select') },
              ],
            },
          ],
          comparator: i => [
            `comparator[${i}]`,
            {
              initialValue: initialValue.comparator,
              rules: [
                { required: true, message: this.$t('common.select') },
              ],
            },
          ],
          threshold: i => [
            `threshold[${i}]`,
            {
              initialValue: initialValue.threshold || 1,
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('monitor.commonalert.threshold.message') },
                {
                  validator: (rule, value, callback) => {
                    if (!(/^\d+(\.\d+)?$/.test(value))) {
                      callback(this.$t('monitor.validate_number'))
                    }
                    callback()
                  },
                },
              ],
            },
          ],
          threshold_start: i => [
            `threshold_start[${i}]`,
            {
              initialValue: initialValue.threshold_start || 1,
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('monitor.commonalert.threshold.message') },
                {
                  validator: (rule, value, callback) => {
                    if (!(/^\d+(\.\d+)?$/.test(value))) {
                      callback(this.$t('monitor.validate_number'))
                      return
                    }
                    const endValue = this.form.fc.getFieldValue(`threshold_end[${i}]`)
                    if (endValue !== undefined && endValue !== null && endValue !== '') {
                      const start = parseFloat(value)
                      const end = parseFloat(endValue)
                      if (!isNaN(start) && !isNaN(end) && start >= end) {
                        callback(this.$t('monitor.commonalert.threshold_start_lt_end'))
                        return
                      }
                    }
                    callback()
                  },
                },
              ],
            },
          ],
          threshold_end: i => [
            `threshold_end[${i}]`,
            {
              initialValue: initialValue.threshold_end || 2,
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('monitor.commonalert.threshold.message') },
                {
                  validator: (rule, value, callback) => {
                    if (!(/^\d+(\.\d+)?$/.test(value))) {
                      callback(this.$t('monitor.validate_number'))
                      return
                    }
                    const startValue = this.form.fc.getFieldValue(`threshold_start[${i}]`)
                    if (startValue !== undefined && startValue !== null && startValue !== '') {
                      const start = parseFloat(startValue)
                      const end = parseFloat(value)
                      if (!isNaN(start) && !isNaN(end) && end <= start) {
                        callback(this.$t('monitor.commonalert.threshold_end_gt_start'))
                        return
                      }
                    }
                    callback()
                  },
                },
              ],
            },
          ],
        },
        filters: {
          tagCondition: i => [
            `tagConditions[${i}]`,
            {
              initialValue: 'AND',
              rules: [
                { required: true, message: this.$t('common.select') },
              ],
            },
          ],
          tagKey: i => [
            `tagKeys[${i}]`,
            {
              rules: [
                { required: true, message: this.$t('monitor.text_109') },
              ],
            },
          ],
          tagOperator: i => [
            `tagOperators[${i}]`,
            {
              initialValue: '=',
              rules: [
                { required: true, message: this.$t('common.select') },
              ],
            },
          ],
          tagValue: i => [
            `tagValues[${i}]`,
            {
              rules: [
                { required: true, message: this.$t('monitor.text_110') },
              ],
            },
          ],
        },
        period: [
          'period',
          {
            initialValue: initialValue.period,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        alert_duration: [
          'alert_duration',
          {
            initialValue: initialValue.alert_duration,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        silent_period: [
          'silent_period',
          {
            initialValue: initialValue.silent_period,
            rules: [],
          },
        ],
        level: [
          'level',
          {
            initialValue: initialValue.level,
          },
        ],
        notify_type: [
          'notify_type',
          {
            initialValue: initialValue.notifyTypes || [],
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('monitor.notification_type')]) },
            ],
          },
        ],
        roles: [
          'roles',
          {
            initialValue: initialValue.roles || [],
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('monitor.role')]) },
            ],
          },
        ],
        recipients: [
          'recipients',
          {
            initialValue: initialValue.recipients || [],
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('monitor.recipient')]) },
            ],
          },
        ],
        robot_ids: [
          'robot_ids',
          {
            initialValue: initialValue.robot_ids || [],
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('monitor.text_11')]) },
            ],
          },
        ],
        channel: [
          'channel',
          {
            initialValue: initialValue.channel || [],
          },
        ],
      },
      tags,
      oldParams: {},
      metricInfo: {},
      conditionUnit: '',
      metricKeyItem: {},
      contactParams: {
        with_meta: true,
        limit: 0,
        enabled: true,
      },
      levelOpts: Object.values(levelMaps),
      silentOpts: [
        { key: '5m', label: this.$t('monitor.duration.silent.minute', [5]) },
        { key: '10m', label: this.$t('monitor.duration.silent.minute', [10]) },
        { key: '15m', label: this.$t('monitor.duration.silent.minute', [15]) },
        { key: '30m', label: this.$t('monitor.duration.silent.minute', [30]) },
        { key: '60m', label: this.$t('monitor.duration.silent.hour', [1]) },
        { key: '120m', label: this.$t('monitor.duration.silent.hour', [2]) },
        { key: '180m', label: this.$t('monitor.duration.silent.hour', [3]) },
        { key: '360m', label: this.$t('monitor.duration.silent.hour', [6]) },
        { key: '720m', label: this.$t('monitor.duration.silent.hour', [12]) },
        { key: '1440m', label: this.$t('monitor.duration.silent.hour', [24]) },
      ],
      preiodOpts: Object.values(preiodMaps),
      durationOpts: [
        { key: 1, label: this.$t('monitor.duration.label', [1]) },
        { key: 2, label: this.$t('monitor.duration.label', [2]) },
        { key: 3, label: this.$t('monitor.duration.label', [3]) },
        { key: 6, label: this.$t('monitor.duration.label', [6]) },
        { key: 12, label: this.$t('monitor.duration.label', [12]) },
        { key: 24, label: this.$t('monitor.duration.label', [24]) },
        { key: 48, label: this.$t('monitor.duration.label', [48]) },
        { key: 96, label: this.$t('monitor.duration.label', [96]) },
      ],
      projectItem: {},
      metricLoading: false,
      metricInfoLoading: false,
      recipientOpts: [],
      contactArrOpts: [],
      res_type_measurements: {},
      res_types: [],
      currentScope: initialValue.scope,
      notifyTypes: initialValue.notifyTypes,
      label: this.$t('monitor.text00015'),
      isFirstMetricChange: this.isUpdate,
      conditionMap: new Map(),
    }
  },
  computed: {
    ...mapGetters(['isDomainMode', 'scope']),
    disabled () {
      return this.$route.query.alertType === 'system' && this.isUpdate
    },
    showResType () {
      if (this.alertData && this.alertData.alert_type === 'system') {
        const { initialValue } = this.decorators.metric_res_type[1]
        if (!initialValue) {
          return false // 如果是默认策略并且资源类型没有默认值的话，不显示
        }
      }
      return true
    },
    rolesParams () {
      return {
        scope: this.currentScope,
        limit: 0,
      }
    },
    robotParams () {
      if (this.currentScope === 'project' && this.formScopeParams.project_id) {
        return {
          scope: this.currentScope,
          project_id: this.formScopeParams.project_id,
        }
      }
      if (this.currentScope === 'domain' && this.formScopeParams.domain_id) {
        return {
          scope: this.currentScope,
          project_domain_id: this.formScopeParams.domain_id,
        }
      }
      return { scope: this.currentScope }
    },
    metricTypeOpts () {
      return this.res_types.map(val => {
        const label = this.$t(`dictionary.${val}`)
        return {
          key: val,
          label,
        }
      })
    },
    contactArrAllOpts () {
      const ret = []
      if (this.checkWorkflowEnabled(WORKFLOW_TYPES.ALERT_EVENT)) {
        ret.push({
          value: 'alert_event',
          label: this.$t('common.workflow.alert_event'),
          disabled: false,
        })
      }
      if (this.checkWorkflowEnabled(WORKFLOW_TYPES.ALERT_TICKET)) {
        ret.push({
          value: 'alert_ticket',
          label: this.$t('common.workflow.alert_ticket'),
          disabled: false,
        })
      }
      return [...this.contactArrOpts, ...ret]
    },
  },
  watch: {
    timeRangeParams () {
      this.getMeasurement(this.formScopeParams)
    },
    recipientOpts (val) {
      if (!this.alertData && val) {
        if (val.length === 1) {
          this.form.fc.setFieldsValue({
            [this.decorators.recipients[0]]: [val[0].id],
          })
          this.contactArrOptsChange([val[0].id])
        } else if (val.length > 1) {
          const currentUser = this.$store.getters.userInfo.id
          const hasCurrentUser = val.find(val => val.id === currentUser)
          if (hasCurrentUser) {
            this.form.fc.setFieldsValue({
              [this.decorators.recipients[0]]: [hasCurrentUser.id],
            })
            this.contactArrOptsChange([hasCurrentUser.id])
          }
        }
      }
      if (this.alertData) {
        this.contactArrOptsChange(this.alertData.recipients)
      }
    },
    contactArrOpts () {
      const ect = this.form.fc.getFieldValue('channel')
      if (ect) {
        let newContactTypes = this.contactArrAllOpts.filter((c) => { return ect.indexOf(c.value) >= 0 }).map((c) => c.value)
        if (newContactTypes.length === 0) {
          newContactTypes = ['webconsole']
        }
        this.form.fc.setFieldsValue({ channel: newContactTypes })
      }
    },
  },
  created () {
    const scope = this.formScopeParams.scope
    const params = {
      scope,
    }
    if (scope !== 'system' && this.decorators[scope][1].initialValue) {
      params[`${scope}_id`] = this.decorators[scope][1].initialValue
    }
    this.formScopeParams = params
    this.scopeChange(params)
    this.initContactParams(this.contactParams)
  },
  mounted () {
    if (this.commonalertId) {
      this.initResType()
    } else {
      this.$refs.conditionRef.add()
    }
  },
  methods: {
    initResType () {
      this.form.fd.metric_res_type = this.alertData.common_alert_metric_details[0].res_type
    },
    initCondition () {
      const metric_details = this.alertData.common_alert_metric_details
      const conditionRef = this.$refs.conditionRef
      conditionRef.reset(false)
      metric_details.forEach((item, idx) => {
        conditionRef.add()
        this.$nextTick(() => {
          const conditionList = conditionRef.conditionList
          this.form.fc.setFieldsValue({
            [`metric_key[${conditionList[idx].key}]`]: item.measurement,
            [`reduce[${conditionList[idx].key}]`]: item.reduce,
            [`comparator[${conditionList[idx].key}]`]: item.comparator,
          })
          conditionRef.metricKeyChange(item.measurement, { key: conditionList[idx].key })
          this.form.fc.setFieldsValue({
            [`metric_value[${conditionList[idx].key}]`]: item.field,
          })
          conditionRef.metricValueChange(item.field, { key: conditionList[idx].key })
          setTimeout(() => {
            const comparator = item.comparator
            if (comparator === 'within_range' || comparator === 'outside_range') {
              // 范围类型：从 threshold_range 读取数据
              let thresholdArray = []
              if (Array.isArray(item.threshold_range) && item.threshold_range.length >= 2) {
                thresholdArray = item.threshold_range
              } else if (item.threshold_start !== undefined && item.threshold_end !== undefined) {
                thresholdArray = [item.threshold_start, item.threshold_end]
              } else if (Array.isArray(item.threshold) && item.threshold.length >= 2) {
                thresholdArray = item.threshold
              } else if (item.threshold !== undefined) {
                // 兼容处理：如果只有 threshold，则拆分成数组
                thresholdArray = [item.threshold, item.threshold]
              } else {
                thresholdArray = [1, 2]
              }
              this.form.fc.setFieldsValue({
                [`threshold[${conditionList[idx].key}]`]: thresholdArray,
                [`threshold_start[${conditionList[idx].key}]`]: thresholdArray[0],
                [`threshold_end[${conditionList[idx].key}]`]: thresholdArray[1],
              })
            } else {
              this.form.fc.setFieldsValue({
                [`threshold[${conditionList[idx].key}]`]: item.threshold,
              })
            }
          }, 100)
        })
      })
    },
    initFilter () {
      const { filters = [] } = this.alertData.common_alert_metric_details[0]
      this.form.fc.setFieldsValue({
        res_scope: filters.length > 0 ? 'custom' : 'all',
      })
    },
    contactArrOptsChange (rs) {
      const getLabel = (val) => {
        if (val === 'mobile') val = 'message' // mobile 应该翻译为 短信
        if (this.$t(`common.${val}`)) {
          return this.$t(`common.${val}`)
        }
        return val
      }
      if (rs) {
        const ect = this.recipientOpts.filter((opt) => {
          return rs.indexOf(opt.id) >= 0
        }).map((opt) => {
          return opt.enabled_contact_types
        })
        this.contactArrOpts = _.intersection(...ect).map((c) => {
          return {
            value: c,
            label: getLabel(c),
            disabled: c === 'webconsole',
          }
        })
      }
    },
    scopeChange (scopeParams) {
      this.getMeasurement(scopeParams)
      this.$emit('scopeChange', scopeParams)
      this.currentScope = scopeParams.scope
    },
    async getMeasurement (params = {}) {
      try {
        this.metricLoading = true
        this.formScopeParams = params
        const { data: { res_type_measurements, res_types } } = await new this.$Manager('unifiedmonitors', 'v1').get({ id: 'measurements', params: { ...params, ...this.timeRangeParams } })
        this.res_type_measurements = res_type_measurements
        this.res_types = res_types
        if (R.is(Object, this.alertData)) {
          this.toParams()
        }
        if (this.commonalertId) {
          this.initCondition()
          this.initFilter()
        }
        this.metricLoading = false
      } catch (error) {
        this.metricLoading = false
        throw error
      }
    },
    async validate () {
      const metric_query = this.toParams(false)
      const fd = await this.form.fc.validateFields()
      if (this.projectItem && this.projectItem.domain_id) fd.domain_id = this.projectItem.domain_id
      return {
        metric_query,
        fd,
      }
    },
    onValuesChange (props, values) {
      const newField = resolveValueChangeField(values)
      R.forEachObjIndexed((item, key) => {
        if (R.is(Object, this.form.fd[key]) && R.is(Object, item)) {
          this.$set(this.form.fd, key, { ...this.form.fd[key], ...item })
        } else {
          this.$set(this.form.fd, key, item)
        }
      }, newField)
      this.$nextTick(this.toParams)
      if (newField.hasOwnProperty('notify_type')) {
        this.notifyTypes = newField.notify_type
      }
    },
    metricChangeHandle (metricMap) {
      const conditionList = this.$refs.conditionRef.conditionList
      const firstMetricKey = conditionList[0].key
      const firstMetric = metricMap[firstMetricKey]
      this.getMetricInfo(firstMetric)
    },
    async getMetricInfo ({ metricKey, mertric, mertricItem, metricKeyItem }) {
      try {
        this.metricKeyItem = metricKeyItem || {}
        this.conditionUnit = _.get(mertricItem, 'description.unit') || ''
        const scopeFormValues = this.form.fc.getFieldsValue([this.decorators.scope[0], this.decorators.domain[0], this.decorators.project[0]])
        const scopeParams = {}
        for (const k in scopeFormValues) {
          if (scopeFormValues[k]) {
            if (k === this.decorators.scope[0]) {
              scopeParams[k] = scopeFormValues[k]
            } else {
              scopeParams[`${k}_id`] = scopeFormValues[k]
            }
          }
        }
        const params = {
          database: this.metricKeyItem.database || _.get(this.alertData, 'common_alert_metric_details[0].db', 'telegraf'),
          measurement: metricKey,
          field: mertric,
          ...scopeParams,
          ...this.timeRangeParams,
        }
        this.metricInfoLoading = true
        const { data } = await new this.$Manager('unifiedmonitors', 'v1').get({ id: 'metric-measurement', params })
        if (metricKey === 'cloudaccount_balance' && !this.isFirstMetricChange) {
          const { tag_key = [], tag_value = {} } = data
          if (tag_key.includes('currency') && tag_value.currency && tag_value.currency.length) {
            this.tags = [{ key: 'currency', value: tag_value.currency[0], operator: '=' }]
          }
        }
        this.isFirstMetricChange = false
        this.metricInfo = data
        this.metricInfoLoading = false
      } catch (error) {
        this.metricInfo = {
          field_key: [],
          func: {},
          tag_key: [],
          tag_value: {},
        }
        const params = this.toParams()
        this.$emit('paramsChange', params)
        this.metricInfoLoading = false
        throw error
      }
    },
    toParams () {
      const fd = this.form.fc.getFieldsValue()
      const metric_query = []
      const conditionList = this.$refs.conditionRef.conditionList
      conditionList.forEach(({ key }) => {
        const params = {
          from: '24h',
        }
        const model = {
          database: this.metricKeyItem.database || _.get(this.alertData, 'common_alert_metric_details[0].db', 'telegraf'),
        }
        const tags = []
        if (fd.metric_key[key]) model.measurement = fd.metric_key[key]
        if (fd.reduce[key]) params.reduce = fd.reduce[key]
        if (fd.comparator[key]) {
          params.comparator = fd.comparator[key]
          if (params.comparator === 'nodata') {
            params.condition_type = 'nodata_query'
          } else if (params.comparator === 'within_range' || params.comparator === 'outside_range') {
            params.threshold_range = [fd.threshold_start[key] || fd.threshold[key], fd.threshold_end[key] || fd.threshold[key]]
          } else {
            // 非范围类型：threshold 是单个值
            if (fd.threshold && fd.threshold[key]) {
              params.threshold = fd.threshold[key]
            }
          }
        } else {
          if (fd.threshold && fd.threshold[key]) {
            params.threshold = fd.threshold[key]
          }
        }
        if (fd.metric_value[key]) model.select = [[{ type: 'field', params: [fd.metric_value[key]] }]]
        if (R.is(Object, fd.tagValues)) {
          R.forEachObjIndexed((value, key) => {
            if (value) {
              const tag = {
                key: fd.tagKeys[key],
                value,
                operator: fd.tagOperators[key],
              }
              if (fd.tagConditions && fd.tagConditions[key]) {
                tag.condition = fd.tagConditions[key]
              }
              tags.push(tag)
            }
          }, fd.tagValues)
        }
        if (tags.length) {
          model.tags = tags
        }
        if (fd.group_by) {
          // eslint-disable-next-line no-template-curly-in-string
          params.group_by = [{ type: 'tag', params: [fd.group_by] }]
        }
        if (params.select && R.is(String, fd.function)) {
          model.select[0].push({ type: fd.function.toLowerCase(), params: [] })
        }
        params.model = model
        metric_query.push(params)
      })
      return metric_query
    },
    initContactParams (contactParams) {
      contactParams.scope = this.scope
      if (this.isDomainMode) {
        contactParams.project_domain_filter = true
      }
    },
    resScopeChangeHandle () {
      this.$nextTick(() => {
        if (this.$refs.filtersRef) {
          this.$refs.filtersRef.reset()
        }
      })
    },
    metricTypeHandle () {
      if (this.$refs.conditionRef) {
        this.$refs.conditionRef.reset()
      }
      if (this.$refs.filtersRef) {
        this.$refs.filtersRef.reset()
        this.metricInfo = {}
      }
    },
  },
}
</script>
