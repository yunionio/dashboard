<template>
  <div>
    <a-row v-for="(item) in conditionList" :key="item.key" :gutter="2">
      <a-col :span="4">
        <a-form-item>
          <base-select
            v-decorator="decorators.metric_key(item.key)"
            :options="metricKeyOpts"
            filterable
            :disabled="disabled"
            :select-props="{ placeholder: $t('monitor.text_112'), loading }"
            @change="(v) => metricKeyChange(v, item)" />
        </a-form-item>
      </a-col>
      <a-col :span="4">
        <a-form-item>
          <base-select
            filterable
            v-decorator="decorators.metric_value(item.key)"
            :options="metricOptsMap[item.key]"
            :labelFormat="metricValueLabelFormat"
            :disabled="disabled"
            @change="(v) => metricValueChange(v, item)"
            :select-props="{ placeholder: $t('monitor.text_113'), allowClear: true, loading }" />
        </a-form-item>
      </a-col>
      <a-col :span="4">
        <a-form-item>
          <base-select v-decorator="decorators.reduce(item.key)" :options="reduceOpts" :disabled="disabled" minWidth="70px" />
        </a-form-item>
      </a-col>
      <a-col :span="3">
        <a-form-item>
          <base-select v-decorator="decorators.comparator(item.key)"  :options="comparatorOpts" minWidth="70px" :disabled="disabled" @change="(v) => onComparatorChange(v, item)" />
        </a-form-item>
      </a-col>
      <template v-if="showThresholdMap[item.key]">
        <template v-if="isRangeType(item.key)">
          <a-col :span="8">
            <div class="d-flex" style="gap: 8px; align-items: flex-start;">
              <div style="flex: 1;">
                <a-form-item style="margin-bottom: 0;">
                  <threshold-input v-decorator="decorators.threshold_start(item.key)" :unit="unitMap[item.key]" :disabled="disabled" @change="() => handleRangeValueChange(item.key, 'end')" />
                </a-form-item>
              </div>
              <span style="flex-shrink: 0; padding: 0 4px; display: flex; align-items: center; height: 32px; line-height: 32px; margin-top: 4px;">~</span>
              <div style="flex: 1;">
                <a-form-item style="margin-bottom: 0;">
                  <threshold-input v-decorator="decorators.threshold_end(item.key)" :unit="unitMap[item.key]" :disabled="disabled" @change="() => handleRangeValueChange(item.key, 'start')" />
                </a-form-item>
              </div>
            </div>
          </a-col>
        </template>
        <a-col v-else :span="8">
          <a-form-item>
            <threshold-input v-decorator="decorators.threshold(item.key)" :unit="unitMap[item.key]" :disabled="disabled" />
          </a-form-item>
        </a-col>
      </template>
      <a-button shape="circle" icon="minus" size="small" @click="del(item)" class="mt-2 ml-2" :disabled="disabled" />
    </a-row>
    <a-row :span="2">
      <div class="d-flex align-items-center">
        <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" :disabled="disabled" />
        <a-button type="link" @click="add" :disabled="disabled">{{$t('monitor.commonalert.add_condition')}}</a-button>
      </div>
    </a-row>
  </div>
</template>

<script>
import _ from 'lodash'
import { uuid } from '@/utils/utils'
import { metric_zh } from '@Monitor/constants'
import thresholdInput from './thresholdInput'

export default {
  name: 'AlertCondition',
  components: {
    thresholdInput,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    res_type_measurements: {
      type: Object,
      default: () => ({}),
    },
    metric_res_type: {
      type: String,
    },
  },
  inject: ['form'],
  data () {
    return {
      reduceOpts: [
        { key: 'avg', label: this.$t('monitor.avg') },
        { key: 'min', label: this.$t('monitor.min') },
        { key: 'max', label: this.$t('monitor.max') },
      ],
      comparatorOpts: [
        { key: '>=', label: '>=' },
        { key: '<=', label: '<=' },
        { key: '==', label: '==' },
        { key: 'within_range', label: this.$t('monitor.within_range') },
        { key: 'outside_range', label: this.$t('monitor.outside_range') },
        { key: 'nodata', label: 'No Data' },
      ],
      unitMap: {},
      metricKeyItemMap: {},
      conditionList: [],
      metricOptsMap: {},
      showThresholdMap: {},
      metricMap: {},
      rangeValidateTimers: {},
    }
  },
  computed: {
    metricKeyOpts () {
      return (this.res_type_measurements[this.metric_res_type] || []).map(val => {
        let label = val.measurement
        const displayName = val.measurement_display_name
        if (displayName && metric_zh[displayName]) {
          label = metric_zh[displayName]
        }
        return {
          ...val,
          metric_res_type: this.form.fd.metric_res_type,
          key: val.measurement,
          label,
        }
      })
    },
  },
  methods: {
    add () {
      const key = uuid()
      this.conditionList.push({ key })
      this.showThresholdMap[key] = true
    },
    del (item) {
      const index = this.conditionList.findIndex(val => val.key === item.key)
      this.conditionList.splice(index, 1)
      delete this.metricMap[item.key]
    },
    reset (execAdd = true) {
      this.conditionList.forEach(item => {
        const fields = ['metric_key', 'metric_value', 'reduce', 'comparator', 'threshold', 'threshold_start', 'threshold_end']
        fields.forEach(f => {
          this.$delete(this.form.fd, f)
          this.$delete(this.form.fd, `${f}[${item.key}]`)
        })
      })

      this.metricKeyMap = {}
      this.showThresholdMap = {}
      this.metricMap = {}
      this.unitMap = {}
      this.metricKeyItemMap = {}
      this.conditionList = []

      execAdd && this.add()
    },
    onComparatorChange (v, item) {
      if (v === 'nodata') {
        this.showThresholdMap[item.key] = false
      } else {
        this.showThresholdMap[item.key] = true
        // 处理 threshold 格式转换
        const thresholdKey = `threshold[${item.key}]`
        const currentThreshold = this.form.fc.getFieldValue(thresholdKey)
        const isRange = v === 'within_range' || v === 'outside_range'
        if (isRange) {
          // 切换到范围类型：将单个值转换为数组
          let thresholdArray = []
          if (currentThreshold !== undefined && currentThreshold !== null && !Array.isArray(currentThreshold)) {
            thresholdArray = [currentThreshold, currentThreshold]
          } else if (Array.isArray(currentThreshold) && currentThreshold.length >= 2) {
            thresholdArray = currentThreshold
          } else {
            // 如果没有值，设置默认数组
            thresholdArray = [1, 2]
          }
          this.form.fc.setFieldsValue({
            [thresholdKey]: thresholdArray,
            [`threshold_start[${item.key}]`]: thresholdArray[0],
            [`threshold_end[${item.key}]`]: thresholdArray[1],
          })
        } else {
          // 切换到非范围类型：将数组转换为单个值（取第一个值）
          if (Array.isArray(currentThreshold) && currentThreshold.length > 0) {
            this.form.fc.setFieldsValue({
              [thresholdKey]: currentThreshold[0],
            })
          }
        }
      }
    },
    isRangeType (key) {
      const comparator = this.form.fc.getFieldValue(`comparator[${key}]`)
      return comparator === 'within_range' || comparator === 'outside_range'
    },
    metricValueLabelFormat (item) {
      return (<div>
        {item.label}<span class="text-black-50">({item.description.name})</span>
      </div>)
    },
    metricKeyChange (val, item) {
      const mertricItem = this.metricKeyOpts.find(item => item.key === val)
      this.metricKeyItemMap = {
        [`${item.key}`]: mertricItem,
      }
      const metricOpts = this.getMetricOpts(val)
      this.$set(this.metricOptsMap, item.key, metricOpts)
    },
    metricValueChange (val, item) {
      if (val) {
        const metricKey = this.form.fc.getFieldValue(`metric_key[${item.key}]`)
        const metricOpts = this.getMetricOpts(metricKey)
        const metricValueItem = metricOpts.find((opt) => { return opt.key === val })
        const metricKeyItem = this.metricKeyItemMap[item.key]

        this.unitMap[item.key] = metricValueItem?.description?.unit
        this.metricMap[item.key] = { metricKey, mertric: val, mertricItem: metricValueItem, metricKeyItem }
        this.$emit('metricChange', this.metricMap)
      }
    },
    getMetricOpts (metric_key) {
      const metricKeyItem = this.metricKeyOpts.find(item => item.key === metric_key)
      if (metricKeyItem && _.isArray(metricKeyItem.field_key)) {
        return metricKeyItem.field_key.map(val => {
          let label = val
          const fieldDes = metricKeyItem.field_descriptions
          let description = {}
          if (fieldDes) {
            description = fieldDes[val]
            const displayName = _.get(fieldDes, `${val}.display_name`)
            if (displayName && metric_zh[displayName]) label = metric_zh[displayName]
          }
          return {
            key: val,
            label,
            description,
            metric_res_type: metricKeyItem.metric_res_type,
          }
        })
      } else {
        return []
      }
    },
    handleRangeValueChange (key, targetField) {
      // 使用防抖避免频繁触发
      const timerKey = `${key}_${targetField}`
      if (this.rangeValidateTimers[timerKey]) {
        clearTimeout(this.rangeValidateTimers[timerKey])
      }
      this.rangeValidateTimers[timerKey] = setTimeout(() => {
        const fieldName = targetField === 'start' ? `threshold_start[${key}]` : `threshold_end[${key}]`
        // 同步更新 threshold 数组
        const startValue = this.form.fc.getFieldValue(`threshold_start[${key}]`)
        const endValue = this.form.fc.getFieldValue(`threshold_end[${key}]`)
        if (startValue !== undefined && startValue !== null && endValue !== undefined && endValue !== null) {
          this.form.fc.setFieldsValue({
            [`threshold[${key}]`]: [startValue, endValue],
          })
        }
        // 触发校验
        this.form.fc.validateFields([fieldName], { force: true }, () => {})
        delete this.rangeValidateTimers[timerKey]
      }, 300)
    },
  },
}
</script>
