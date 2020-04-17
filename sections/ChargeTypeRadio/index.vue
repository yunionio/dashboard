<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.chargeType" @change="addressTypeChange">
        <a-radio-button v-for="item in typeOpts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="chargetype === 'bandwidth'" class="mb-0">
      <a-input-number v-decorator="decorators.bandwidth" :min="1" /> Mbps
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'ChargeType',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.chargeType) && R.is(String, val.chargeType[1].initialValue) && R.is(Array, val.bandwidth),
    },
    typeOpts: {
      type: Array,
      default: () => [
        { key: 'traffic', label: '按流量计费' },
        { key: 'bandwidth', label: '按带宽计费' },
      ],
    },
  },
  data () {
    return {
      chargetype: this.decorators.chargeType[1].initialValue,
    }
  },
  methods: {
    addressTypeChange (e) {
      this.chargetype = e.target.value
    },
  },
}
</script>

<style>

</style>
