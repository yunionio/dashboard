<template>
  <div class="server-password">
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorator.loginType" @change="loginTypeChange">
        <a-radio-button v-for="item of loginTypeMap" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
      <help-tooltip name="serverPassword" class="ml-2" />
    </a-form-item>
    <a-form-item v-if="(loginTypeMap && loginTypeMap.keypair) && vmLoginType === loginTypeMap.keypair.key">
      <base-select
        class="w-50"
        v-decorator="decorator.keypair"
        resource="keypairs"
        :select-props="{ allowClear: true, labelInValue: true, placeholder: '请选择关联密钥' }" />
    </a-form-item>
    <a-form-item v-if="(loginTypeMap && loginTypeMap.password) && vmLoginType === loginTypeMap.password.key">
      <a-input
        class="w-50"
        v-decorator="decorator.password"
        type="password"
        placeholder="请输入密码" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { LOGIN_TYPES_MAP } from '@Compute/constants'

export default {
  name: 'ServerPassword',
  props: {
    loginTypes: {
      type: Array,
    },
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.loginType) && R.is(Array, val.keypair) && R.is(Array, val.password),
    },
  },
  data () {
    return {
      vmLoginType: 'random',
    }
  },
  computed: {
    loginTypeMap () {
      if (this.loginTypes && this.loginTypes.length > 0) {
        const _ = {}
        for (let k in LOGIN_TYPES_MAP) {
          if (this.loginTypes.indexOf(k) > -1) {
            _[k] = LOGIN_TYPES_MAP[k]
          }
        }
        return _
      }
      return LOGIN_TYPES_MAP
    },
  },
  methods: {
    loginTypeChange (e) {
      this.vmLoginType = e.target.value
    },
  },
}
</script>
