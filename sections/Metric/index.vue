<template>
  <a-row>
    <a-col :span="12">
      <a-form-item class="mr-1">
        <base-select
          minWidth="194px"
          v-decorator="decorators.metric_key"
          :options="metricKeyOpts"
          filterable
          :disabled="disabled"
          :item.sync="metricKeyItem"
          :select-props="{ placeholder: $t('common.select'), loading }"
          @change="metricKeyChange" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item>
        <base-select
          minWidth="196px"
          filterable
          v-decorator="decorators.metric_value"
          :item.sync="metricValueItem"
          :options="metricOpts"
          :labelFormat="metricValueLabelFormat"
          :disabled="disabled"
          @change="metricValueChange"
          :select-props="{ placeholder: $t('common.select'), allowClear: true, loading }" />
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script>
import _ from 'lodash'
import { metric_zh } from '@Monitor/constants'

export default {
  name: 'ExplorerFormMetric',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    metricKeyOpts: {
      type: Array,
      default: () => [],
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      metric_key: _.get(this.decorators.metric_key, '[1].initialValue'),
      metricValueItem: {},
      metricKeyItem: {},
      metricOpts: [],
    }
  },
  watch: {
    metricKeyOpts (val) {
      if (!val) {
        this.resetMetric()
      } else {
        const metricKey = this.form.fc.getFieldValue(this.decorators.metric_key[0])
        const metricValue = this.form.fc.getFieldValue(this.decorators.metric_value[0])
        if (metricKey) {
          const validMetric = val.find(val => val.key === metricKey)
          if (!validMetric && !this.disabled) {
            this.resetMetric()
          } else {
            this.metricKeyChange(this.metric_key, false)
            this.$nextTick(() => {
              if (metricValue) this.metricValueChange(metricValue)
            })
          }
        }
      }
    },
  },
  methods: {
    metricValueLabelFormat (item) {
      return (<div>
        {item.label}<span class="text-black-50">({item.description.name})</span>
      </div>)
    },
    metricKeyChange (val, isNative = true) {
      this.metric_key = val
      const metricKeyItem = this.metricKeyOpts.find(item => item.key === val)
      if (metricKeyItem && _.isArray(metricKeyItem.field_key)) {
        this.metricOpts = metricKeyItem.field_key.map(val => {
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
          }
        })
      }
      if (this.form && this.form.fc && isNative) {
        this.form.fc.setFieldsValue({
          [this.decorators.metric_value[0]]: undefined,
        })
      }
    },
    metricValueChange (val) {
      if (!val) {
        this.$emit('metricClear')
      } else {
        this.$emit('metricChange', { metricKey: this.metric_key, mertric: val, mertricItem: this.metricValueItem, metricKeyItem: this.metricKeyItem })
      }
    },
    resetMetric () {
      this.form.fc.setFieldsValue({
        [this.decorators.metric_key[0]]: undefined,
        [this.decorators.metric_value[0]]: undefined,
      })
      this.$emit('metricClear')
    },
  },
}
</script>
