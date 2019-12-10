<template>
  <div class="server-password">
    <a-form-item class="mb-0">
      <a-radio-group :disabled="disabled" v-decorator="decorators.loginType" @change="loginTypeChange">
        <a-radio-button v-for="item of loginTypeMap" :value="item.key" :key="item.key">
          {{ item.label }}
          <help-tooltip v-if="['image', 'keypair'].includes(item.key)" :name="`${item.key}Password`" class="ml-2" />
        </a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="(loginTypeMap && loginTypeMap.keypair) && vmLoginType === loginTypeMap.keypair.key">
      <div slot="extra">
        没有想要的密钥？可以前往
        <help-link href="/keypair"> 新建密钥</help-link>
      </div>
      <base-select
        class="w-50"
        v-decorator="decorators.keypair"
        resource="keypairs"
        :select-props="{ allowClear: true, labelInValue: true, placeholder: '请选择关联密钥' }" />
    </a-form-item>
    <a-form-item v-if="(loginTypeMap && loginTypeMap.password) && vmLoginType === loginTypeMap.password.key">
      <a-input-password
        class="w-50"
        v-decorator="decorators.password"
        placeholder="请输入密码" />
    </a-form-item>
  </div>
</template>

<script>
// import * as R from 'ramda'
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
      // validator: val => R.is(Array, val.loginType) && R.is(Array, val.keypair) && R.is(Array, val.password),
    },
    form: {
      type: Object,
    },
    isSnapshotImageType: { // 表单的镜像类型是否是主机快照
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      vmLoginType: 'random',
      disabled: false,
    }
  },
  computed: {
    loginTypeMap () {
      if (this.loginTypes && this.loginTypes.length > 0) {
        const _ = {}
        for (let k in LOGIN_TYPES_MAP) {
          if (this.loginTypes.includes(k)) {
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
  watch: {
    isSnapshotImageType (val) {
      if (val) {
        this.disabled = true
        this.form.fc.setFieldsValue({
          [this.decorators.loginType[0]]: LOGIN_TYPES_MAP.image.key,
        })
      } else {
        this.disabled = false
      }
    },
  },
  methods: {
    loginTypeChange (e) {
      this.vmLoginType = e.target.value
    },
  },
}
</script>
