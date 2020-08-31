<template>
  <a-form v-bind="formItemLayout" :form="form.fc">
    <scope-radio :decorators="decorators" @change="scopeChange" :form="form" :disabled="disabled" />
    <a-form-item :label="$t('common.name')">
      <a-input v-decorator="decorators.name" :placeholder="$t('common.placeholder')" :disabled="disabled" />
      <name-repeated v-slot:extra res="commonalerts" :name="form.fd.name" />
    </a-form-item>
    <a-form-item :label="$t('monitor.monitor_metric')" class="mb-0">
      <metric
        :form="form"
        :decorators="decorators"
        :metricKeyOpts="metricKeyOpts"
        :disabled="disabled"
        :loading="metricLoading"
        @metricClear="resetChart"
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
      <condition :decorators="decorators" :disabled="disabled" @thresholdChange="emitThreshold" :unit="conditionUnit" />
    </a-form-item>
    <a-form-item :label="$t('monitor.level')">
      <a-radio-group v-decorator="decorators.level" :disabled="disabled">
        <a-radio-button v-for="item in levelOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('monitor.recipient')">
      <base-select
        v-decorator="decorators.recipients"
        resource="receivers"
        version="v1"
        filterable
        :isDefaultSelect="true"
        :select-props="{ mode: 'multiple' }"
        :params="contactParams" />
    </a-form-item>
    <a-form-item :label="$t('monitor.channel')">
      <a-checkbox-group name="checkboxgroup" :options="channelOpts" v-decorator="decorators.channel" />
    </a-form-item>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import Condition from './Condition'
import Metric from '@Monitor/sections/Metric'
import Filters from '@Monitor/sections/Filters'
import ScopeRadio from '@/sections/ScopeRadio'
import NameRepeated from '@/sections/NameRepeated'
import { channelMaps, levelMaps, metric_zh } from '@Monitor/constants'
import { resolveValueChangeField } from '@/utils/common/ant'

export default {
  name: 'CommonalertForm',
  components: {
    ScopeRadio,
    NameRepeated,
    Metric,
    Filters,
    Condition,
  },
  props: {
    formItemLayout: {
      type: Object,
      default: () => ({
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      }),
    },
    alertData: {},
    timeRangeParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    let tags = []
    const initialValue = {
      period: '5m',
      comparator: '>=',
      channel: ['webconsole'],
      level: 'normal',
      scope: this.$store.getters.scope,
    }
    if (R.is(Object, this.alertData)) {
      initialValue.name = this.alertData.name
      initialValue.period = this.alertData.period
      initialValue.level = this.alertData.level
      initialValue.domain = this.alertData.domain_id
      initialValue.project = this.alertData.tenant_id
      tags = _.get(this.alertData, 'settings.conditions[0].query.model.tags') || []
      initialValue.metric_key = _.get(this.alertData, 'settings.conditions[0].query.model.measurement')
      initialValue.metric_value = _.get(this.alertData, 'settings.conditions[0].query.model.select[0][0].params[0]')
      initialValue.threshold = _.get(this.alertData, 'settings.conditions[0].evaluator.params[0]')
      if (this.alertData.recipients && this.alertData.recipients.length) initialValue.recipients = this.alertData.recipients
      if (this.alertData.channel && this.alertData.channel.length) initialValue.channel = this.alertData.channel
      const comparator = _.get(this.alertData, 'settings.conditions[0].evaluator.type')
      if (comparator === 'lt') initialValue.comparator = '<='
      if (comparator === 'gt') initialValue.comparator = '>='
      if (!initialValue.project && !initialValue.domain) {
        initialValue.scope = 'system'
      }
      if (!initialValue.project && initialValue.domain) {
        initialValue.scope = 'domain'
      }
      if (initialValue.project) {
        initialValue.scope = 'project'
      }
    }
    return {
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.onValuesChange,
        }),
        fd: {
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
        recipients: [
          'recipients',
          {
            initialValue: initialValue.recipients,
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
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
      metricKeyOpts: [],
      metricInfo: {},
      conditionUnit: '',
      metricKeyItem: {},
      contactParams: {
        scope: this.$store.getters.scope,
        with_meta: true,
        limit: 0,
      },
      channelOpts: Object.values(channelMaps),
      levelOpts: Object.values(levelMaps),
      projectItem: {},
      metricLoading: false,
      metricInfoLoading: false,
    }
  },
  computed: {
    disabled () {
      return this.$route.query.alertType === 'system'
    },
  },
  watch: {
    timeRangeParams () {
      this.getMeasurement(this.formScopeParams)
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
    this.getMeasurement(params)
  },
  mounted () {
    if (R.is(Object, this.alertData)) {
      this.emitThreshold(this.decorators.threshold[1].initialValue)
    }
  },
  methods: {
    scopeChange (scopeParams) {
      this.getMeasurement(scopeParams)
      this.$emit('scopeChange', scopeParams)
    },
    async getMeasurement (params = {}) {
      try {
        this.metricLoading = true
        this.formScopeParams = params
        const { data: { measurements = [] } } = await new this.$Manager('unifiedmonitors', 'v1').get({ id: 'measurements', params: { ...params, ...this.timeRangeParams } })
        this.metricKeyOpts = measurements.map(val => {
          let label = val.measurement
          const displayName = val.measurement_display_name
          if (displayName && metric_zh[displayName]) {
            label = metric_zh[displayName]
          }
          return {
            ...val,
            key: val.measurement,
            label,
          }
        })
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
    },
    async getMetricInfo ({ metricKey, mertric, mertricItem, metricKeyItem }) {
      try {
        this.metricKeyItem = metricKeyItem
        this.conditionUnit = _.get(mertricItem, 'description.unit') || ''
        this.$emit('mertricItemChange', mertricItem)
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
          database: metricKeyItem.database || 'telegraf',
          measurement: metricKey,
          field: mertric,
          ...scopeParams,
          ...this.timeRangeParams,
        }
        this.metricInfoLoading = true
        const { data } = await new this.$Manager('unifiedmonitors', 'v1').get({ id: 'metric-measurement', params })
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
        database: this.metricKeyItem.database || 'telegraf',
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
    resetChart () {
      this.$emit('resetChart')
      this.$refs.filtersRef.reset()
    },
  },
}
</script>
