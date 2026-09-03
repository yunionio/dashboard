<template>
  <div class="vm-sched-policy">
    <a-form-item>
      <a-radio-group v-decorator="decorators.schedPolicyType" @change="change">
        <a-radio-button v-for="(item, key) of schedPolicyOptionsMap" :value="key" :key="key">{{ item.t ? $t(item.t) : item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="schedPolicyComponent === 'host'" class="host-form-item">
      <template v-if="serverType === 'baremetal'">
        <base-select
          class="w-50"
          ref="preferHostSelect"
          :options="hostData"
          :disabled-items="disabledHost"
          v-decorator="decorators.schedPolicyHost"
          :params="policyHostParams"
          :label-format="labelFormat"
          :need-params="true"
          :filterable="true"
          :showSync="true"
          @change="hostChange"
          @update:initLoaded="onHostInitLoaded"
          :select-props="{ placeholder: lodash.get(schedPolicyOptionsMap, 'host.label') || ''  }" />
      </template>
      <template v-else>
        <base-select
          v-if="!showCloudproviderSelect"
          ref="preferHostSelect"
          class="w-50"
          resource="hosts"
          :disabled-items="disabledHost"
          v-decorator="decorators.schedPolicyHost"
          :params="policyHostParams"
          :label-format="labelFormat"
          :need-params="true"
          :filterable="true"
          :showSync="true"
          @change="hostChange"
          @update:initLoaded="onHostInitLoaded"
          :select-props="{ placeholder: lodash.get(schedPolicyOptionsMap, 'host.label') || '' }" />
      </template>
    </a-form-item>
    <a-form-item v-if="schedPolicyComponent === 'schedtag'">
      <policy-schedtag
        ref="policySchedtagRef"
        :form="form"
        :decorators="decorators.policySchedtag"
        :schedtag-params="policySchedtagParams" />
    </a-form-item>
    <a-form-item v-if="schedPolicyComponent === 'cloudprovider'">
      <base-select
        class="w-50"
        v-decorator="decorators.cloudprovider"
        resource="cloudproviders"
        :params="cloudproviderParams"
        :isDefaultSelect="true"
        :showSync="true"
        :select-props="{ placeholder: $t('compute.text_149') }" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import lodash from 'lodash'
import { SERVER_TYPE, SCHED_POLICY_OPTIONS_MAP } from '@Compute/constants'
import { arrayToObj, uuid } from '@/utils/utils'
import { HYPERVISORS_MAP } from '@/constants'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import PolicySchedtag from './PolicySchedtag'

export default {
  name: 'SchedPolicy',
  components: {
    PolicySchedtag,
  },
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    formDraftKind: {
      type: String,
      default: 'selection',
    },
    decorators: {
      type: Object,
      required: true,
      validator: val => val.schedPolicyType && val.schedPolicyHost && val.policySchedtag,
    },
    serverType: {
      type: String,
      required: true,
      validator: val => SERVER_TYPE[val],
    },
    policySchedtagParams: {
      type: Object,
      default: () => ({}),
    },
    policyHostParams: {
      type: Object,
      default: () => ({}),
    },
    disabledHost: {
      type: Array,
      default: () => [],
    },
    hostData: {
      type: Array,
      default: () => [],
    },
    form: {
      type: Object,
      validator: val => !val || val.fc,
    },
    hideCloudaccountSched: {
      type: Boolean,
      default: false,
    },
    showSchedCloudprovider: {
      type: Boolean,
      default: false,
    },
    cloudproviderParamsExtra: {
      type: Object,
      default: () => ({}),
    },
    provider: {
      type: String,
    },
    policycloudproviderParams: {
      type: Object,
      default: () => ({}),
    },
    /** 工单：调度标签初始数据（由父级 initData 写入 PolicySchedtag） */
    initSchedtags: {
      type: Array,
      default: () => [],
    },
    /** 工单：指定宿主机 id，列表就绪后再写入 */
    initPreferHost: {
      type: String,
      default: '',
    },
    /** 工单/高级回填期间：允许在 clearSelect 后按 pending 再写一次 */
    preserveInitPreferHost: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      schedPolicyComponent: '',
      lodash,
      usableCloudproviderMaps: {},
      allCloudproviders: [],
      /** 期望宿主机 id（列表命中前暂存；父级 keepHost 会读） */
      pendingPreferHost: '',
    }
  },
  computed: {
    schedPolicyOptionsMap () {
      const { default: _default, host, ...rest } = SCHED_POLICY_OPTIONS_MAP
      let ret = {}
      ret.default = { ..._default }
      ret.host = {
        ...host,
        label: host.label[this.serverType],
      }
      if (this.serverType !== SERVER_TYPE.public) {
        ret = {
          ...ret,
          ...rest,
        }
      }
      // 限制非管理后台模式下不能指定宿主机(私有云)、云账号(公有云)
      if (!this.$store.getters.isAdminMode && !this.$store.getters.isDomainMode) {
        delete ret.host
      }
      if (this.hideCloudaccountSched) {
        delete ret.host
      }
      if (this.serverType === SERVER_TYPE.public) {
        delete ret.host
        delete ret.cloudprovider
      }
      return ret
    },
    cloudproviderParams () {
      const params = {
        limit: 0,
        enabled: true,
        'filter.0': 'status.equals("connected")',
        'filter.1': 'health_status.equals("normal")',
        ...this.cloudproviderParamsExtra,
      }
      if (!params.scope && !params.project_domain) {
        params.scope = this.$store.getters.scope
      }
      return params
    },
    showCloudproviderSelect () {
      if (this.form && this.serverType === SERVER_TYPE.public) {
        const schedPolicyType = this.form.fc.getFieldsValue([this.decorators.schedPolicyType[0]])[this.decorators.schedPolicyType[0]]
        if (schedPolicyType === 'host') {
          return true
        }
      }
      return this.provider === HYPERVISORS_MAP.hcso.provider || this.provider === HYPERVISORS_MAP.hcs.provider
    },
    disabledCloudproviders () {
      return this.allCloudproviders.filter(val => !this.usableCloudproviderMaps[val.id]).map(val => val.id)
    },
  },
  watch: {
    // opts（可用调度类型）变化 → 回填草稿 / 默认项
    schedPolicyOptionsMap: {
      immediate: true,
      handler () {
        this.$nextTick(() => this.restoreFormFieldDraftFields())
      },
    },
    // 子控件挂载后再写 host / schedtag / cloudprovider
    schedPolicyComponent (val) {
      this.$nextTick(() => {
        this.tryApplyPendingDraft()
        // 跨 tab：切到指定类型后子组件才挂载，再回填选择值
        if (
          val &&
          this.isFormFieldDraftFromLocal() &&
          this._localDeferredDraft &&
          !this._localDeferredApplied
        ) {
          this.applySelectionFromDeferred(val)
        }
      })
    },
    allCloudproviders (list) {
      if (Array.isArray(list) && list.length) {
        this.tryApplyPendingDraft()
      }
    },
    policycloudproviderParams (val, oldV) {
      if (!R.equals(val, oldV)) {
        this.fetchUsagebleCloudprovider()
      }
    },
    initPreferHost: {
      immediate: true,
      handler (val) {
        if (val) this.initPreferHostData(val)
      },
    },
    // params 变化会 clearSelect / 重拉列表：等 initLoaded 再命中写
    policyHostParams: {
      deep: true,
      handler (val, oldV) {
        if (R.equals(val, oldV)) return
        if (!(Array.isArray(this.hostData) && this.hostData.length)) {
          this._preferHostListLoaded = false
        }
        if (!this.pendingPreferHost && !this._pendingDraft) return
        this.$nextTick(() => this.tryApplyPendingDraft())
      },
    },
    hostData (list) {
      if (Array.isArray(list) && list.length && this.pendingPreferHost) {
        this.$nextTick(() => this.tryApplyPendingDraft())
      }
    },
  },
  created () {
    this.cloudproviderM = new this.$Manager('cloudproviders')
    this.fetchUsagebleCloudprovider()
    this._draftApplying = false
    this._draftHydrated = false
    this._userTouched = false
    this._preferHostListLoaded = false
    this._pendingDraft = null
    this._localDeferredDraft = null
    this._localDeferredApplied = false
  },
  mounted () {
    this.$nextTick(() => {
      this._draftHydrated = true
    })
  },
  methods: {
    normalizePreferHost (val) {
      if (!val) return ''
      if (typeof val === 'object') return val.key || val.id || val.value || ''
      return val
    },
    setPendingPreferHost (hostId) {
      this.pendingPreferHost = this.normalizePreferHost(hostId)
    },
    readDraftPreferHost () {
      if (!this.canRestoreFormFieldDraft()) return ''
      return this.normalizePreferHost(this.readFormFieldDraft()?.prefer_host)
    },
    restoreFormFieldDraftFields () {
      if (!this.canRestoreFormFieldDraft()) {
        this.ensureDefaultSchedPolicyType()
        return false
      }
      if (typeof this.isCreateFormFieldTouched === 'function' && this.isCreateFormFieldTouched(this.formDraftKey)) {
        return false
      }
      const draft = this.readFormFieldDraft()
      if (draft) {
        this.applyCreateFormFieldDraft(draft)
        return true
      }
      if (this.initPreferHost) {
        this.initPreferHostData(this.initPreferHost)
        return true
      }
      this.ensureDefaultSchedPolicyType()
      return false
    },
    /** 无草稿偏好时落到第一项 */
    ensureDefaultSchedPolicyType () {
      if (!this.form?.fc || this._userTouched || this._draftApplying) return
      if (this.pendingPreferHost || this.initPreferHost || this.readDraftPreferHost()) return
      const field = this.decorators.schedPolicyType[0]
      const current = this.form.fc.getFieldValue(field)
      if (current && this.schedPolicyOptionsMap[current]) {
        this.setSchedPolicyComponent(current)
        return
      }
      const keys = Object.keys(this.schedPolicyOptionsMap || {})
      if (!keys.length) return
      const schedPolicyType = this.schedPolicyOptionsMap[keys[0]].key
      this.form.fc.setFieldsValue({ [field]: schedPolicyType })
      this.setSchedPolicyComponent(schedPolicyType)
    },
    setSchedPolicyComponent (schedPolicyType) {
      switch (schedPolicyType) {
        case lodash.get(this.schedPolicyOptionsMap, 'default.key'):
        case 'default':
          this.schedPolicyComponent = ''
          break
        case lodash.get(this.schedPolicyOptionsMap, 'host.key'):
        case 'host':
          this.schedPolicyComponent = 'host'
          break
        case lodash.get(this.schedPolicyOptionsMap, 'schedtag.key'):
        case 'schedtag':
          this.schedPolicyComponent = 'schedtag'
          break
        case lodash.get(this.schedPolicyOptionsMap, 'cloudprovider.key'):
        case 'cloudprovider':
          this.schedPolicyComponent = 'cloudprovider'
          break
        default:
          break
      }
    },
    getCreateFormFieldDraftSnapshot () {
      const f = this.form && this.form.fc
      if (!f) return undefined
      const typeField = this.decorators.schedPolicyType[0]
      let type = f.getFieldValue(typeField) || (this.form.fd && this.form.fd[typeField])
      if (!type && this.schedPolicyComponent) type = this.schedPolicyComponent
      if (!type && this.pendingPreferHost) type = 'host'
      const ret = { schedPolicyType: type || 'default' }
      if (type === 'host' && this.decorators.schedPolicyHost) {
        const hostField = this.decorators.schedPolicyHost[0]
        const preferHost = this.normalizePreferHost(
          f.getFieldValue(hostField) || (this.form.fd && this.form.fd[hostField]) || this.pendingPreferHost,
        )
        if (preferHost) ret.prefer_host = preferHost
      }
      if (type === 'schedtag') {
        const list = this.$refs.policySchedtagRef && this.$refs.policySchedtagRef.schedtagPolicyList
        let schedtags = []
        if (Array.isArray(list) && list.length) {
          schedtags = list.map((item) => {
            const id = item.schedtag || f.getFieldValue(this.decorators.policySchedtag.schedtags(item.key)[0])
            const strategy = item.policy || f.getFieldValue(this.decorators.policySchedtag.policys(item.key)[0])
            return { id, strategy }
          }).filter(t => t.id)
        }
        ret.schedtags = schedtags
      }
      if (type === 'cloudprovider' && this.decorators.cloudprovider) {
        const cp = f.getFieldValue(this.decorators.cloudprovider[0])
        if (cp) ret.cloudprovider = cp
      }
      return ret
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form?.fc) return
      // 跨 tab：不改类型；用户切到对应类型后再回填选择值
      if (this.isFormFieldDraftFromLocal()) {
        this._localDeferredDraft = draft
        this._localDeferredApplied = false
        return
      }
      this._pendingDraft = draft
      this.tryApplyPendingDraft()
    },
    /**
     * 就绪后写草稿：类型 → host/schedtag/cloudprovider（opts 命中才写）
     */
    tryApplyPendingDraft () {
      const draft = this._pendingDraft
      if (!draft || !this.form?.fc) return true
      if (this.isFormFieldDraftFromLocal()) return true

      this._draftApplying = true
      try {
        const typeField = this.decorators.schedPolicyType[0]
        const preferHost = this.normalizePreferHost(draft.prefer_host)
        let targetType = draft.schedPolicyType
        if (preferHost) {
          this.setPendingPreferHost(preferHost)
          targetType = 'host'
        } else if (Array.isArray(draft.schedtags) && draft.schedtags.length) {
          targetType = 'schedtag'
        }

        if (targetType && this.schedPolicyOptionsMap[targetType]) {
          this.form.fc.setFieldsValue({ [typeField]: targetType })
          if (this.form.fd) this.$set(this.form.fd, typeField, targetType)
          this.setSchedPolicyComponent(targetType)
        }

        let complete = true
        if (targetType === 'host' && preferHost && this.decorators.schedPolicyHost) {
          const status = this.writePreferHostIfReady(preferHost)
          if (status === 'wait') complete = false
        } else if (
          (targetType === 'schedtag' || draft.schedPolicyType === 'schedtag') &&
          Array.isArray(draft.schedtags) && draft.schedtags.length
        ) {
          const ref = this.$refs.policySchedtagRef
          if (ref && typeof ref.initData === 'function') {
            ref.initData(draft.schedtags)
          } else {
            complete = false
          }
        } else if (targetType === 'cloudprovider' && draft.cloudprovider && this.decorators.cloudprovider) {
          const list = Array.isArray(this.allCloudproviders) ? this.allCloudproviders : []
          if (!list.length) {
            complete = false
          } else if (list.some(item => (item.id || item.key) === draft.cloudprovider)) {
            this.setSchedPolicyComponent('cloudprovider')
            this.form.fc.setFieldsValue({
              [this.decorators.cloudprovider[0]]: draft.cloudprovider,
            })
          }
        }

        if (complete) this._pendingDraft = null
        return complete
      } finally {
        this._draftApplying = false
      }
    },
    isPreferHostParamsReady () {
      if (Array.isArray(this.hostData) && this.hostData.length) return true
      const params = this.policyHostParams || {}
      return !!(params.zone || params.zone_id)
    },
    resolvePreferHostList () {
      if (Array.isArray(this.hostData) && this.hostData.length) {
        return this.hostData
      }
      if (!this._preferHostListLoaded) return undefined
      const selectRef = this.$refs.preferHostSelect
      if (!selectRef) return undefined
      const list = Array.isArray(selectRef.resList) && selectRef.resList.length
        ? selectRef.resList
        : selectRef.sourceList
      return Array.isArray(list) ? list : []
    },
    /**
     * 列表命中才写 prefer_host
     * @returns {'ok'|'wait'|'drop'}
     */
    writePreferHostIfReady (hostId) {
      const id = this.normalizePreferHost(hostId) || this.pendingPreferHost
      if (!id || !this.form?.fc) return 'drop'
      if (this._userTouched && !this._draftApplying && !this.preserveInitPreferHost) return 'drop'
      if (!this.isPreferHostParamsReady()) return 'wait'
      const hostList = this.resolvePreferHostList()
      if (hostList === undefined) return 'wait'
      if (!hostList.length) {
        this.setPendingPreferHost('')
        this.clearPreferHostFormValue()
        return 'drop'
      }
      const hit = hostList.find(h => (h.id || h.key) === id)
      if (!hit) {
        this.setPendingPreferHost('')
        this.clearPreferHostFormValue()
        return 'drop'
      }
      this.setPendingPreferHost(id)
      this.applyPreferHostToForm(id)
      return 'ok'
    },
    clearPreferHostFormValue () {
      if (!this.form?.fc || !this.decorators.schedPolicyHost) return
      const hostField = this.decorators.schedPolicyHost[0]
      this.form.fc.setFieldsValue({ [hostField]: undefined })
      if (this.form.fd && Object.prototype.hasOwnProperty.call(this.form.fd, hostField)) {
        this.$delete(this.form.fd, hostField)
      }
    },
    applyPreferHostToForm (hostId) {
      if (!hostId || !this.form?.fc) return
      if (this.schedPolicyComponent !== 'host') {
        this.setSchedPolicyComponent('host')
      }
      const typeField = this.decorators.schedPolicyType[0]
      const hostField = this.decorators.schedPolicyHost[0]
      const hostDecoratorOpts = (this.decorators.schedPolicyHost && this.decorators.schedPolicyHost[1]) || {}
      this.form.fc.getFieldDecorator(hostField, {
        ...hostDecoratorOpts,
        initialValue: hostId,
      })
      this.form.fc.setFieldsValue({
        [typeField]: 'host',
        [hostField]: hostId,
      })
      if (this.form.fd) {
        this.$set(this.form.fd, typeField, 'host')
        this.$set(this.form.fd, hostField, hostId)
      }
    },
    /** 跨 tab：用户切换类型后回填选择值 */
    applySelectionFromDeferred (schedPolicyType) {
      const draft = this._localDeferredDraft
      if (!draft || this._localDeferredApplied || !schedPolicyType) return
      this._draftApplying = true
      try {
        if (schedPolicyType === 'host') {
          const preferHost = this.normalizePreferHost(draft.prefer_host)
          if (!preferHost || !this.decorators.schedPolicyHost) return
          this.setPendingPreferHost(preferHost)
          this._pendingDraft = { schedPolicyType: 'host', prefer_host: preferHost }
          const status = this.writePreferHostIfReady(preferHost)
          if (status === 'ok' || status === 'drop') {
            this._localDeferredApplied = true
            this._pendingDraft = null
          }
        } else if (schedPolicyType === 'schedtag') {
          // 跨 tab：只回填一行（选择类），不整表恢复多行
          if (!Array.isArray(draft.schedtags) || !draft.schedtags.length) return
          const ref = this.$refs.policySchedtagRef
          if (ref && typeof ref.initData === 'function') {
            ref.initData(draft.schedtags.slice(0, 1))
            this._localDeferredApplied = true
          }
        } else if (schedPolicyType === 'cloudprovider' && draft.cloudprovider && this.decorators.cloudprovider) {
          const list = Array.isArray(this.allCloudproviders) ? this.allCloudproviders : []
          if (!list.length) return
          this._localDeferredApplied = true
          if (!list.some(item => (item.id || item.key) === draft.cloudprovider)) return
          this.form.fc.setFieldsValue({
            [this.decorators.cloudprovider[0]]: draft.cloudprovider,
          })
        }
      } finally {
        this.$nextTick(() => {
          this._draftApplying = false
        })
      }
    },
    cloudproviderLabel (item) {
      let label = item.name
      if (!this.usableCloudproviderMaps[item.id]) {
        if (item.status !== 'connected') {
          label += this.$t('compute.text_184')
        } else if (item.health_status !== 'normal') {
          label += this.$t('compute.text_185')
        } else if (item.enabled === false) {
          label += this.$t('compute.text_186')
        } else {
          label += this.$t('compute.text_187')
        }
      }
      return label
    },
    async fetchUsagebleCloudprovider () {
      try {
        const usageParmas = {
          enabled: true,
          'filter.0': 'status.equals("connected")',
          'filter.1': 'health_status.equals("normal")',
          usable: true,
          $t: uuid(),
        }
        const { data: { data = [] } } = await this.cloudproviderM.list({ params: { ...this.policycloudproviderParams, ...usageParmas } })
        this.usableCloudproviderMaps = arrayToObj(data)
      } catch (error) {
        throw error
      }
    },
    /** 工单回填指定宿主机 */
    initPreferHostData (hostId) {
      if (!hostId) return
      this._pendingDraft = { schedPolicyType: 'host', prefer_host: hostId }
      this.setPendingPreferHost(hostId)
      const typeField = this.decorators.schedPolicyType[0]
      if (this.form?.fc) {
        this.form.fc.setFieldsValue({ [typeField]: 'host' })
        if (this.form.fd) this.$set(this.form.fd, typeField, 'host')
      }
      this.setSchedPolicyComponent('host')
      this.tryApplyPendingDraft()
    },
    onHostInitLoaded () {
      this._preferHostListLoaded = true
      this.tryApplyPendingDraft()
      if (
        this.isFormFieldDraftFromLocal() &&
        this._localDeferredDraft &&
        !this._localDeferredApplied
      ) {
        const typeField = this.decorators.schedPolicyType[0]
        const type = this.form?.fc?.getFieldValue(typeField)
        this.applySelectionFromDeferred(type)
      }
    },
    change (e) {
      const schedPolicyType = lodash.isString(e) ? e : e.target.value
      if (!this._draftApplying && this._draftHydrated) {
        this._userTouched = true
      }
      this.setSchedPolicyComponent(schedPolicyType)
      if (
        this.isFormFieldDraftFromLocal() &&
        this._localDeferredDraft &&
        !this._localDeferredApplied
      ) {
        this.$nextTick(() => this.applySelectionFromDeferred(schedPolicyType))
      }
      if (schedPolicyType !== 'host' && !this._draftApplying) {
        this.setPendingPreferHost('')
      }
    },
    labelFormat (item) {
      if (this.serverType === SERVER_TYPE.public) {
        return `${item.account} / ${item.manager} / ${item.zone}`
      }
      return item.name
    },
    hostChange (e) {
      this.$emit('change', e)
      const hostId = this.normalizePreferHost(e)
      // BaseSelect clearSelect：回填中有 pending 则等列表再写，不当作用户清空
      if (!hostId) {
        if ((this._draftApplying || this.preserveInitPreferHost) && this.pendingPreferHost) {
          this.$nextTick(() => this.writePreferHostIfReady(this.pendingPreferHost))
        }
        return
      }
      this.setPendingPreferHost(hostId)
      if (!this._draftApplying && this._draftHydrated) {
        this._userTouched = true
      }
    },
  },
}
</script>

<style lang="less" scoped>
.vm-sched-policy {
  .host-form-item ::v-deep .ant-form-item-control {
    width: 100%;
  }
}
</style>
