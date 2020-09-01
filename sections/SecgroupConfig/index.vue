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
      <div slot="extra">{{$t('compute.text_188', [_max])}}<help-link :href="href">{{$t('compute.text_189')}}</help-link>
      </div>
      <base-select
        remote
        class="w-50 pr-1"
        v-decorator="secgroupDecorator"
        resource="secgroups"
        :params="params"
        :showSync="true"
        :select-props="{ allowClear: true, placeholder: $t('compute.text_190'), mode: 'multiple' }" />
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
    hypervisor: {
      type: String,
      default: HYPERVISORS_MAP.kvm.key,
    },
    max: {
      type: Number,
    },
  },
  data () {
    // const concatRules = (k, l, r) => k === 'rules' ? R.concat(l, r) : r
    // const secgroupDecMsg = R.mergeDeepWithKey(concatRules,
    //   (this.decorators.secgroup[1] || {}),
    //   { rules: [{ validator: this.validateSecgroups }] },
    // )
    return {
      types: SECGROUP_OPTIONS_MAP,
      isBind: this.decorators.type[1].initialValue === SECGROUP_OPTIONS_MAP.bind.key,
      loading: false,
      disabled: false,
      // secgroupDecorator: [
      //   this.decorators.secgroup[0],
      //   this.secgroupDecMsg,
      // ],
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
      return this.hypervisor.toLowerCase() === HYPERVISORS_MAP.azure.hypervisor.toLowerCase()
    },
    isUCloud () {
      return this.hypervisor.toLowerCase() === HYPERVISORS_MAP.ucloud.hypervisor.toLowerCase()
    },
    isZstack () {
      return this.hypervisor.toLowerCase() === HYPERVISORS_MAP.zstack.hypervisor.toLowerCase()
    },
    _max () {
      if (this.max) {
        return this.max
      }
      return (this.isAzure || this.isUCloud || this.isZstack) ? 1 : 5
    },
    secgroupDecorator () {
      const concatRules = (k, l, r) => k === 'rules' ? R.concat(l, r) : r
      const obj = R.mergeDeepWithKey(concatRules,
        (this.decorators.secgroup[1] || {}),
        { rules: [{ validator: this.validateSecgroups }] },
      )
      if (obj.rules.length > 1) {
        obj.validateFirst = true
      }
      const arr = [
        this.decorators.secgroup[0],
        obj,
      ]
      return arr
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
    hypervisor () {
      if (this.form && this.form.fc) {
        this.form.fc.validateFields([this.decorators.secgroup[0]])
      }
    },
  },
  methods: {
    validateSecgroups (rule, value, callback) {
      const max = this._max
      const maxError = this.$t('compute.text_191', [max])
      const minError = this.$t('compute.text_192')
      if (value.length > max) {
        return callback(maxError)
      }
      if (value.length < 1) {
        return callback(minError)
      }
      return callback()
    },
    handleTypeChange (e) {
      this.isBind = (e.target.value === SECGROUP_OPTIONS_MAP.bind.key)
    },
  },
}
</script>
