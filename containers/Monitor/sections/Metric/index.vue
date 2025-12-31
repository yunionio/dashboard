<template>
  <a-row :gutter="gutter">
    <a-form-item :extra="extra" style="margin-bottom:0">
      <a-col :span="span" v-if="showResType">
        <a-form-item class="mr-1">
          <base-select
            class="metric-select"
            minWidth="192px"
            v-decorator="decorators.metric_res_type"
            :options="metricTypeOpts"
            filterable
            :disabled="disabled"
            :select-props="{ placeholder: $t('monitor.text_111'), loading }"
            @change="metricTypeChange" />
        </a-form-item>
      </a-col>
      <a-col :span="span">
        <a-form-item class="mr-1">
          <base-select
            class="metric-select"
            minWidth="192px"
            v-decorator="decorators.metric_key"
            :options="metricKeyOpts"
            filterable
            :disabled="disabled"
            :item.sync="metricKeyItem"
            :select-props="{ placeholder: $t('monitor.text_112'), loading }"
            @change="metricKeyChange" />
        </a-form-item>
      </a-col>
      <a-col :span="span">
        <a-form-item>
          <base-select
            class="metric-select"
            minWidth="192px"
            filterable
            v-decorator="decorators.metric_value"
            :item.sync="metricValueItem"
            :options="metricOpts"
            :labelFormat="metricValueLabelFormat"
            :disabled="disabled"
            @change="metricValueChange"
            :select-props="{ placeholder: $t('monitor.text_113'), allowClear: true, loading }" />
        </a-form-item>
      </a-col>
    </a-form-item>
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
    res_type_measurements: {
      type: Object,
      default: () => ({}),
    },
    res_types: {
      type: Array,
      default: () => [],
    },
    showResType: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      metric_key: _.get(this.decorators.metric_key, '[1].initialValue'),
      metric_res_type: _.get(this.decorators.metric_res_type, '[1].initialValue'),
      metricValueItem: {},
      metricKeyItem: {},
    }
  },
  computed: {
    metricTypeOpts () {
      return this.res_types.map(val => {
        // let label = val
        // if (this.$te(`dictionary.${val}`)) label = this.$t(`dictionary.${val}`)
        const label = val === 'system' ? this.$t('common.system_service') : this.$t(`dictionary.${val}`)
        return {
          key: val,
          label,
        }
      })
    },
    metricKeyOpts () {
      return (this.res_type_measurements[this.metric_res_type] || []).map(val => {
        let label = val.measurement
        const displayName = val.measurement_display_name
        if (displayName && metric_zh[displayName]) {
          label = metric_zh[displayName]
        }
        return {
          ...val,
          metric_res_type: this.metric_res_type,
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
    span () {
      if (this.showResType) return 8
      return 12
    },
    gutter () {
      if (this.showResType) return 8
      return 0
    },
    extra () {
      // if (this.metricValueItem.id === 'balance' && this.metricValueItem.metric_res_type === 'cloudaccount') {
      //   return this.$t('monitor.currency_select_tip')
      // }
      return ''
    },
  },
  watch: {
    metric_res_type (val) {
      if (!this.metricTypeOpts) {
        this.resetMetric()
      } else {
        const metricKey = this.form.fc.getFieldValue(this.decorators.metric_key[0])
        const metricValue = this.form.fc.getFieldValue(this.decorators.metric_value[0])
        if (metricKey) {
          const validMetric = this.metricTypeOpts.find(option => option.key === metricKey)
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
  mounted: function () {
    this.$nextTick(function () {
      const metricValue = this.form.fc.getFieldValue(this.decorators.metric_value[0])
      if (metricValue) this.metricValueChange(metricValue)
    })
  },
  methods: {
    metricValueLabelFormat (item) {
      return (<div>
        {item.label}<span class="text-black-50">({item.description.name})</span>
      </div>)
    },
    metricTypeChange (val) {
      this.metric_res_type = val
    },
    metricKeyChange (val, isNative = true) {
      this.metric_key = val
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
        let vItem = this.metricValueItem
        let kItem = this.metricKeyItem
        if (!vItem) {
          vItem = this.metricOpts.find((opt) => { return opt.key === val })
        }
        if (this.metricKeyItem) {
          kItem = this.metricKeyOpts.find((opt) => { return opt.key === this.metric_key })
        }
        this.$emit('metricChange', { metricKey: this.metric_key, mertric: val, mertricItem: vItem, metricKeyItem: kItem })
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

<style lang="less" scoped>
.metric-select {
  min-width: 192px !important;
  flex: 1 1 auto;
  width: 100%;
  ::v-deep .ant-select {
    width: 100%;
    min-width: 192px;
  }
}
</style>
