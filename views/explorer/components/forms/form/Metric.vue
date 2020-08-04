<template>
  <a-row>
    <a-col :span="12">
      <a-form-item class="mr-1">
        <base-select
          minWidth="194px"
          v-decorator="decorators.metric_key"
          :options="metricKeyOpts"
          filterable
          :label-format="metricKeyLabelFormat"
          :select-props="{ placeholder: $t('common.select') }"
          @change="metricKeyChange" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item>
        <base-select
          minWidth="196px"
          filterable
          v-decorator="decorators.metric_value"
          :options="metricOpts"
          :label-format="metricValueLabelFormat"
          @change="metricValueChange"
          :select-props="{ placeholder: $t('common.select'), allowClear: true }" />
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script>
import _ from 'lodash'
import { metricMaps } from '@Monitor/constants'

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
  },
  data () {
    return {
      metric_key: _.get(this.decorators.metric_key, '[1].initialValue'),
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
        if (metricKey) {
          const validMetric = val.find(val => val.key === metricKey)
          if (!validMetric) {
            this.resetMetric()
          }
        }
      }
    },
  },
  methods: {
    metricKeyChange (val) {
      this.metric_key = val
      this.metricKeyItem = metricMaps[val]
      const metricKeyItem = this.metricKeyOpts.find(item => item.key === val)
      if (metricKeyItem && _.isArray(metricKeyItem.field_key)) {
        this.metricOpts = metricKeyItem.field_key.map(val => ({ key: val, label: val }))
      }
      if (this.form && this.form.fc) {
        this.form.fc.setFieldsValue({
          [this.decorators.metric_value[0]]: undefined,
        })
      }
    },
    metricKeyLabelFormat (item) {
      let label = item.name
      const metricKeyItem = metricMaps[item.key]
      if (metricKeyItem && metricKeyItem.label) {
        label += `（${metricKeyItem.label}）`
      }
      return label
    },
    metricValueLabelFormat (item) {
      const metricValueItem = _.get(this.metricKeyItem, `metrics[${item.key}]`)
      let label = item.name
      if (metricValueItem && metricValueItem.label) {
        label += `（${metricValueItem.label}）`
      }
      return label
    },
    metricValueChange (val) {
      if (!val) {
        this.$emit('metricClear')
      } else {
        this.$emit('metricChange', { metricKey: this.metricKeyItem.key, mertric: val })
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
