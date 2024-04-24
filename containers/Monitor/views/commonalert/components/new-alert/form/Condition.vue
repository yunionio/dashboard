<template>
  <div>
    <a-row v-for="(item) in conditionList" :key="item.key">
      <a-col :span="4">
        <a-form-item>
          <base-select
            v-decorator="decorators.metric_key(item.key)"
            :options="metricKeyOpts"
            filterable
            :disabled="disabled"
            :item.sync="metricKeyItem"
            :select-props="{ placeholder: $t('monitor.text_112'), loading }"
            @change="metricKeyChange" />
        </a-form-item>
      </a-col>
      <a-col :span="4">
        <a-form-item>
          <base-select
            filterable
            v-decorator="decorators.metric_value(item.key)"
            :options="metricOpts"
            :labelFormat="metricValueLabelFormat"
            :disabled="disabled"
            :item.sync="metricValueItem"
            @change="metricValueChange"
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
          <base-select v-decorator="decorators.comparator(item.key)"  :options="comparatorOpts" minWidth="70px" :disabled="disabled" @change="onComparatorChange" />
        </a-form-item>
      </a-col>
      <a-col :span="5">
        <a-form-item>
          <threshold-input v-decorator="decorators.threshold(item.key)" :unit="unit" :disabled="disabled" />
        </a-form-item>
      </a-col>
      <a-button shape="circle" icon="minus" size="small" @click="del(item)" class="mt-2 ml-2" />
    </a-row>
    <a-row :span="2">
      <div class="d-flex align-items-center">
        <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" @click="add">增加触发条件</a-button>
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
        { key: 'nodata', label: 'No Data' },
      ],
      metric_key: '',
      unit: '',
      metricValueItem: {},
      metricKeyItem: {},
      conditionList: [],
    }
  },
  computed: {
    metricKeyOpts () {
      return (this.res_type_measurements[this.form.fd.metric_res_type] || []).map(val => {
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
    metricOpts () {
      const metricKeyItem = this.metricKeyOpts.find(item => item.key === this.metric_key)
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
  },
  created () {
    this.add()
  },
  methods: {
    add () {
      this.conditionList.push({ key: uuid() })
    },
    del (item) {
      const index = this.conditionList.findIndex(val => val.key === item.key)
      this.conditionList.splice(index, 1)
    },
    onComparatorChange (e) {
      if (e === 'nodata') {
        this.showThreshold = false
      } else {
        this.showThreshold = true
      }
    },
    metricValueLabelFormat (item) {
      return (<div>
        {item.label}<span class="text-black-50">({item.description.name})</span>
      </div>)
    },
    metricKeyChange (val) {
      console.log(val)
      this.metric_key = val
    },
    metricValueChange (val) {
      console.log(val)
      if (val) {
        let vItem = this.metricValueItem
        let kItem = this.metricKeyItem
        if (!vItem) {
          vItem = this.metricOpts.find((opt) => { return opt.key === val })
        }
        if (this.metricKeyItem) {
          kItem = this.metricKeyOpts.find((opt) => { return opt.key === this.metric_key })
        }
        this.unit = vItem.description.unit
        this.$emit('metricChange', { metricKey: this.metric_key, mertric: val, mertricItem: vItem, metricKeyItem: kItem })
      }
    },
    showThreshold (key) {
      return true
    },
  },
}
</script>
