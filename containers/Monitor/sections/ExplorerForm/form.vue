<template>
  <a-card :title="title" size="small" class="monitor-form" :class="{ 'hideBody': !panelShow }">
    <div slot="extra">
      <a-icon type="delete" v-if="showDelete" @click="remove" class="mr-2 remove-icon" />
      <a-icon :type="panelShow ? 'up' : 'down'" @click="toggle" />
    </div>
    <a-form
      v-show="panelShow"
      v-bind="formItemLayout"
      :form="form.fc">
      <a-form-item :label="$t('monitor.monitor_metric')" class="mb-0">
        <metric
          :form="form"
          :decorators="decorators"
          :res_type_measurements="res_type_measurements"
          :res_types="res_types"
          :loading="metricLoading"
          @metricChange="getMetricInfo"
          @metricClear="resetChart" />
      </a-form-item>
      <a-form-item :label="$t('monitor.monitor_filters')">
        <filters
          :form="form"
          ref="filtersRef"
          :decorators="decorators.filters"
          :init-filters="initFilters"
          @remove="$nextTick(toParams)"
          :loading="metricInfoLoading"
          :metricInfo="metricInfo" />
      </a-form-item>
      <a-form-item :label="$t('monitor.monitor_group')">
        <base-select
          v-decorator="decorators.group_by"
          :options="groupbyOpts"
          @change="groupbyChange"
          class="w-100"
          :select-props="{ mode: 'multiple', placeholder: $t('monitor.text_114'), allowClear: true }" />
      </a-form-item>
      <a-form-item :label="$t('monitor.monitor_function')">
        <base-select
          v-decorator="decorators.function"
          :options="functionOpts"
          class="w-100"
          :select-props="{ placeholder: $t('monitor.text_115'), allowClear: allowClearGroupFunction }" />
      </a-form-item>
      <a-form-item :label="$t('monitor.monitor_result_function')">
        <base-select
          v-decorator="decorators.result_function"
          :options="resultFunctionOpts"
          class="w-100"
          :select-props="{ placeholder: $t('monitor.text_115'), allowClear: true }" />
      </a-form-item>
      <a-form-item v-if="form.fd.result_function === 'percentile'" :label="$t('monitor.monitor_percentile')">
        <a-input-number :min="1" :max="99" v-decorator="decorators.percentile" placeholder="1~99" />
      </a-form-item>
      <a-form-item :label="$t('common.name')" v-if="!queryOnly">
        <a-input v-decorator="decorators.name" :placeholder="$t('common.placeholder')" />
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import Metric from '@Monitor/sections/Metric'
import Filters from '@Monitor/sections/Filters'
import { metric_zh } from '@Monitor/constants'
import { resolveValueChangeField } from '@/utils/common/ant'
import { uuid, getRequestT } from '@/utils/utils'

export default {
  name: 'ExplorerForm',
  components: {
    Metric,
    Filters,
  },
  props: {
    panel: {
      type: Object,
      default: () => ({}),
    },
    queryOnly: {
      type: Boolean,
      default: true,
    },
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
    showDelete: {
      type: Boolean,
      default: false,
    },
    defaultPanelShow: {
      type: Boolean,
    },
    timeRangeParams: {
      type: Object,
      default: () => ({}),
    },
    extraParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    const initialValue = {}
    const initFilters = []
    const initTagOperators = {}
    if (this.panel && this.panel.common_alert_metric_details && this.panel.common_alert_metric_details.length > 0) {
      const f = this.panel.common_alert_metric_details[0]
      const q = _.get(this.panel, 'settings.conditions[0].query.model')
      const r = _.get(this.panel, 'settings.conditions[0].query.result_reducer')
      initialValue.name = this.panel.name || this.panel.panel_name || ''
      initialValue.res_type = f.res_type
      initialValue.metric_key = f.measurement
      initialValue.metric_value = f.field
      initialValue.tags = {}
      if (q) {
        if (q.group_by) {
          const _g = q.group_by.filter((g) => { return g.type === 'tag' && g.params && g.params[0] })
          if (_g.length) {
            initialValue.group_by = _g.map(item => {
              return item.params[0]
            })
          }
        }
        if (q.tags) {
          q.tags.map((tag) => {
            const key = uuid()
            initialValue.tags[key] = tag
            initFilters.push({ key: key, tagValueOpts: [] })
            initTagOperators[key] = tag.operator
          })
        }
        initialValue.function = ''
        if (q.select && q.select.length > 0 && q.select[0].length > 1) {
          const s = q.select[0]
          const _t = s[s.length - 1].type
          if (_t) initialValue.function = _t.toUpperCase()
        }
      }
      if (r) {
        initialValue.result_function = r.type
        if (r.params && r.params.length) {
          if (r.params[0] === 50) {
            initialValue.result_function = 'p50'
          } else if (r.params[0] === 95) {
            initialValue.result_function = 'p95'
          } else {
            initialValue.percentile = r.params[0]
          }
        }
      }
    }
    const getkey = (index, key, defaultValue) => {
      if (initialValue.tags && initialValue.tags[index] && initialValue.tags[index][key]) {
        if (key === 'value') {
          const v = initialValue.tags[index][key]
          if (v.startsWith('/^') && v.endsWith('$/')) {
            const values = v.replace('/^', '').replace('$/', '').split('|').map(item => {
              let k = item
              if (k.startsWith('^')) k = k.replace('^', '')
              if (k.endsWith('$')) k = k.replace('$', '')
              return k
            })
            return values
          } else {
            return [v]
          }
        }
        if (key === 'operator') {
          const v = initialValue.tags[index][key]
          if (v === '=') return '=~'
          if (v === '!=') return '!~'
        }
        return initialValue.tags[index][key]
      } else {
        return defaultValue
      }
    }

    const decorators = {
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
            initialValue: getkey(i, 'condition', 'AND'),
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        tagKey: i => [
          `tagKeys[${i}]`,
          {
            initialValue: getkey(i, 'key', ''),
            rules: [
              // { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        tagOperator: i => [
          `tagOperators[${i}]`,
          {
            initialValue: getkey(i, 'operator', '=~'),
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        tagValue: i => [
          `tagValues[${i}]`,
          {
            initialValue: getkey(i, 'value', []),
            rules: [
              // { required: true, message: this.$t('common.select') },
            ],
          },
        ],
      },
      group_by: [
        'group_by',
        {
          initialValue: initialValue.group_by || [],
        },
      ],
      function: [
        'function',
        {
          initialValue: initialValue.function,
        },
      ],
      result_function: [
        'result_function',
        {
          initialValue: initialValue.result_function,
        },
      ],
      percentile: [
        'percentile',
        {
          initialValue: initialValue.percentile,
          rules: [{ required: true, message: this.$t('common.tips.input', [this.$t('monitor.monitor_percentile')]) }],
        },
      ],
    }

    if (!this.queryOnly) {
      decorators.name = [
        'name',
        {
          initialValue: initialValue.name || '',
          rules: [
            { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
          ],
        },
      ]
    }

    return {
      prevName: initialValue.name,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.onValuesChange,
        }),
        fd: {
          result_function: initialValue.result_function,
          tagOperators: initTagOperators,
        },
      },
      decorators: decorators,
      initFilters: initFilters,
      groupbyOpts: [],
      functionOpts: [],
      resultFunctionOpts: [
        {
          key: 'p50',
          label: 'P50',
        },
        {
          key: 'p95',
          label: 'P95',
        },
        {
          key: 'min',
          label: 'MIN',
        },
        {
          key: 'max',
          label: 'MAX',
        },
        {
          key: 'avg',
          label: 'MEAN',
        },
        {
          key: 'sum',
          label: 'SUM',
        },
        {
          key: 'count',
          label: 'COUNT',
        },
        {
          key: 'percentile',
          label: 'PERCENTILE',
        },
      ],
      metricKeyOpts: [],
      metricInfo: {},
      metricKeyItem: {},
      mertricItem: {},
      panelShow: this.defaultPanelShow,
      oldParams: {},
      oldResParams: {},
      metricLoading: false,
      metricInfoLoading: false,
      res_type_measurements: {},
      res_types: [],
      allowClearGroupFunction: true,
    }
  },
  computed: {
    title () {
      if (!this.panelShow && this.form.fd.metric_key) {
        return this.getTitle()
      }
      return this.$t('monitor.monitor_fill_filters')
    },
  },
  watch: {
    defaultPanelShow (val) {
      this.panelShow = val
    },
    timeRangeParams () {
      this.getMeasurement()
    },
  },
  created () {
    this.getMeasurement()
  },
  methods: {
    getTitle () {
      let padding = ' '
      if (this.$store.getters.setting.language === 'zh-CN') {
        padding = ''
      }
      let label = this.metricKeyItem && this.metricKeyItem.metric_res_type ? this.$t(`dictionary.${this.metricKeyItem.metric_res_type}`) + padding : ''
      label += this.metricKeyItem && this.metricKeyItem.label ? this.metricKeyItem.label : '-'
      const metricLabel = _.get(this.mertricItem, 'description.display_name')
      const metricName = _.get(this.mertricItem, 'description.name')
      if (metricLabel) {
        label += `(${metric_zh[metricLabel] ? metric_zh[metricLabel] + ' ' + metricName : metricLabel + ' ' + metricName})`
      }
      return label
    },
    resetChart () {
      this.$emit('resetChart')
      this.$refs.filtersRef.reset()
    },
    remove () {
      this.$emit('remove')
    },
    groupbyChange (a) {
      if (!a || a.length === 0) {
        this.form.fc.setFieldsValue({
          [this.decorators.function[0]]: '',
        })
        this.allowClearGroupFunction = true
      } else {
        this.allowClearGroupFunction = false
        if (this.functionOpts && this.functionOpts.length) {
          const mean = this.functionOpts.find(val => val.key.toLowerCase() === 'mean')
          this.form.fc.setFieldsValue({
            [this.decorators.function[0]]: mean.key,
          })
        }
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
      const changedKeys = Object.keys(values)
      if (changedKeys.length === 1 && changedKeys[0] === 'name') {
        this.$emit('nameChange', this.form.fd.name)
        return
      }
      this.$nextTick(this.toParams)
      if ((values.hasOwnProperty('metric_key') && !values.metric_key) || (values.hasOwnProperty('metric_value') && !values.metric_value)) {
        this.resetChart()
      }
    },
    async getMeasurement () {
      try {
        this.metricLoading = true
        const params = { scope: this.$store.getters.scope, ...this.timeRangeParams, ...this.extraParams }
        const { data: { res_type_measurements, res_types } } = await new this.$Manager('unifiedmonitors', 'v1').get({ id: 'measurements', params })
        this.res_type_measurements = res_type_measurements
        this.res_types = res_types
        this.metricLoading = false
      } catch (error) {
        this.metricLoading = false
        throw error
      }
    },
    async getMetricInfo ({ metricKey, mertric, mertricItem, metricKeyItem }) {
      try {
        this.metricKeyItem = metricKeyItem || {}
        this.mertricItem = mertricItem || {}
        const title = this.getTitle()
        if (this.prevName === '' || this.form.fd.name === this.prevName) {
          this.form.fc.setFieldsValue({ name: title })
          this.prevName = title
        }
        this.$emit('mertricItemChange', { ...mertricItem, title: title, metricKeyItem })
        const params = {
          $t: getRequestT(),
          database: metricKeyItem && metricKeyItem.database ? metricKeyItem.database : 'telegraf',
          measurement: metricKey,
          field: mertric,
          scope: this.$store.getters.scope,
          ...this.timeRangeParams,
          ...this.extraParams,
        }
        this.metricInfoLoading = true
        const { data } = await new this.$Manager('unifiedmonitors', 'v1').get({ id: 'metric-measurement', params })
        this.metricInfo = data
        if (R.is(Array, this.metricInfo.tag_key)) {
          this.groupbyOpts = this.metricInfo.tag_key.map(v => ({ key: v, label: v }))
        }
        const Aggregations = _.get(this.metricInfo, 'func.field_opt_value.Aggregations')
        if (R.is(Array, Aggregations)) {
          this.functionOpts = Aggregations.map(v => ({ key: v, label: this.$te(`monitor.func.${v}`) ? this.$t(`monitor.func.${v}`) : v }))
        }
        const { group_by: groupBy, function: func } = this.form.fc.getFieldsValue([this.decorators.group_by[0], this.decorators.function[0]])
        const resetFields = {}
        const resetGroupBy = groupBy.filter(key => (this.metricInfo?.tag_key || []).includes(key))
        resetFields[this.decorators.group_by[0]] = resetGroupBy
        if (!~(Aggregations || []).indexOf(func)) {
          resetFields[this.decorators.function[0]] = undefined
        }
        this.form.fc.setFieldsValue(resetFields)
        this.metricInfoLoading = false
      } catch (error) {
        this.metricInfo.tag_key = []
        this.metricInfo.func = {}
        this.metricInfoLoading = false
        throw error
      }
    },
    toggle () {
      this.panelShow = !this.panelShow
    },
    toParams (ignoreEmit) {
      const fd = this.form.fc.getFieldsValue()
      const params = {
        database: this.metricKeyItem && this.metricKeyItem.database ? this.metricKeyItem.database : 'telegraf',
      }
      const resParams = {}
      const tags = []
      if (!this.queryOnly) {
        let formErr
        this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => { if (err) { formErr = err } })
        if (formErr) return
        params.name = fd.name
      }
      if (fd.metric_key) params.measurement = fd.metric_key
      if (fd.metric_value) params.select = [[{ type: 'field', params: [fd.metric_value] }]]
      if (R.is(Object, fd.tagValues)) {
        R.forEachObjIndexed((value, key) => {
          let val = value
          if ((fd.tagOperators[key] === '=~' || fd.tagOperators[key] === '!~') && val.length) {
            val = `/${val.map(v => `^${v}$`).join('|')}/`
          } else {
            val = R.is(Array, val) ? (val.length ? val[0] : '') : val
          }
          if (val) {
            const tag = {
              key: fd.tagKeys[key],
              value: val,
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
      if ((R.is(Array, fd.group_by) && fd.group_by.length)) {
        params.group_by = fd.group_by.map(group_by => {
          return { type: 'tag', params: [group_by] }
        })
      }
      if (fd.result_function) {
        resParams.type = fd.result_function
        if (fd.result_function === 'percentile') {
          if (fd.percentile) {
            resParams.params = [Math.max(1, Math.min(fd.percentile, 99))]
          } else {
            delete resParams.params
            delete resParams.type
          }
        } else if (fd.result_function === 'p50') {
          resParams.type = 'percentile'
          resParams.params = [50]
        } else if (fd.result_function === 'p95') {
          resParams.type = 'percentile'
          resParams.params = [95]
        }
      }
      if (!fd.metric_key || !fd.metric_value) {
        this.oldParams = params
        return params
      }
      if (R.is(String, fd.function) && fd.function.length) {
        params.select[0].push({ type: fd.function.toLowerCase(), params: [] })
      }
      if (R.equals(this.oldParams, params) && R.equals(this.oldResParams, resParams)) return params
      this.$emit('paramsChange', params, resParams)
      this.oldResParams = resParams
      this.oldParams = params // 记录为上一次 params
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../src/styles/less/theme';

.monitor-form {
  &.hideBody ::v-deep .ant-card-body {
    padding: 0 !important;
  }
  .remove-icon {
    transition: color 0.1s ease-in;
    &:hover {
      color: @error-color;
    }
  }
}

</style>
