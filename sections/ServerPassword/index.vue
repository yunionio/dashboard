<template>
  <div class="server-password">
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.loginType" @change="loginTypeChange">
        <a-radio-button v-for="item of loginTypeMap" :value="item.key" :key="item.key">
          {{ item.label }}
          <help-tooltip v-if="['image', 'keypair'].includes(item.key)" :name="`${item.key}Password`" class="ml-2" />
        </a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="(loginTypeMap && loginTypeMap.keypair) && vmLoginType === loginTypeMap.keypair.key">
      <base-select
        class="w-50"
        v-decorator="decorators.keypair"
        resource="keypairs"
        :select-props="{ allowClear: true, labelInValue: true, placeholder: '请选择关联密钥' }" />
    </a-form-item>
    <a-form-item v-if="(loginTypeMap && loginTypeMap.password) && vmLoginType === loginTypeMap.password.key">
      <a-input
        class="w-50"
        v-decorator="decorators.password"
        :type="isShowPwd ? 'text' : 'password'"
        placeholder="请输入密码">
        <a slot="suffix" @click="handleEyeClick"><a-icon  :type="isShowPwd ? 'eye' : 'eye-invisible'" style="color: rgba(0,0,0,.45)" /></a>
      </a-input>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { LOGIN_TYPES_MAP } from '@Compute/constants'
import { passwordValidator } from '@/utils/validate'

const DEFAULT_DECORATOR = {
  password: [
    'password',
    {
      validateFirst: true,
      rules: [
        { required: true, message: '请输入密码' },
        { validator: passwordValidator },
      ],
    },
  ],
}

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
      isShowPwd: false,
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
    decorators () {
      return {
        ...DEFAULT_DECORATOR,
        ...this.decorator,
      }
    },
  },
  methods: {
    loginTypeChange (e) {
      this.vmLoginType = e.target.value
    },
    handleEyeClick () {
      this.isShowPwd = !this.isShowPwd
    },
  },
}
</script>
