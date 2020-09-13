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
    <a-form-item v-if="(loginTypeMap && loginTypeMap.keypair) && vmLoginType === loginTypeMap.keypair.key" class="mb-0">
      <template #extra>
        {{$t('compute.text_201')}}<help-link :href="href">{{$t('compute.text_202')}}</help-link>
      </template>
      <base-select
        class="w-50"
        v-decorator="decorators.keypair"
        resource="keypairs"
        :isDefaultSelect="true"
        :showSync="true"
        :select-props="{ allowClear: true, placeholder: $t('compute.text_203') }" />
    </a-form-item>
    <a-form-item v-if="(loginTypeMap && loginTypeMap.password) && vmLoginType === loginTypeMap.password.key" class="mb-0">
      <a-input-password
        class="w-50"
        v-decorator="decorators.password"
        :placeholder="$t('compute.text_204')" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { LOGIN_TYPES_MAP } from '@Compute/constants'
import { passwordValidator } from '@/utils/validate'
import i18n from '@/locales'

const DEFAULT_DECORATOR = {
  password: [
    'password',
    {
      validateFirst: true,
      rules: [
        { required: true, message: i18n.t('compute.text_204') },
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
        for (const k in LOGIN_TYPES_MAP) {
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
    href () {
      const url = this.$router.resolve('/keypair')
      return url.href
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
    loginTypeMap (val, oldv) {
      if (!R.equals(val, oldv)) {
        this.setLoginType()
      }
    },
  },
  mounted () {
    this.setLoginType()
  },
  methods: {
    loginTypeChange (e) {
      this.vmLoginType = e.target.value
    },
    setLoginType () {
      if (this.loginTypeMap && !R.isEmpty(this.loginTypeMap)) {
        const loginTypeInitailValue = this.decorator.loginType[1].initialValue
        const keys = Object.keys(this.loginTypeMap)
        let vmLoginType = loginTypeInitailValue
        if (!keys.includes(loginTypeInitailValue)) { // 如果表单中的初始值不在 loginTypeMap 中
          if (keys.includes(LOGIN_TYPES_MAP.image.key)) { // 如果maps中有"保留镜像设置"，则设置
            vmLoginType = LOGIN_TYPES_MAP.image.key
          } else { // 否则设置第一项
            vmLoginType = keys[0]
          }
        }
        if (this.form && this.form.fc) {
          this.form.fc.setFieldsValue({
            [this.decorators.loginType[0]]: vmLoginType,
          })
        }
        this.vmLoginType = vmLoginType
      }
    },
  },
}
</script>
