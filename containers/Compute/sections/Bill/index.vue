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
        <a-checkbox class="ml-4" v-decorator="decorators.autoRenew" @change="markFormFieldDraftTouched">{{$t('compute.text_119')}}</a-checkbox>
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
    /** selection：radio/checkbox，local + session 双写、可跨 tab 回填 */
    formDraftKind: {
      type: String,
      default: 'selection',
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
      buyDurationOptions: BUY_DURATION_OPTIONS,
      showDuration: _.get(this.decorators.billType, '[1].initialValue') === BILL_TYPES_MAP.package.key,
    }
  },
  computed: {
    billTypesMap () {
      return this.billTypesMaps || BILL_TYPES_MAP
    },
  },
  watch: {
    providerList: {
      immediate: true,
      handler (providerList, oldV) {
        if (oldV !== undefined && R.equals(providerList, oldV)) return
        const list = (providerList || []).map(val => (val && val.name ? val.name : val)).map(n => String(n).toLowerCase())
        this.buyDurationOptions = BUY_DURATION_OPTIONS.map(item => {
          let disabled = false
          if (R.is(Array, item.includes)) {
            disabled = !item.includes.every(provider => list.includes(provider))
          }
          return {
            ...item,
            disabled,
          }
        })
        this.$nextTick(() => {
          // 优先草稿；否则保证包年包月时长仍可选
          if (!this.restoreFormFieldDraftFields()) {
            this.ensureValidPackageDuration()
          }
        })
      },
    },
  },
  mounted () {
    if (this.form && this.form.fd) {
      this.$set(this.form.fd, 'billType', _.get(this.decorators.billType, '[1].initialValue'))
      this.$set(this.form.fd, 'duration', this.duration)
    }
  },
  methods: {
    getEnabledBuyDurations () {
      return (this.buyDurationOptions || []).filter(item => !item.disabled)
    },
    /** 默认 1 个月；1M 不可用时再落到第一个可选时长 */
    getDefaultPackageDuration () {
      if (this.isDurationEnabled('1M')) return '1M'
      return this.getEnabledBuyDurations()[0]?.key || '1M'
    },
    isDurationEnabled (key) {
      return !!key && this.getEnabledBuyDurations().some(item => item.key === key)
    },
    applyPackageDuration (duration) {
      if (!duration || !this.showDuration) return
      this.duration = duration
      this.applyFormFieldValues({
        [this.decorators.duration[0]]: duration,
      })
    },
    /** 包年包月时长无效时落到默认 1M；按量不写共用 duration（交由 Duration） */
    ensureValidPackageDuration () {
      if (!this.showDuration) return
      const fc = this.resolveFormFc()
      const current = fc?.getFieldValue?.(this.decorators.duration[0]) || this.duration
      if (this.isDurationEnabled(current)) {
        this.duration = current
        return
      }
      this.applyPackageDuration(this.getDefaultPackageDuration())
    },
    change (val) {
      this.markFormFieldDraftTouched()
      this.showDuration = val.target.value === BILL_TYPES_MAP.package.key
      if (this.showDuration) {
        this.$nextTick(() => this.applyPackageDuration(this.getDefaultPackageDuration()))
      }
      // 切到按量：Duration 自管 durationStandard，勿写共用 duration
    },
    durationChange (val) {
      this.markFormFieldDraftTouched()
      this.duration = val.target.value
    },
    getCreateFormFieldDraftSnapshot () {
      const fc = this.resolveFormFc()
      if (!fc) return undefined
      const billType = fc.getFieldValue(this.decorators.billType[0])
      const snapshot = { billType }
      // 仅包年包月落盘时长/续费；按量时 duration 可能被 Duration 占用
      if (billType === BILL_TYPES_MAP.package.key) {
        snapshot.duration = fc.getFieldValue(this.decorators.duration[0])
        if (this.decorators.autoRenew) {
          snapshot.autoRenew = fc.getFieldValue(this.decorators.autoRenew[0])
        }
      }
      return snapshot
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || typeof draft !== 'object') return
      const fc = this.resolveFormFc()
      if (!fc) return
      const billType = draft.billType
      if (!billType || !this.billTypesMap[billType]) return
      if (this.disabledBillType === billType) return
      this.showDuration = billType === BILL_TYPES_MAP.package.key
      const values = { [this.decorators.billType[0]]: billType }
      if (this.showDuration) {
        const duration = this.isDurationEnabled(draft.duration)
          ? draft.duration
          : this.getDefaultPackageDuration()
        values[this.decorators.duration[0]] = duration
        this.duration = duration
        if (this.decorators.autoRenew && draft.autoRenew != null) {
          values[this.decorators.autoRenew[0]] = draft.autoRenew
        }
      }
      // duration / autoRenew 在 v-if 内，等注册后再写
      this.$nextTick(() => this.applyFormFieldValues(values))
    },
  },
}
</script>
