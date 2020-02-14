<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.type" :disabled="disabled" @change="handleTypeChange">
        <a-radio-button
          v-for="item of types"
          :key="item.key"
          :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item class="mb-0" v-if="isBind">
      <div slot="extra">
        {{ `最多支持选择${ (isAzure || isUCloud || isZstack) ? 1 : 5 }个安全组。没有想要的安全组？可以前往` }}
        <help-link :href="href"> 新建安全组</help-link>
      </div>
      <base-select
        remote
        class="w-50 pr-1"
        v-decorator="secgroupDecorator"
        resource="secgroups"
        :params="params"
        :showSync="true"
        :select-props="{ allowClear: true, placeholder: '请选择安全组', mode: 'multiple' }" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { SECGROUP_OPTIONS_MAP } from '@Compute/constants'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'SecgroupConfig',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.type && val.secgroup,
    },
    secgroupParams: {
      type: Object,
      default: () => ({}),
    },
    form: {
      type: Object,
    },
    isSnapshotImageType: { // 表单的镜像类型是否是主机快照
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: 'OneCloud',
    },
  },
  data () {
    const validateSecgroups = (rule, value, callback) => {
      let maxError = (this.isAzure || this.isUCloud || this.isZstack) ? 'Azure和Ucloud最多关联一个安全组' : '最多关联五个安全组'
      let minError = '最少关联一个'
      let max = (this.isAzure || this.isUCloud || this.isZstack) ? 1 : 5
      if (value.length > max) {
        return callback(maxError)
      }
      if (value.length < 1) {
        return callback(minError)
      }
      return callback()
    }
    let concatRules = (k, l, r) => k === 'rules' ? R.concat(l, r) : r
    const secgroupDecMsg = R.mergeDeepWithKey(concatRules,
      (this.decorators.secgroup[1] || {}),
      { rules: [{ validator: validateSecgroups }] }
    )
    return {
      types: SECGROUP_OPTIONS_MAP,
      isBind: this.decorators.type[1].initialValue === SECGROUP_OPTIONS_MAP.bind.key,
      loading: false,
      disabled: false,
      secgroupDecorator: [
        this.decorators.secgroup[0],
        secgroupDecMsg,
      ],
    }
  },
  computed: {
    params () {
      const params = {
        limit: 0,
        scope: this.$store.getters.scope,
        ...this.secgroupParams,
      }
      if (this.secgroupParams.project_domain) delete params.scope
      return params
    },
    href () {
      const url = this.$router.resolve('/secgroup')
      return url.href
    },
    isAzure () {
      return this.provider.toLowerCase() === HYPERVISORS_MAP.azure.provider.toLowerCase()
    },
    isUCloud () {
      return this.provider.toLowerCase() === HYPERVISORS_MAP.ucloud.provider.toLowerCase()
    },
    isZstack () {
      return this.provider.toLowerCase() === HYPERVISORS_MAP.zstack.provider.toLowerCase()
    },
  },
  watch: {
    isSnapshotImageType (val) {
      if (val) {
        this.disabled = true
        this.form.fc.setFieldsValue({
          [this.decorators.type[0]]: SECGROUP_OPTIONS_MAP.none.key,
        })
      } else {
        this.disabled = false
      }
    },
    provider () {
      if (this.form && this.form.fc) {
        this.form.fc.validateFields([this.decorators.secgroup[0]])
      }
    },
  },
  methods: {
    handleTypeChange (e) {
      this.isBind = (e.target.value === SECGROUP_OPTIONS_MAP.bind.key)
    },
  },
}
</script>
