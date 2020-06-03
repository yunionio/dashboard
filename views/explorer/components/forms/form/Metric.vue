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
          :select-props="{ placeholder: '请选择' }"
          @change="metricKeyChange" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item>
        <base-select
          minWidth="196px"
          filterable
          v-decorator="decorators.metric_value"
          :options="metricOptsC"
          :label-format="metricValueLabelFormat"
          :select-props="{ placeholder: '请选择' }" />
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
    metricOpts: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      metric_key: _.get(this.decorators.metric_key, '[1].initialValue'),
      metricKeyItem: {},
    }
  },
  computed: {
    metricOptsC () {
      return this.metricOpts.map(v => {
        return {
          key: v,
          label: v,
        }
      })
    },
  },
  methods: {
    metricKeyChange (val) {
      this.metric_key = val
      this.metricKeyItem = metricMaps[val]
      this.$emit('metricKeyChange', val)
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
  },
}
</script>
