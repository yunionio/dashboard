<template>
  <a-row>
    <a-col :span="12">
      <a-form-item class="mr-1">
        <base-select v-decorator="decorators.period" :options="preiodOpts" :disabled="disabled" />
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item class="mr-1">
        <base-select v-decorator="decorators.comparator"  :options="comparatorOpts" minWidth="100px" :disabled="disabled" @change="onComparatorChange" />
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item>
        <a-input v-decorator="decorators.threshold" :disabled="disabled" v-show="showThreshold" @blur="blur" :suffix="unit" />
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script>
import * as R from 'ramda'
import { preiodMaps } from '@Monitor/constants'

export default {
  name: 'AlertCondition',
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
  data () {
    return {
      preiodOpts: Object.values(preiodMaps),
      comparatorOpts: [
        { key: '>=', label: '>=' },
        { key: '<=', label: '<=' },
        { key: '==', label: '==' },
        { key: 'nodata_query', label: 'No Data' },
      ],
      showThreshold: true,
    }
  },
  methods: {
    blur (e) {
      this.$emit('thresholdChange', e.target.value)
    },
    onComparatorChange (e) {
      if (e === 'nodata_query') {
        this.showThreshold = false
        this.$emit('comparatorChange', e)
      } else {
        this.showThreshold = true
      }
    },
  },
}
</script>
