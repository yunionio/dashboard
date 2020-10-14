<template>
  <div>
    <a-form-item>
      <a-radio-group v-decorator="decorators.billType" @change="change">
        <a-radio-button
          v-for="(item, key) in billTypesMap"
          :value="key"
          :disabled="disabledBillType === item.key"
          :key="key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <template v-if="showDuration">
      <a-form-item :extra="duration === '1W' ? $t('compute.text_118') : ''">
        <a-radio-group v-decorator="decorators.duration" @change="durationChange">
          <a-radio-button
            v-for="item in buyDurationOptions"
            :disabled="item.disabled"
            :value="item.key"
            :key="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
        <a-checkbox class="ml-4" v-decorator="decorators.autoRenew">{{$t('compute.text_119')}}</a-checkbox>
      </a-form-item>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { BILL_TYPES_MAP, BUY_DURATION_OPTIONS } from '@Compute/constants'

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
    providerList: {
      type: Array,
    },
    disabledBillType: {
      type: String,
    },
    billTypesMaps: {
      type: Object,
      default: BILL_TYPES_MAP,
    },
  },
  data () {
    return {
      duration: _.get(this.decorators.duration, '[1].initialValue') || '1M',
      billTypesMap: this.billTypesMaps,
      buyDurationOptions: BUY_DURATION_OPTIONS,
      showDuration: _.get(this.decorators.billType, '[1].initialValue') === BILL_TYPES_MAP.package.key,
    }
  },
  watch: {
    providerList (providerList, oldV) {
      if (!R.equals(providerList, oldV)) {
        const list = providerList.map(val => val.name.toLowerCase())
        this.buyDurationOptions = this.buyDurationOptions.map(item => {
          let disabled = false
          if (R.is(Array, item.includes)) {
            if (item.includes.every(provider => list.includes(provider))) { // 如果有provider的限制，必须每项都满足
              disabled = false
            } else {
              disabled = true
            }
          }
          return {
            ...item,
            disabled,
          }
        })
      }
    },
  },
  methods: {
    durationDisabled (item) {
      // 比如一周的包年包月仅阿里云支持
      if (this.providerList && this.providerList.length) {
        const list = this.providerList.map(val => val.name.toLowerCase())
        if (R.is(Array, item.includes)) {
          return item.includes.some(provider => list.includes(provider))
        }
      }
      return false
    },
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
    durationChange (val) {
      this.duration = val.target.value
    },
  },
}
</script>
