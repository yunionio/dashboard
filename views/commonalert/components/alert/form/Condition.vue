<template>
  <a-row>
    <a-col :span="12">
      <a-form-item class="mr-1">
        <base-select v-decorator="decorators.period" :options="preiodOpts" :disabled="disabled" />
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item class="mr-1">
        <base-select v-decorator="decorators.comparator"  :options="comparatorOpts" minWidth="100px" :disabled="disabled" />
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item>
        <a-input v-decorator="decorators.threshold" :addon-after="unit" :disabled="disabled" />
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
  },
  data () {
    return {
      preiodOpts: Object.values(preiodMaps),
      comparatorOpts: [
        { key: '>=', label: '>=' },
        { key: '<=', label: '<=' },
      ],
    }
  },
  computed: {
    unit () { // 3.3 暂时不加 单位
      // % bps iops
      return ''
    },
  },
}
</script>
