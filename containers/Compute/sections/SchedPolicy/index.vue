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
          :options="hostData"
          :disabled-items="disabledHost"
          v-decorator="decorators.schedPolicyHost"
          :params="policyHostParams"
          :extra-opts="preferHostExtraOpts"
          :label-format="labelFormat"
          :need-params="true"
          :filterable="true"
          :showSync="true"
          @change="hostChange"
          @update:initLoaded="onHostInitLoaded"
          :select-props="{ placeholder: lodash.get(schedPolicyOptionsMap, 'host.label') || ''  }" />
      </template>
      <template v-else>
        <!-- <base-select
          class="w-50"
          resource="cloudproviders"
          v-if="showCloudproviderSelect"
          v-decorator="decorators.schedPolicyHost"
          :params="policycloudproviderParams"
          :disabledItems="disabledCloudproviders"
          :label-format="cloudproviderLabel"
          :resList.sync="allCloudproviders"
          :need-params="true"
          :filterable="true"
          :showSync="true"
          :select-props="{ placeholder: lodash.get(schedPolicyOptionsMap, 'host.label') || '' }" /> -->
        <base-select
          v-if="!showCloudproviderSelect"
          class="w-50"
          resource="hosts"
          :disabled-items="disabledHost"
          v-decorator="decorators.schedPolicyHost"
          :params="policyHostParams"
          :extra-opts="preferHostExtraOpts"
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
        :schedtag-params="policySchedtagParams"
        :init-schedtags="initSchedtags"
        @change="onSchedtagDraftChange" />
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
      validator: val => !val || val.fc, // 不传 或者 传就有fc
    },
    hideCloudaccountSched: { // 隐藏 指定云订阅(hosts接口)
      type: Boolean,
      default: false,
    },
    showSchedCloudprovider: { // 指定显示云账号(cloudprovider接口)
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
    /** 工单/草稿：指定调度标签初始数据，在 PolicySchedtag created 时即回填 */
    initSchedtags: {
      type: Array,
      default: () => [],
    },
    /** 工单/草稿：指定宿主机 id，列表 initLoaded 后再写入（防 params clearSelect） */
    initPreferHost: {
      type: String,
      default: '',
    },
    /** 是否处于工单/草稿回填（为 true 时才反复补写 prefer_host） */
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
      pendingPreferHost: '',
      pendingPreferHostName: '',
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
    showCloudproviderSelect () { // 在公有云的情况下
      if (this.form && this.serverType === SERVER_TYPE.public) {
        const schedPolicyType = this.form.fc.getFieldsValue([this.decorators.schedPolicyType[0]])[this.decorators.schedPolicyType[0]]
        if (schedPolicyType === 'host') { // 公有云 此时 host 表示 指定云订阅
          return true
        }
      }
      return this.provider === HYPERVISORS_MAP.hcso.provider || this.provider === HYPERVISORS_MAP.hcs.provider
    },
    disabledCloudproviders () {
      return this.allCloudproviders.filter(val => !this.usableCloudproviderMaps[val.id]).map(val => val.id)
    },
    preferHostExtraOpts () {
      const id = this.pendingPreferHost || this.initPreferHost
      if (!id) return []
      // 用真实 name，避免回填时 extraOpts 用 id 顶掉列表项导致只显示 UUID
      return [{ id, name: this.pendingPreferHostName || id }]
    },
    /** 草稿/回填期望的调度类型（优先于 decorator 默认 default） */
    draftPreferSchedType () {
      if (this.pendingPreferHost || this.initPreferHost) return 'host'
      const draft = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
      if (!draft) return ''
      if (draft.prefer_host) return 'host'
      if (draft.schedPolicyType && this.schedPolicyOptionsMap[draft.schedPolicyType]) {
        return draft.schedPolicyType
      }
      if (Array.isArray(draft.schedtags) && draft.schedtags.length) return 'schedtag'
      return draft.schedPolicyType || ''
    },
  },
  watch: {
    schedPolicyOptionsMap () {
      this.$nextTick(() => this.syncSchedPolicyTypeFromDraftOrCurrent())
    },
    policycloudproviderParams (val, oldV) {
      if (!R.equals(val, oldV)) {
        this.fetchUsagebleCloudprovider()
      }
    },
    initPreferHost: {
      handler (val) {
        if (val) this.initPreferHostData(val)
      },
      immediate: true,
    },
    policyHostParams: {
      deep: true,
      // 对齐 PolicySchedtag：params 变化会 clearSelect，需反复补写
      handler () {
        if (!this.pendingPreferHost) return
        this.$nextTick(() => {
          this.writePendingPreferHost()
          setTimeout(() => this.writePendingPreferHost(), 300)
        })
      },
    },
    preserveInitPreferHost (val) {
      if (!val && !this.readDraftPreferHost() && !this.initPreferHost) {
        this.setPendingPreferHost('')
      }
    },
  },
  created () {
    this.cloudproviderM = new this.$Manager('cloudproviders')
    this.fetchUsagebleCloudprovider()
    this._schedPolicyDraftApplying = false
    this._schedPolicyDraftHydrated = false
    this._schedPolicyUserTouched = false
    // 尽早从 localStorage 种 pending，避免首屏 radio 停在 default 并落盘冲掉草稿
    const draft = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
    if (draft) {
      const preferHost = this.normalizePreferHost(draft.prefer_host)
      if (preferHost) this.setPendingPreferHost(preferHost)
    }
  },
  mounted () {
    this.$nextTick(() => {
      const draft = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
      if (draft) {
        this.applyCreateFormFieldDraft(draft)
      } else if (this.initPreferHost) {
        this.initPreferHostData(this.initPreferHost)
      } else {
        this.syncSchedPolicyTypeFromDraftOrCurrent()
      }
      this._schedPolicyDraftHydrated = true
    })
  },
  methods: {
    normalizePreferHost (val) {
      if (!val) return ''
      if (typeof val === 'object') return val.key || val.id || val.value || ''
      return val
    },
    /**
     * 拉取宿主机名称，避免 extraOpts 仅有 id 时下拉框展示 UUID
     * @param {string} hostId
     */
    async ensurePreferHostName (hostId) {
      if (!hostId) {
        this.pendingPreferHostName = ''
        this._preferHostNameFor = ''
        return
      }
      if (this._preferHostNameFor === hostId && this.pendingPreferHostName && this.pendingPreferHostName !== hostId) {
        return
      }
      this._preferHostNameFor = hostId
      try {
        const { data } = await new this.$Manager('hosts', 'v2').get({
          id: hostId,
          params: { scope: this.$store.getters.scope },
        })
        if (this._preferHostNameFor !== hostId) return
        this.pendingPreferHostName = data?.name || hostId
      } catch (e) {
        if (this._preferHostNameFor === hostId) {
          this.pendingPreferHostName = hostId
        }
      }
    },
    setPendingPreferHost (hostId) {
      const id = this.normalizePreferHost(hostId)
      this.pendingPreferHost = id
      if (id) this.ensurePreferHostName(id)
      else this.pendingPreferHostName = ''
    },
    readDraftPreferHost () {
      if (!this.canReadWriteFormFieldDraft()) return ''
      return this.normalizePreferHost(this.readFormFieldDraft()?.prefer_host)
    },
    /**
     * 同步 radio：草稿/pending 优先，绝不在有 prefer_host 时重置为 default
     */
    syncSchedPolicyTypeFromDraftOrCurrent () {
      if (!this.form?.fc) return
      const field = this.decorators.schedPolicyType[0]
      const current = this.form.fc.getFieldValue(field)
      const preferType = this.draftPreferSchedType || current
      if (preferType && this.schedPolicyOptionsMap[preferType]) {
        if (current !== preferType) {
          this.form.fc.setFieldsValue({ [field]: preferType })
          if (this.form.fd) this.$set(this.form.fd, field, preferType)
        }
        this.setSchedPolicyComponent(preferType)
        if (preferType === 'host') {
          if (!this.pendingPreferHost) {
            this.setPendingPreferHost(
              this.initPreferHost || this.readDraftPreferHost(),
            )
          }
          if (this.pendingPreferHost) this.writePendingPreferHost()
        }
        return
      }
      if (current && this.schedPolicyOptionsMap[current]) {
        this.setSchedPolicyComponent(current)
        return
      }
      // 无草稿偏好时才落到第一项
      if (this._schedPolicyDraftApplying || (this.form.fi && this.form.fi.advanceDraftRestoring)) return
      if (this.pendingPreferHost || this.initPreferHost || this.readDraftPreferHost()) return
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
      const prev = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
      // 首屏未回填完时不要用 default 覆盖已有 host 草稿
      if (
        type === 'default' &&
        prev &&
        (prev.prefer_host || prev.schedPolicyType === 'host') &&
        !this._schedPolicyUserTouched
      ) {
        return prev
      }
      const ret = { schedPolicyType: type }
      if (type === 'host' && this.decorators.schedPolicyHost) {
        const hostField = this.decorators.schedPolicyHost[0]
        let preferHost = this.normalizePreferHost(
          f.getFieldValue(hostField) || (this.form.fd && this.form.fd[hostField]) || this.pendingPreferHost,
        )
        // clearSelect 空值落盘时保留已有 prefer_host，避免嵌套选中被冲掉
        if (!preferHost) preferHost = this.normalizePreferHost(prev && prev.prefer_host)
        if (preferHost) ret.prefer_host = preferHost
      }
      // 调度标签：存与工单同形，回填走 policySchedtagRef.initData
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
        if (!schedtags.length && Array.isArray(prev && prev.schedtags)) schedtags = prev.schedtags
        if (schedtags.length) ret.schedtags = schedtags
      }
      if (type === 'cloudprovider' && this.decorators.cloudprovider) {
        ret.cloudprovider = f.getFieldValue(this.decorators.cloudprovider[0]) || (prev && prev.cloudprovider)
      }
      return ret
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form?.fc) return
      this._schedPolicyDraftApplying = true
      const typeField = this.decorators.schedPolicyType[0]
      const preferHost = this.normalizePreferHost(draft.prefer_host)
      let targetType = draft.schedPolicyType
      if (preferHost) {
        this.setPendingPreferHost(preferHost)
        targetType = 'host'
      } else if (Array.isArray(draft.schedtags) && draft.schedtags.length) {
        targetType = 'schedtag'
      }
      const applyType = () => {
        if (!targetType || !this.form?.fc) return
        // host 不在 options 时仍写入 fc，等 options 就绪后 radio 能对上
        this.form.fc.setFieldsValue({ [typeField]: targetType })
        if (this.form.fd) this.$set(this.form.fd, typeField, targetType)
        this.setSchedPolicyComponent(targetType)
      }
      applyType()
      const finish = () => {
        this._schedPolicyDraftApplying = false
      }
      // 子选择器晚挂载需补写；用户已改过则停，避免冲掉
      const applyDetails = () => {
        if (!this.form?.fc || !draft) return false
        if (this._schedPolicyUserTouched) return false
        applyType()
        if (preferHost && this.decorators.schedPolicyHost) {
          this.setPendingPreferHost(preferHost)
          this.writePendingPreferHost()
        }
        if ((targetType === 'schedtag' || draft.schedPolicyType === 'schedtag') &&
          Array.isArray(draft.schedtags) && draft.schedtags.length) {
          this.setSchedPolicyComponent('schedtag')
          const ref = this.$refs.policySchedtagRef
          if (ref && typeof ref.initData === 'function') {
            ref.initData(draft.schedtags)
          }
        }
        if (draft.cloudprovider && this.decorators.cloudprovider) {
          this.setSchedPolicyComponent('cloudprovider')
          this.form.fc.setFieldsValue({
            [this.decorators.cloudprovider[0]]: draft.cloudprovider,
          })
        }
        return true
      }
      this.$nextTick(() => {
        if (!applyDetails()) {
          finish()
          return
        }
        setTimeout(() => {
          if (!applyDetails()) finish()
        }, 800)
        setTimeout(() => {
          applyDetails()
          finish()
        }, 2000)
      })
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
    /**
     * 工单/草稿回填指定宿主机
     * @param {string} hostId
     */
    initPreferHostData (hostId) {
      if (!hostId) return
      this.setPendingPreferHost(hostId)
      const typeField = this.decorators.schedPolicyType[0]
      if (this.form?.fc) {
        this.form.fc.setFieldsValue({ [typeField]: 'host' })
        if (this.form.fd) this.$set(this.form.fd, typeField, 'host')
      }
      this.setSchedPolicyComponent('host')
      this.writePendingPreferHost()
      // 对齐 PolicySchedtag：晚挂载 / params 晚就绪时再补写几次
      this.$nextTick(() => {
        this.writePendingPreferHost()
        setTimeout(() => this.writePendingPreferHost(), 800)
        setTimeout(() => this.writePendingPreferHost(), 2000)
      })
    },
    /**
     * 写入指定宿主机。pendingPreferHost 本身即回填意图；用户改过后不再强写
     * 宿主机列表已就绪时，不在列表中的草稿宿主机丢弃
     */
    writePendingPreferHost () {
      if (!this.pendingPreferHost || !this.form?.fc) return
      if (this._schedPolicyUserTouched && !this._schedPolicyDraftApplying && !this.preserveInitPreferHost) return
      const hostList = Array.isArray(this.hostData) ? this.hostData : []
      // 空列表不回填；非空未命中则丢弃
      if (!hostList.length) return
      const hit = hostList.some(h => (h.id || h.key) === this.pendingPreferHost)
      if (!hit) {
        this.setPendingPreferHost('')
        return
      }
      if (this.schedPolicyComponent !== 'host') {
        this.setSchedPolicyComponent('host')
      }
      const typeField = this.decorators.schedPolicyType[0]
      const hostField = this.decorators.schedPolicyHost[0]
      const hostDecoratorOpts = (this.decorators.schedPolicyHost && this.decorators.schedPolicyHost[1]) || {}
      // 字段可能尚未随 BaseSelect 挂载注册；先 getFieldDecorator 再 set，对齐 PolicySchedtag
      this.form.fc.getFieldDecorator(hostField, {
        ...hostDecoratorOpts,
        initialValue: this.pendingPreferHost,
      })
      this.form.fc.setFieldsValue({
        [typeField]: 'host',
        [hostField]: this.pendingPreferHost,
      })
      if (this.form.fd) {
        this.$set(this.form.fd, typeField, 'host')
        this.$set(this.form.fd, hostField, this.pendingPreferHost)
      }
    },
    onHostInitLoaded () {
      this.writePendingPreferHost()
      // 列表刚到时 defaultSelect/clearSelect 可能再清一次，稍后再补
      setTimeout(() => this.writePendingPreferHost(), 300)
    },
    change (e) {
      const schedPolicyType = lodash.isString(e) ? e : e.target.value
      // 用户点选 radio 才算触摸；程序化 setSchedPolicyComponent 不走这里的 persist 门闩
      if (!this._schedPolicyDraftApplying && this._schedPolicyDraftHydrated) {
        this._schedPolicyUserTouched = true
      }
      this.setSchedPolicyComponent(schedPolicyType)
      // 用户切走「指定宿主机」时清 pending，避免后续 params 变化又写回来
      if (
        schedPolicyType !== 'host' &&
        !this._schedPolicyDraftApplying
      ) {
        this.setPendingPreferHost('')
      }
      this.$nextTick(() => {
        if (
          !this._schedPolicyDraftApplying &&
          this._schedPolicyDraftHydrated &&
          this._schedPolicyUserTouched
        ) {
          this.persistFormFieldDraftSnapshot()
        }
      })
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
      // BaseSelect clearSelect 会抛空值；有 pending 则补写，不落盘冲掉
      if (!hostId) {
        if (this.pendingPreferHost) {
          this.$nextTick(() => this.writePendingPreferHost())
          return
        }
        return
      }
      this.setPendingPreferHost(hostId)
      this.$nextTick(() => {
        if (
          !this._schedPolicyDraftApplying &&
          this._schedPolicyDraftHydrated
        ) {
          this._schedPolicyUserTouched = true
          this.persistFormFieldDraftSnapshot()
        }
      })
    },
    onSchedtagDraftChange () {
      this.$nextTick(() => {
        if (
          !this._schedPolicyDraftApplying &&
          this._schedPolicyDraftHydrated
        ) {
          this._schedPolicyUserTouched = true
          this.persistFormFieldDraftSnapshot()
        }
      })
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
