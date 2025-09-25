<template>
  <div class="policy-schedtag">
    <div class="d-flex align-items-start mb-2" v-for="(item, i) in schedtagPolicyList" :key="item.key">
      <schedtag-policy :form="form" class="w-50" :decorators="genDecorator(item.key)" :schedtag-params="{ ...schedtagParams, $t: `schedtag-${i}` }" :policyReactInSchedtag="false" />
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
  },
  data () {
    return {
      schedtagPolicyList: [],
      policyOpts: SCHEDTAG_POLICY_OPTIONS,
    }
  },
  created () {
    this.add()
  },
  methods: {
    initData (data) {
      this.schedtagPolicyList = data.map(item => ({
        key: uuid(),
        schedtag: item.id,
        policy: item.strategy,
      }))
      this.$nextTick(() => {
        setTimeout(() => {
          this.schedtagPolicyList.forEach(item => {
            this.form.fc.setFieldsValue({
              [this.decorators.schedtags(item.key)[0]]: item.schedtag,
              [this.decorators.policys(item.key)[0]]: item.policy,
            })
          })
        }, 1000)
      })
    },
    add () {
      const uid = uuid()
      this.schedtagPolicyList.push({
        key: uid,
      })
    },
    decrease (uid, index) {
      this.schedtagPolicyList.splice(index, 1)
    },
    genDecorator (key) {
      return {
        schedtag: this.decorators.schedtags(key),
        policy: this.decorators.policys(key),
      }
    },
  },
}
</script>
