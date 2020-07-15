<template>
  <a-form v-bind="formItemLayout" :form="form.fc">
    <scope-radio :decorators="decorators" :project.sync="projectItem" :formScopeInit="formScopeInit" />
    <a-form-item :label="$t('common.name')">
      <a-input v-decorator="decorators.name" :placeholder="$t('common.placeholder')" />
      <name-repeated v-slot:extra res="commonalerts" :name="form.fd.name" />
    </a-form-item>
    <a-form-item :label="$t('monitor.monitor_metric')" class="mb-0">
      <metric
        :metricOpts="metricInfo.field_key"
        :decorators="decorators"
        :metricKeyOpts="metricKeyOpts"
        @metricKeyChange="getMetricInfo" />
    </a-form-item>
    <a-form-item :label="$t('monitor.monitor_filters')">
      <filters
        :form="form"
        ref="filtersRef"
        :tags="tags"
        :decorators="decorators.filters"
        @remove="$nextTick(toParams)"
        :metricInfo="metricInfo" />
    </a-form-item>
    <a-form-item :label="$t('monitor.condition')" class="mb-0">
      <condition :decorators="decorators" />
    </a-form-item>
    <a-form-item :label="$t('monitor.level')">
      <a-radio-group v-decorator="decorators.level">
        <a-radio-button v-for="item in levelOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('monitor.recipient')">
      <base-select
        v-decorator="decorators.recipients"
        resource="contacts"
        version="v1"
        filterable
        idKey="uid"
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
import Metric from '@Monitor/views/explorer/components/forms/form/Metric'
import Filters from '@Monitor/views/explorer/components/forms/form/Filters'
import ScopeRadio from '@/sections/ScopeRadio'
import NameRepeated from '@/sections/NameRepeated'
import { DATABASE, channelMaps, levelMaps } from '@Monitor/constants'
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
  },
  data () {
    let tags = []
    const initialValue = {
      period: '5m',
      comparator: '>=',
      channel: ['webconsole'],
      level: 'normal',
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
    }
    let formScopeInit
    if (!initialValue.project && !initialValue.domain) {
      formScopeInit = 'system'
    }
    if (!initialValue.project && initialValue.domain) {
      formScopeInit = 'domain'
    }
    if (initialValue.project) {
      formScopeInit = 'project'
    }
    return {
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.onValuesChange,
        }),
        fd: {
        },
      },
      formScopeInit,
      decorators: {
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
      domain: undefined,
      project: undefined,
      tags,
      oldParams: {},
      metricKeyOpts: [],
      metricInfo: {},
      contactParams: {
        scope: this.$store.getters.scope,
        with_meta: true,
        limit: 0,
      },
      channelOpts: Object.values(channelMaps),
      levelOpts: Object.values(levelMaps),
      projectItem: {},
    }
  },
  watch: {
    domain () {
      this.domainProjectChange()
    },
    project () {
      this.domainProjectChange()
    },
  },
  created () {
    this.getMeasurement()
  },
  mounted () {
    if (R.is(Object, this.alertData)) {
      this.$emit('update:threshold', this.decorators.threshold[1].initialValue)
      this.getMetricInfo(this.decorators.metric_key[1].initialValue, false)
    }
  },
  methods: {
    domainProjectChange () {
      const params = {}
      if (this.domain) {
        params.scope = 'domain'
        params.domain_id = this.domain
      }
      if (this.project) {
        params.scope = 'project'
        params.project_id = this.project
      }
      this.getMeasurement(params)
    },
    async getMeasurement (params = {}) {
      try {
        const { data: { measurements = [] } } = await new this.$Manager('unifiedmonitors', 'v1').get({ id: 'measurements', params: { database: 'telegraf', ...params } })
        this.metricKeyOpts = measurements.map(val => ({ key: val.measurement, label: val.measurement }))
        if (R.is(Object, this.alertData)) { // 说明是 更新
          this.toParams()
        }
      } catch (error) {
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
    onValuesChange (props, values) {
      const newField = resolveValueChangeField(values)
      R.forEachObjIndexed((item, key) => {
        if (key === this.decorators.threshold[0]) {
          this.$emit('update:threshold', values[this.decorators.threshold[0]])
        }
        if (R.is(Object, this.form.fd[key]) && R.is(Object, item)) {
          this.$set(this.form.fd, key, { ...this.form.fd[key], ...item })
        } else {
          this.$set(this.form.fd, key, item)
        }
      }, newField)
      this.$nextTick(this.toParams)
    },
    async getMetricInfo (metricKey, isResetForm = true) {
      try {
        if (isResetForm) {
          this.$refs.filtersRef.reset()
          this.form.fc.setFieldsValue({
            [this.decorators.metric_value[0]]: undefined,
          })
        }
        const { data } = await new this.$Manager('unifiedmonitors', 'v1').get({ id: 'metric-measurement', params: { database: 'telegraf', measurement: metricKey } })
        this.metricInfo = data
        // 暂时去掉 分组 和 函数
        // if (R.is(Array, this.metricInfo.tag_key)) {
        //   this.groupbyOpts = this.metricInfo.tag_key.map(v => ({ key: v, label: v }))
        // }
        // const Aggregations = _.get(this.metricInfo, 'func.field_opt_value.Aggregations')
        // if (R.is(Array, Aggregations)) {
        //   this.functionOpts = Aggregations.map(v => ({ key: v, label: v }))
        // }
        this.$emit('resetChart')
      } catch (error) {
        this.metricInfo = {
          field_key: [],
          func: {},
          tag_key: [],
          tag_value: {},
        }
        const params = this.toParams()
        this.$emit('paramsChange', params)
        throw error
      }
    },
    toParams (needEmit = true) {
      const fd = this.form.fc.getFieldsValue()
      const params = {
        database: DATABASE,
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
      if (!fd.metric_key || !fd.metric_value) return params
      if (R.is(String, fd.function)) {
        params.select[0].push({ type: fd.function.toLowerCase(), params: [] })
      }
      if (R.equals(this.oldParams, params)) return params
      if (needEmit) this.$emit('refresh', params)
      this.oldParams = params // 记录为上一次 params
      return params
    },
  },
}
</script>
