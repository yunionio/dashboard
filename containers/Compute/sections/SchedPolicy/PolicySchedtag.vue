<template>
  <div class="policy-schedtag">
    <div class="d-flex align-items-start mb-2" v-for="(item, i) in schedtagPolicyList" :key="item.key">
      <schedtag-policy :form="form" class="w-50" :decorators="genDecorator(item.key)" :schedtag-params="{ ...schedtagParams, $t: `schedtag-${i}` }" :policyReactInSchedtag="false" @change="onItemFieldChange" />
      <a-button shape="circle" icon="minus" size="small" @click="decrease(item.key, i)" class="mt-2" />
    </div>
    <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
    <a-button type="link" @click="add">{{$t('add_schedpolicy')}}</a-button>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import { SCHEDTAG_POLICY_OPTIONS } from '@/constants'
import SchedtagPolicy from '@/sections/SchedtagPolicy'

function normalizeSchedtagItem (item) {
  if (!item || typeof item !== 'object') return null
  const id = typeof item.id === 'object'
    ? (item.id?.key || item.id?.id)
    : (item.id || item.schedtag)
  const policy = item.strategy || item.policy
  if (!id && !policy) return null
  return { id, policy }
}

export default {
  name: 'PolicySchedtag',
  components: {
    SchedtagPolicy,
  },
  props: {
    schedtagParams: {
      type: Object,
      required: true,
    },
    decorators: {
      type: Object,
      required: true,
      validator: val => R.is(Function, val.schedtags) && R.is(Function, val.policys),
    },
    form: {
      type: Object,
      validator: val => !val || val.fc, // 不传 或者 传就有fc
    },
    /** 挂载前即可用的回填数据（工单 / 草稿），避免 created add 空行后再异步 initData 丢值 */
    initSchedtags: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      schedtagPolicyList: [],
      policyOpts: SCHEDTAG_POLICY_OPTIONS,
      schedtagsApplied: false,
    }
  },
  watch: {
    // zone 等 params 变化会触发 base-select clearSelect，回填后再补一次
    schedtagParams () {
      if (!this.schedtagsApplied) return
      this.$nextTick(() => {
        setTimeout(() => this.applySchedtagFieldsValue(), 300)
      })
    },
    initSchedtags: {
      deep: true,
      handler (val) {
        if (this.schedtagsApplied) return
        if (Array.isArray(val) && val.length) {
          this.initData(val)
        }
      },
    },
  },
  created () {
    if (Array.isArray(this.initSchedtags) && this.initSchedtags.length) {
      this.initData(this.initSchedtags)
    } else {
      this.add()
    }
  },
  methods: {
    /**
     * 回填调度标签。优先靠 decorator initialValue 挂载即带值，
     * 再多次 setFieldsValue 兜底（选项异步加载 / params 变化清值）。
     * @param {Array} data
     */
    initData (data) {
      if (!Array.isArray(data) || !data.length) return
      const list = data.map(item => {
        const normalized = normalizeSchedtagItem(item)
        if (!normalized) return null
        return {
          key: uuid(),
          schedtag: normalized.id,
          policy: normalized.policy,
        }
      }).filter(Boolean)
      if (!list.length) return
      this.schedtagPolicyList = list
      this.schedtagsApplied = true
      this.$nextTick(() => {
        this.applySchedtagFieldsValue()
        setTimeout(() => this.applySchedtagFieldsValue(), 800)
        setTimeout(() => this.applySchedtagFieldsValue(), 2000)
      })
    },
    applySchedtagFieldsValue () {
      if (!this.form?.fc || !this.schedtagPolicyList.length) return
      this.schedtagPolicyList.forEach(item => {
        if (!item.schedtag && !item.policy) return
        const schedtagField = this.decorators.schedtags(item.key)[0]
        const policyField = this.decorators.policys(item.key)[0]
        this.form.fc.getFieldDecorator(schedtagField, this.decorators.schedtags(item.key)[1] || {})
        this.form.fc.getFieldDecorator(policyField, this.decorators.policys(item.key)[1] || {})
        const values = {}
        if (item.schedtag) values[schedtagField] = item.schedtag
        if (item.policy) values[policyField] = item.policy
        this.form.fc.setFieldsValue(values)
      })
      this.$emit('change')
    },
    add () {
      const uid = uuid()
      this.schedtagPolicyList.push({
        key: uid,
      })
      this.$emit('change')
    },
    decrease (uid, index) {
      this.schedtagPolicyList.splice(index, 1)
      this.$emit('change')
    },
    genDecorator (key) {
      const item = this.schedtagPolicyList.find(v => v.key === key) || {}
      const schedtagDec = this.decorators.schedtags(key)
      const policyDec = this.decorators.policys(key)
      return {
        schedtag: [
          schedtagDec[0],
          {
            ...(schedtagDec[1] || {}),
            initialValue: item.schedtag || undefined,
          },
        ],
        policy: [
          policyDec[0],
          {
            ...(policyDec[1] || {}),
            initialValue: item.policy || undefined,
          },
        ],
      }
    },
    onItemFieldChange () {
      // 用户改调度标签/策略后，把 fc 值同步回 list 再通知父级落盘
      if (!this.form?.fc || !this.schedtagPolicyList.length) {
        this.$emit('change')
        return
      }
      this.schedtagPolicyList.forEach((item) => {
        const schedtagField = this.decorators.schedtags(item.key)[0]
        const policyField = this.decorators.policys(item.key)[0]
        const schedtag = this.form.fc.getFieldValue(schedtagField)
        const policy = this.form.fc.getFieldValue(policyField)
        if (schedtag) item.schedtag = typeof schedtag === 'object' ? (schedtag.key || schedtag.id) : schedtag
        if (policy) item.policy = typeof policy === 'object' ? (policy.key || policy.id) : policy
      })
      this.$emit('change')
    },
  },
}
</script>
