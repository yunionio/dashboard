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
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'VmPublicCreateBill',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.billType) && R.is(Array, val.duration),
    },
    form: {
      type: Object,
    },
    provider: {
      type: String,
    },
  },
  data () {
    return {
      billTypesMap: BILL_TYPES_MAP,
      showDuration: this.decorators.billType === BILL_TYPES_MAP.package.key,
    }
  },
  computed: {
    buyDurationOptions () {
      const options = BUY_DURATION_OPTIONS
      if (this.provider && this.provider.toLowerCase() === HYPERVISORS_MAP.aliyun.key) {
        options.unshift({
          label: '1周',
          key: '1W',
          unit: 'W',
        },)
      }
      return options
    },
  },
  methods: {
    change (val) {
      this.showDuration = val.target.value === BILL_TYPES_MAP.package.key
      if (this.showDuration && this.form && this.form.fc) {
        let duration = '1M'
        if (this.decorators.duration[1] && this.decorators.duration[1].initialValue) {
          duration = this.decorators.duration[1].initialValue
        }
        this.form.fc.setFieldsValue({
          [this.decorators.duration[0]]: duration,
        })
      }
    },
  },
}
</script>
