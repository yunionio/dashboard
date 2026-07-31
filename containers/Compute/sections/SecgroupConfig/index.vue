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
        :extra-opts="secgroupExtraOpts"
        :showSync="true"
        :select-props="{ allowClear: true, placeholder: $t('compute.text_190'), mode: 'multiple' }"
        @update:initLoaded="onSecgroupInitLoaded"
        @change="onSecgroupChange" />
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

import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
export default {
  name: 'SecgroupConfig',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
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
    /**
     * 工单/草稿回填期间：不要因 showSecgroupBind 短暂变化把已选「指定安全组」冲回默认
     */
    ignoreAutoTypeReset: {
      type: Boolean,
      default: false,
    },
    /**
     * 工单/草稿：指定安全组 id 列表。BaseSelect 会在 params 变化时清空，需在 initLoaded 后反复写入
     */
    initSecgroups: {
      type: Array,
      default: () => [],
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
      pendingInitSecgroups: [],
      /** id -> name，避免 extraOpts 只用 id 导致标签展示 UUID */
      pendingSecgroupNameMap: {},
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
    secgroupExtraOpts () {
      return (this.pendingInitSecgroups || []).map(id => ({
        id,
        name: this.pendingSecgroupNameMap[id] || id,
      }))
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
      if (this.ignoreAutoTypeReset) return
      if (this.canReadWriteFormFieldDraft() && this.readFormFieldDraft()?.secgroup_type) return
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
    // 程序化 setFieldsValue 不会走 @change，需同步本地 isBind
    'form.fd.secgroup_type' (val) {
      this.isBind = val === SECGROUP_OPTIONS_MAP.bind.key
      this.isNetworkTag = val === SECGROUP_OPTIONS_MAP.networkTag.key
    },
    initSecgroups: {
      handler (val) {
        const ids = this.normalizeSecgroupIds(val)
        if (ids.length) this.initData(ids)
      },
      immediate: true,
    },
    params: {
      handler () {
        if (this.pendingInitSecgroups.length) {
          this.$nextTick(() => this.writePendingSecgroups())
        }
      },
      deep: true,
    },
    ignoreAutoTypeReset (val) {
      if (!val) {
        this.pendingInitSecgroups = []
        this.pendingSecgroupNameMap = {}
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
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f) return undefined
      const typeField = this.decorators.type[0]
      const secgroupField = this.decorators.secgroup[0]
      const networkTagField = this.decorators.network_tags?.[0]
      return {
        secgroup_type: f.getFieldValue(typeField),
        secgroup: f.getFieldValue(secgroupField),
        network_tag: networkTagField ? f.getFieldValue(networkTagField) : undefined,
        network_tags: networkTagField ? f.getFieldValue(networkTagField) : undefined,
      }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form?.fc) return
      const typeField = this.decorators.type[0]
      const secgroupField = this.decorators.secgroup[0]
      const networkTagField = this.decorators.network_tags?.[0]
      if (draft.secgroup_type) {
        this.isBind = draft.secgroup_type === SECGROUP_OPTIONS_MAP.bind.key
        this.isNetworkTag = draft.secgroup_type === SECGROUP_OPTIONS_MAP.networkTag.key
        this.form.fc.setFieldsValue({ [typeField]: draft.secgroup_type })
      }
      const tagVal = draft.network_tags != null ? draft.network_tags : draft.network_tag
      if (networkTagField && tagVal != null) {
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ [networkTagField]: tagVal })
        })
      }
      if (draft.secgroup) {
        const ids = this.normalizeSecgroupIds(Array.isArray(draft.secgroup) ? draft.secgroup : [draft.secgroup])
        if (ids.length) {
          this.setPendingInitSecgroups(ids)
          this.isBind = true
          this.form.fc.setFieldsValue({ [typeField]: SECGROUP_OPTIONS_MAP.bind.key })
          // BaseSelect 在 isBind 后才挂载，需延迟/initLoaded 再写具体安全组
          const write = () => {
            if (!this.pendingInitSecgroups.length || !this.form?.fc) return
            this.isBind = true
            this.form.fc.setFieldsValue({
              [typeField]: SECGROUP_OPTIONS_MAP.bind.key,
              [secgroupField]: [...this.pendingInitSecgroups],
            })
          }
          this.$nextTick(() => {
            write()
            setTimeout(write, 800)
            setTimeout(write, 2000)
          })
        }
      }
    },

    normalizeSecgroupIds (secgroups) {
      if (!Array.isArray(secgroups) || !secgroups.length) return []
      return secgroups.map((item) => {
        if (item == null) return null
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        return item.id || item.key || item.value || null
      }).filter(Boolean)
    },
    /**
     * 设置 pending 并拉取名称（BaseSelect extraOpts 优先于列表项，name 必须是真名）
     * @param {string[]} ids
     */
    setPendingInitSecgroups (ids) {
      const next = this.normalizeSecgroupIds(ids)
      this.pendingInitSecgroups = next
      if (!next.length) {
        this.pendingSecgroupNameMap = {}
        return
      }
      this.ensurePendingSecgroupNames(next)
    },
    /**
     * 批量拉取安全组名称，避免回填标签展示 UUID
     * @param {string[]} ids
     */
    async ensurePendingSecgroupNames (ids) {
      const list = (ids || []).filter(Boolean)
      if (!list.length) return
      const missing = list.filter((id) => {
        const name = this.pendingSecgroupNameMap[id]
        return !name || name === id
      })
      if (!missing.length) return
      const reqToken = missing.slice().sort().join(',')
      this._secgroupNameFetchToken = reqToken
      try {
        const params = {
          limit: missing.length,
          details: true,
          filter: `id.in(${missing.map(id => `'${id}'`).join(',')})`,
        }
        if (this.secgroupParams?.project_domain) {
          params.project_domain = this.secgroupParams.project_domain
        } else {
          params.scope = this.$store.getters.scope
        }
        const { data: { data = [] } } = await new this.$Manager('secgroups', 'v2').list({ params })
        if (this._secgroupNameFetchToken !== reqToken) return
        const next = { ...this.pendingSecgroupNameMap }
        data.forEach((item) => {
          if (item?.id) next[item.id] = item.name || item.id
        })
        missing.forEach((id) => {
          if (!next[id]) next[id] = id
        })
        this.pendingSecgroupNameMap = next
      } catch (e) {
        if (this._secgroupNameFetchToken !== reqToken) return
        const next = { ...this.pendingSecgroupNameMap }
        missing.forEach((id) => {
          if (!next[id]) next[id] = id
        })
        this.pendingSecgroupNameMap = next
      }
    },
    /**
     * 工单/草稿回填入口
     * @param {Array} secgroups
     */
    initData (secgroups) {
      const ids = this.normalizeSecgroupIds(secgroups)
      if (!ids.length) return
      this.setPendingInitSecgroups(ids)
      this.isBind = true
      this.writePendingSecgroups()
    },
    writePendingSecgroups () {
      if (!this.pendingInitSecgroups.length || !this.form?.fc) return
      // 工单：ignoreAutoTypeReset；控件草稿：保留 pending 以便 BaseSelect 清空后再写
      const draft = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
      const allowRewrite = this.ignoreAutoTypeReset ||
        !!(draft && (draft.secgroup || draft.secgroup_type === SECGROUP_OPTIONS_MAP.bind.key))
      if (!allowRewrite) {
        this.setPendingInitSecgroups([])
        return
      }
      this.isBind = true
      this.form.fc.setFieldsValue({
        [this.decorators.type[0]]: SECGROUP_OPTIONS_MAP.bind.key,
        [this.decorators.secgroup[0]]: [...this.pendingInitSecgroups],
      })
    },
    onSecgroupInitLoaded () {
      // BaseSelect params 变化会 clearSelect，列表就绪后再写回
      this.writePendingSecgroups()
    },
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
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
    onSecgroupChange () {
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
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
