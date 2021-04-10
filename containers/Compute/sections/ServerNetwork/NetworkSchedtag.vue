<template>
  <div class="network-schedtag">
    <div class="d-flex align-items-start mb-2" v-for="(item, i) in schedtagList" :key="item.key">
      <a-tag color="blue" class="mr-1 mt-2">{{ isBonding ? 'bond' : $t('compute.text_193')}}{{i}}</a-tag>
      <schedtag-policy :form="form" :decorators="genDecorator(item.key)" :schedtag-params="schedtagParams" />
      <a-button shape="circle" icon="minus" size="small" @click="decrease(item.key, i)" class="mt-2" />
    </div>
    <div class="d-flex align-items-center" v-if="schedtagCountRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('compute.text_183')}}</a-button>
      <span class="network-count-tips">{{$t('compute.text_130')}}<span class="remain-num">{{ schedtagCountRemaining }}</span>{{$t('compute.text_200')}}</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import { SCHEDTAG_POLICY_OPTIONS } from '@/constants'
import SchedtagPolicy from '@/sections/SchedtagPolicy'

export default {
  name: 'NetworkSchedtag',
  components: {
    SchedtagPolicy,
  },
  props: {
    schedtagParams: {
      type: Object,
      required: true,
    },
    form: {
      type: Object,
      required: true,
    },
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Function, val.schedtags) && R.is(Function, val.policys),
    },
    limit: {
      type: Number,
      default: 8, // 默认支持最多 8 个ip子网
    },
    isBonding: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      schedtagList: [],
      policyOpts: SCHEDTAG_POLICY_OPTIONS,
    }
  },
  computed: {
    schedtagCountRemaining () {
      return this.limit - this.schedtagList.length
    },
  },
  created () {
    this.add()
  },
  methods: {
    add () {
      const uid = uuid()
      this.schedtagList.push({
        key: uid,
      })
    },
    decrease (uid, index) {
      this.schedtagList.splice(index, 1)
    },
    genDecorator (key) {
      return {
        schedtag: this.decorator.schedtags(key),
        policy: this.decorator.policys(key),
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../src/styles/less/theme';

.network-schedtag {
  .network-count-tips {
    .remain-num {
      color: @primary-color;
    }
  }
}
</style>
