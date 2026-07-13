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
    <a-form-item
      class="mb-0"
      v-if="isNetworkTag"
      :validate-status="networkTagError ? 'error' : ''"
      :help="networkTagError || undefined">
      <div slot="extra">{{ $t('validator.secgroupNetworkTag') }}</div>
      <a-select
        ref="networkTagsSelect"
        v-decorator="networkTagsDecorator"
        mode="tags"
        allow-clear
        :show-arrow="false"
        dropdown-class-name="secgroup-network-tags-dropdown"
        class="w-50 pr-1"
        :placeholder="$t('compute.network_tag_placeholder')"
        :token-separators="[',']"
        @change="handleNetworkTagsChange" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { SECGROUP_OPTIONS_MAP } from '@Compute/constants'
import { HYPERVISORS_MAP, isUcloudLikeHypervisor } from '@/constants'
import { validate } from '@/utils/validate'

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
    showSecgroupBind: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    // const concatRules = (k, l, r) => k === 'rules' ? R.concat(l, r) : r
    // const secgroupDecMsg = R.mergeDeepWithKey(concatRules,
    //   (this.decorators.secgroup[1] || {}),
    //   { rules: [{ validator: this.validateSecgroups }] },
    // )
    return {
      isBind: this.decorators.type[1].initialValue === SECGROUP_OPTIONS_MAP.bind.key,
      isNetworkTag: this.decorators.type[1].initialValue === SECGROUP_OPTIONS_MAP.networkTag.key,
      networkTagInputEl: null,
      networkTagComposing: false,
      networkTagSyncing: false,
      networkTagError: '',
      loading: false,
      disabled: false,
      // secgroupDecorator: [
      //   this.decorators.secgroup[0],
      //   this.secgroupDecMsg,
      // ],
    }
  },
  computed: {
    types () {
      const types = { ...SECGROUP_OPTIONS_MAP }
      if (this.isInCloudSphere || !this.showSecgroupBind) {
        delete types.bind
      }
      if (!this.isGoogle) {
        delete types.networkTag
      }
      return types
    },
    params () {
      const params = {
        limit: 20,
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
    isInCloudSphere () {
      return this.hypervisor.toLowerCase() === HYPERVISORS_MAP.incloudsphere.hypervisor.toLowerCase()
    },
    isAzure () {
      return this.hypervisor.toLowerCase() === HYPERVISORS_MAP.azure.hypervisor.toLowerCase()
    },
    isUCloud () {
      return isUcloudLikeHypervisor(this.hypervisor)
    },
    isZstack () {
      return this.hypervisor.toLowerCase() === HYPERVISORS_MAP.zstack.hypervisor.toLowerCase()
    },
    isGoogle () {
      return this.hypervisor.toLowerCase() === HYPERVISORS_MAP.google.hypervisor.toLowerCase()
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
        {
          rules: [{ validator: this.validateSecgroups }],
          initialValue: this.decorators.secgroup[1].initialValue || [],
        },
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
    networkTagsDecorator () {
      const concatRules = (k, l, r) => k === 'rules' ? R.concat(l, r) : r
      const obj = R.mergeDeepWithKey(concatRules,
        (this.decorators.network_tags[1] || {}),
        {
          rules: [{ validator: this.validateNetworkTags }],
          initialValue: this.decorators.network_tags[1]?.initialValue || [],
        },
      )
      return [
        this.decorators.network_tags[0],
        obj,
      ]
    },
  },
  watch: {
    isSnapshotImageType (val) {
      if (val) {
        this.disabled = true
        this.form.fc.setFieldsValue({
          [this.decorators.type[0]]: SECGROUP_OPTIONS_MAP.none.key,
        })
        this.isBind = false
        this.isNetworkTag = false
        this.networkTagError = ''
      } else {
        this.disabled = false
      }
    },
    hypervisor () {
      if (this.form && this.form.fc) {
        this.form.fc.validateFields([this.decorators.secgroup[0]])
      }
    },
    types (val) {
      if (!val.bind && this.form.fd && this.form.fd[this.decorators.type[0]] === 'bind' && this.form && this.form.fc) {
        this.form.fc.setFieldsValue({
          [this.decorators.type[0]]: 'default',
        })
        this.isBind = false
      }
      if (!val.networkTag && this.form?.fd?.[this.decorators.type[0]] === SECGROUP_OPTIONS_MAP.networkTag.key && this.form?.fc) {
        this.form.fc.setFieldsValue({
          [this.decorators.type[0]]: SECGROUP_OPTIONS_MAP.none.key,
        })
        this.isNetworkTag = false
      }
    },
    isNetworkTag (val) {
      if (!val) {
        this.networkTagError = ''
      }
      if (val) {
        this.bindNetworkTagInputKeydown()
      } else {
        this.unbindNetworkTagInputKeydown()
      }
    },
  },
  mounted () {
    this.bindNetworkTagInputKeydown()
  },
  beforeDestroy () {
    this.unbindNetworkTagInputKeydown()
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
    validateNetworkTags (rule, value, callback) {
      if (!value || !value.length) {
        return callback(this.$t('compute.network_tag_required'))
      }
      const tags = this.normalizeNetworkTags(value)
      const invalidTag = tags.find(tag => validate(tag, 'secgroupNetworkTag') !== true)
      if (invalidTag) {
        return callback(this.$t('validator.secgroupNetworkTag'))
      }
      return callback()
    },
    normalizeNetworkTags (value) {
      return (value || []).map(tag => (tag || '').trim()).filter(Boolean)
    },
    getNetworkTagsValidateError (value) {
      const tags = this.normalizeNetworkTags(value)
      if (!tags.length) return null
      const invalidTag = tags.find(tag => validate(tag, 'secgroupNetworkTag') !== true)
      if (invalidTag) return this.$t('validator.secgroupNetworkTag')
      return null
    },
    syncNetworkTagsValidation (value) {
      this.networkTagError = this.getNetworkTagsValidateError(value) || ''
    },
    handleNetworkTagsChange (value) {
      if (this.networkTagSyncing || !this.form?.fc) return
      const field = this.decorators.network_tags[0]
      const tags = this.normalizeNetworkTags(value)
      const current = this.normalizeNetworkTags(this.form.fc.getFieldValue(field))
      if (JSON.stringify(tags) !== JSON.stringify(current)) {
        this.networkTagSyncing = true
        this.form.fc.setFieldsValue({ [field]: tags })
        this.$nextTick(() => {
          this.networkTagSyncing = false
          this.clearNetworkTagSearchInput()
        })
      }
      this.syncNetworkTagsValidation(tags)
    },
    handleTypeChange (e) {
      const value = e.target.value
      this.isBind = value === SECGROUP_OPTIONS_MAP.bind.key
      this.isNetworkTag = value === SECGROUP_OPTIONS_MAP.networkTag.key
      if (this.isNetworkTag) {
        this.$nextTick(() => {
          this.bindNetworkTagInputKeydown()
        })
      } else {
        this.unbindNetworkTagInputKeydown()
      }
    },
    bindNetworkTagInputKeydown () {
      if (!this.isNetworkTag) return
      this.$nextTick(() => {
        const input = this.$refs.networkTagsSelect?.$el?.querySelector('input')
        if (!input || input === this.networkTagInputEl) return
        this.unbindNetworkTagInputKeydown()
        this.networkTagInputEl = input
        input.addEventListener('keydown', this.handleNetworkTagInputKeyDown, true)
        input.addEventListener('compositionstart', this.handleNetworkTagCompositionStart)
        input.addEventListener('compositionend', this.handleNetworkTagCompositionEnd)
      })
    },
    unbindNetworkTagInputKeydown () {
      if (!this.networkTagInputEl) return
      this.networkTagInputEl.removeEventListener('keydown', this.handleNetworkTagInputKeyDown, true)
      this.networkTagInputEl.removeEventListener('compositionstart', this.handleNetworkTagCompositionStart)
      this.networkTagInputEl.removeEventListener('compositionend', this.handleNetworkTagCompositionEnd)
      this.networkTagInputEl = null
      this.networkTagComposing = false
    },
    handleNetworkTagCompositionStart () {
      this.networkTagComposing = true
    },
    handleNetworkTagCompositionEnd () {
      this.networkTagComposing = false
    },
    handleNetworkTagInputKeyDown (e) {
      if (e.key !== 'Enter') return
      // 中文输入法组字期间，Enter 用于确认候选/英文，不应生成 tag
      if (e.isComposing || e.keyCode === 229 || this.networkTagComposing) return
      e.preventDefault()
      e.stopPropagation()
      const value = (e.target.value || '').trim()
      if (!value || !this.form?.fc) return
      const field = this.decorators.network_tags[0]
      const current = [...(this.form.fc.getFieldValue(field) || [])]
      if (!current.includes(value)) {
        this.networkTagSyncing = true
        this.form.fc.setFieldsValue({
          [field]: [...current, value],
        })
      }
      this.$nextTick(() => {
        this.networkTagSyncing = false
        this.clearNetworkTagSearchInput()
        this.syncNetworkTagsValidation(this.form.fc.getFieldValue(field))
      })
    },
    clearNetworkTagSearchInput () {
      const input = this.networkTagInputEl || this.$refs.networkTagsSelect?.$el?.querySelector('input')
      if (!input) return
      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))
    },
  },
}
</script>

<style lang="less">
.secgroup-network-tags-dropdown {
  display: none !important;
  height: 0 !important;
  overflow: hidden !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
</style>
