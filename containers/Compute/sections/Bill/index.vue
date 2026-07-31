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
        <a-checkbox class="ml-4" v-decorator="decorators.autoRenew" @change="onAutoRenewChange">{{$t('compute.text_119')}}</a-checkbox>
      </a-form-item>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { BILL_TYPES_MAP, BUY_DURATION_OPTIONS } from '@Compute/constants'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'VmPublicCreateBill',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
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
      default: () => BILL_TYPES_MAP,
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
            if (item.includes.every(provider => list.includes(provider))) {
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
        this.$nextTick(() => this.tryRestoreBillDraft())
      }
    },
  },
  mounted () {
    if (this.form && this.form.fd) {
      this.$set(this.form.fd, 'billType', _.get(this.decorators.billType, '[1].initialValue'))
      this.$set(this.form.fd, 'duration', this.duration)
    }
    this.$nextTick(() => this.tryRestoreBillDraft())
  },
  methods: {
    durationDisabled (item) {
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
        const draft = this.readFormFieldDraft()
        if (draft?.duration && this.buyDurationOptions.some(i => i.key === draft.duration && !i.disabled)) {
          duration = draft.duration
        }
        this.form.fc.setFieldsValue({
          [this.decorators.duration[0]]: duration,
        })
        this.duration = duration
      }
      this.$nextTick(() => this.persistBillDraft())
    },
    durationChange (val) {
      this.duration = val.target.value
      this.$nextTick(() => this.persistBillDraft())
    },
    onAutoRenewChange () {
      this.$nextTick(() => this.persistBillDraft())
    },
    serializeFormFieldDraft () {
      if (!this.form?.fc) return undefined
      return {
        billType: this.form.fc.getFieldValue(this.decorators.billType[0]),
        duration: this.form.fc.getFieldValue(this.decorators.duration[0]),
        autoRenew: this.form.fc.getFieldValue(this.decorators.autoRenew?.[0]),
      }
    },
    persistBillDraft () {
      const data = this.serializeFormFieldDraft()
      if (data !== undefined) this.writeFormFieldDraft(data)
    },
    tryRestoreBillDraft () {
      if (!this.canReadWriteFormFieldDraft() || !this.form?.fc) return
      const draft = this.readFormFieldDraft()
      if (!draft || typeof draft !== 'object') return
      const billType = draft.billType
      if (!billType || !this.billTypesMap[billType]) return
      if (this.disabledBillType === billType) return
      this.showDuration = billType === BILL_TYPES_MAP.package.key
      const values = { [this.decorators.billType[0]]: billType }
      if (this.showDuration && draft.duration) {
        const ok = this.buyDurationOptions.some(i => i.key === draft.duration && !i.disabled)
        if (ok) {
          values[this.decorators.duration[0]] = draft.duration
          this.duration = draft.duration
        }
      }
      if (this.decorators.autoRenew && draft.autoRenew != null) {
        values[this.decorators.autoRenew[0]] = draft.autoRenew
      }
      this.form.fc.setFieldsValue(values)
      if (this.form.fd) {
        this.$set(this.form.fd, 'billType', billType)
        if (values[this.decorators.duration[0]]) {
          this.$set(this.form.fd, 'duration', values[this.decorators.duration[0]])
        }
      }
    },
  },
}
</script>
