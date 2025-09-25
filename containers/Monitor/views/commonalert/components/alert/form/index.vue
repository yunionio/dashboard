<template>
  <a-form v-bind="formItemLayout" :form="form.fc">
    <scope-radio :decorators="decorators" @change="scopeChange" :form="form" :disabled="disabled" :label="label" />
    <a-form-item :label="$t('common.name')">
      <a-input v-decorator="decorators.name" :placeholder="$t('common.placeholder')" :disabled="disabled" />
    </a-form-item>
    <a-form-item :label="$t('common.description')">
      <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
    </a-form-item>
    <a-form-item :label="$t('monitor.monitor_metric')" class="mb-0">
      <metric
        :form="form"
        :decorators="decorators"
        :res_types="res_types"
        :res_type_measurements="res_type_measurements"
        :disabled="disabled"
        :loading="metricLoading"
        :showResType="showResType"
        @metricClear="resetMetric"
        @metricChange="getMetricInfo" />
    </a-form-item>
    <a-form-item :label="$t('monitor.monitor_filters')">
      <filters
        :form="form"
        ref="filtersRef"
        :tags="tags"
        :disabled="disabled"
        :decorators="decorators.filters"
        @remove="$nextTick(toParams)"
        :loading="metricInfoLoading"
        :metricInfo="metricInfo" />
    </a-form-item>
    <a-form-item :label="$t('monitor.condition')" class="mb-0">
      <condition :decorators="decorators" :disabled="disabled" @comparatorChange="emitComparator"  @thresholdChange="emitThreshold" :unit="metricInfo.measurement === 'cloudaccount_balance' ? '' : conditionUnit" />
    </a-form-item>
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
        :select-props="{ mode: 'multiple', placeholder: $t('compute.text_741') }"
        :params="contactParams" />
    </a-form-item>
    <a-form-item v-if="notifyTypes.includes('recipient')" :label="$t('monitor.channel')">
      <a-checkbox-group
        v-decorator="decorators.channel">
        <a-checkbox
          v-for="v in contactArrOpts"
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
        :select-props="{ mode: 'multiple', placeholder: $t('compute.text_741') }"
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
import Metric from '@Monitor/sections/Metric'
import Filters from '@Monitor/sections/Filters'
import ScopeRadio from '@/sections/ScopeRadio'
import { levelMaps, metric_zh } from '@Monitor/constants'
import { resolveValueChangeField } from '@/utils/common/ant'
import NotifyTypes from '@/sections/NotifyTypes'
import Condition from './Condition'

export default {
  name: 'CommonalertForm',
  components: {
    ScopeRadio,
    Metric,
    Filters,
    Condition,
    NotifyTypes,
  },
  provide: function () {
    return {
      form: this.form,
    }
  },
  props: {
    formItemLayout: {
      type: Object,
      default: () => ({
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      }),
    },
    alertData: {},
    timeRangeParams: {
      type: Object,
      default: () => ({}),
    },
    isUpdate: Boolean,
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
    if (R.is(Object, this.alertData)) {
      initialValue.name = this.alertData.name
      initialValue.period = this.alertData.period
      initialValue.level = this.alertData.level
      initialValue.domain = this.alertData.domain_id
      initialValue.project = this.alertData.tenant_id
      initialValue.silent_period = this.alertData.silent_period
      initialValue.res_type = _.get(this.alertData, 'common_alert_metric_details[0].res_type')
      tags = _.get(this.alertData, 'settings.conditions[0].query.model.tags') || []
      initialValue.metric_key = _.get(this.alertData, 'settings.conditions[0].query.model.measurement')
      initialValue.metric_value = _.get(this.alertData, 'settings.conditions[0].query.model.select[0][0].params[0]')
      initialValue.threshold = _.get(this.alertData, 'settings.conditions[0].evaluator.params[0]')
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

      initialValue.comparator = _.get(this.alertData, 'common_alert_metric_details[0].comparator')
      if (initialValue.comparator === 'lt') initialValue.comparator = '<='
      if (initialValue.comparator === 'gt') initialValue.comparator = '>='
      if (!initialValue.project && !initialValue.domain) {
        initialValue.scope = 'system'
      }
      const reduce = _.get(this.alertData, 'common_alert_metric_details[0].reduce')
      if (reduce) initialValue.reduce = reduce
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
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        metric_key: [
          'metric_key',
          {
            initialValue: initialValue.metric_key,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        metric_value: [
          'metric_value',
          {
            initialValue: initialValue.metric_value,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
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
                // { required: true, message: this.$t('common.select') },
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
                // { required: true, message: this.$t('common.select') },
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
        reduce: [
          'reduce',
          {
            initialValue: initialValue.reduce,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        comparator: [
          'comparator',
          {
            initialValue: initialValue.comparator,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        threshold: [
          'threshold',
          {
            initialValue: initialValue.threshold,
            rules: [
              { required: true, message: this.$t('common.placeholder') },
            ],
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
            initialValue: initialValue.notifyTypes,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        roles: [
          'roles',
          {
            initialValue: initialValue.roles,
          },
        ],
        recipients: [
          'recipients',
          {
            initialValue: initialValue.recipients,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        robot_ids: [
          'robot_ids',
          {
            initialValue: initialValue.robot_ids,
          },
        ],
        channel: [
          'channel',
          {
            initialValue: initialValue.channel,
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
    }
  },
  computed: {
    ...mapGetters(['isDomainMode', 'scope']),
    disabled () {
      return this.$route.query.alertType === 'system'
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
          project_id: this.formScopeParams.project_id,
        }
      }
      return {}
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
        let newContactTypes = this.contactArrOpts.filter((c) => { return ect.indexOf(c.value) >= 0 }).map((c) => c.value)
        if (newContactTypes.length === 0) {
          newContactTypes = ['webconsole']
        }
        this.form.fc.setFieldsValue({ channel: newContactTypes })
      }
    },
    res_type_measurements () {
      if (!this.conditionUnit || this.conditionUnit === '') {
        const data = this.form.fc.getFieldsValue([this.decorators.metric_res_type[0], this.decorators.metric_key[0], this.decorators.metric_value[0]])
        if (!this.res_type_measurements) {
          return
        }
        const opts = this.res_type_measurements[data.metric_res_type]
        if (!opts) {
          return
        }
        const keyOpts = opts.filter((o) => {
          return o.measurement === data.metric_key
        })
        if (!keyOpts || keyOpts.length <= 0) {
          return
        }
        if (!keyOpts[0].field_descriptions) {
          return
        }
        const ds = keyOpts[0].field_descriptions
        for (const k in ds) {
          if (k === data.metric_value && ds[k].unit) {
            this.conditionUnit = ds[k].unit
          }
        }
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
    if (R.is(Object, this.alertData)) {
      this.emitThreshold(this.decorators.threshold[1].initialValue)
    }
  },
  methods: {
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
        if (R.is(Object, this.alertData)) { // 说明是 更新
          this.toParams()
        }
        this.metricLoading = false
      } catch (error) {
        this.metricLoading = false
        throw error
      }
    },
    async validate () {
      const monitorParams = this.toParams(false)
      const fd = await this.form.fc.validateFields()
      if (this.projectItem && this.projectItem.domain_id) fd.domain_id = this.projectItem.domain_id // 其实不传domain后端也会根据project定位domain，这里保险起见
      return {
        monitorParams,
        fd,
      }
    },
    emitThreshold (val) {
      this.$emit('update:threshold', val)
    },
    emitComparator (val) {
      if (val === 'nodata') {
        this.form.fc.setFieldsValue({ threshold: '0' })
      }
      this.$emit('update:comparator', val)
    },
    onValuesChange (props, values) {
      const newField = resolveValueChangeField(values)
      R.forEachObjIndexed((item, key) => {
        if (R.is(Object, this.form.fd[key]) && R.is(Object, item)) {
          this.$set(this.form.fd, key, { ...this.form.fd[key], ...item })
        } else {
          this.$set(this.form.fd, key, item)
        }
        if (values[this.decorators.metric_value[0]]) {
          this.$refs.filtersRef.reset()
        }
      }, newField)
      this.$nextTick(this.toParams)
      if ((values.hasOwnProperty('metric_key') && !values.metric_key) || (values.hasOwnProperty('metric_value') && !values.metric_value)) {
        this.resetChart()
      }
      if (newField.hasOwnProperty('notify_type')) {
        this.notifyTypes = newField.notify_type
      }
    },
    async getMetricInfo ({ metricKey, mertric, mertricItem, metricKeyItem }) {
      try {
        this.metricKeyItem = metricKeyItem || {}
        this.conditionUnit = _.get(mertricItem, 'description.unit') || ''
        this.$emit('mertricItemChange', { ...mertricItem, title: this.getTitle(mertricItem) })
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
    toParams (needEmit = true) {
      const fd = this.form.fc.getFieldsValue()
      const params = {
        database: this.metricKeyItem.database || _.get(this.alertData, 'common_alert_metric_details[0].db', 'telegraf'),
      }
      const tags = []
      if (fd.metric_key) params.measurement = fd.metric_key
      if (fd.metric_value) params.select = [[{ type: 'field', params: [fd.metric_value] }]]
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
        params.tags = tags
      }
      if (fd.group_by) {
        // eslint-disable-next-line no-template-curly-in-string
        params.group_by = [{ type: 'tag', params: [fd.group_by] }]
      }
      if (params.select && R.is(String, fd.function)) {
        params.select[0].push({ type: fd.function.toLowerCase(), params: [] })
      }
      if (R.equals(this.oldParams, params)) return params
      if (needEmit) this.$emit('refresh', params)
      this.oldParams = params // 记录为上一次 params
      return params
    },
    resetMetric () {
      this.tags = []
      this.resetChart()
    },
    resetChart () {
      this.$emit('resetChart')
      this.$refs.filtersRef.reset()
    },
    getTitle (mertricItem) {
      let padding = ' '
      if (this.$store.getters.setting.language === 'zh-CN') {
        padding = ''
      }
      let label = this.metricKeyItem && this.metricKeyItem.metric_res_type ? this.$t(`dictionary.${this.metricKeyItem.metric_res_type}`) + padding : ''
      label += this.metricKeyItem && this.metricKeyItem.label ? this.metricKeyItem.label : '-'
      const metricLabel = _.get(mertricItem, 'description.display_name')
      if (metricLabel) {
        label += `(${metric_zh[metricLabel] ? metric_zh[metricLabel] : metricLabel})`
      }
      return label
    },
    initContactParams (contactParams) {
      contactParams.scope = this.scope
      if (this.isDomainMode) {
        contactParams.project_domain_filter = true
      }
    },
  },
}
</script>
