<template>
  <a-row>
    <a-col :span="6">
      <a-form-item>
        <base-select v-decorator="decorators.period" :options="preiodOpts" minWidth="90px" />
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item>
        <base-select v-decorator="decorators.alert_duration" :options="durationOpts" minWidth="120px" />
      </a-form-item>
    </a-col>
    <a-col :span="4">
      <a-form-item>
        <base-select v-decorator="decorators.reduce" :options="reduceOpts" :disabled="disabled" minWidth="70px" />
      </a-form-item>
    </a-col>
    <a-col :span="3">
      <a-form-item>
        <base-select v-decorator="decorators.comparator"  :options="comparatorOpts" minWidth="70px" :disabled="disabled" @change="onComparatorChange" />
      </a-form-item>
    </a-col>
    <a-col :span="5" v-show="showThreshold">
      <a-form-item>
        <threshold-input v-decorator="decorators.threshold" :unit="unit" :disabled="disabled"  @change="thresholdChange" />
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script>
import * as R from 'ramda'
import thresholdInput from './thresholdInput'
import { preiodMaps } from '@Monitor/constants'

export default {
  name: 'AlertCondition',
  components: {
    thresholdInput,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.period) && R.is(Array, val.comparator) && R.is(Array, val.threshold),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    unit: {
      type: String,
      default: '',
    },
  },
  inject: ['form'],
  data () {
    let showThreshold = true
    if (this.decorators.comparator[1].initialValue === 'nodata') {
      showThreshold = false
    }
    let threshold
    if (this.decorators.threshold.initialValue) {
      threshold = this.decorators.threshold.initialValue
    }

    return {
      preiodOpts: Object.values(preiodMaps),
      durationOpts: [
        { key: 1, label: this.$t('monitor.duration.label', [1]) },
        { key: 2, label: this.$t('monitor.duration.label', [2]) },
        { key: 3, label: this.$t('monitor.duration.label', [3]) },
        { key: 6, label: this.$t('monitor.duration.label', [6]) },
        { key: 12, label: this.$t('monitor.duration.label', [12]) },
        { key: 24, label: this.$t('monitor.duration.label', [24]) },
        { key: 48, label: this.$t('monitor.duration.label', [48]) },
        { key: 96, label: this.$t('monitor.duration.label', [96]) },
      ],
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
      threshold: { value: threshold, base: 1 },
      showThreshold: showThreshold,
    }
  },
  methods: {
    thresholdChange (v) {
      this.$emit('thresholdChange', v)
    },
    onComparatorChange (e) {
      if (e === 'nodata') {
        this.showThreshold = false
      } else {
        this.showThreshold = true
      }
      this.$emit('comparatorChange', e)
    },
  },
}
</script>
