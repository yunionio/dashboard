<template>
  <div>
    <a-form-item>
      <a-radio-group v-decorator="decorators.billType" @change="change">
        <a-radio-button
          v-for="(item, key) in billTypesMap"
          :value="key"
          :key="key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <template v-if="showDuration">
      <a-form-item>
        <a-radio-group v-decorator="decorators.duration">
          <a-radio-button
            v-for="item in buyDurationOptions"
            :value="item.key"
            :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { BILL_TYPES_MAP, BUY_DURATION_OPTIONS } from '@Compute/constants'

export default {
  name: 'VmPublicCreateBill',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.billType) && R.is(Array, val.duration),
    },
  },
  data () {
    return {
      billTypesMap: BILL_TYPES_MAP,
      buyDurationOptions: BUY_DURATION_OPTIONS,
      showDuration: this.decorators.billType === BILL_TYPES_MAP.package.key,
    }
  },
  methods: {
    change (val) {
      this.showDuration = val.target.value === BILL_TYPES_MAP.package.key
    },
  },
}
</script>
