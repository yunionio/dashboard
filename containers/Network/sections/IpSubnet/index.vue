<template>
  <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="label" :required="isRequired">
    <a-row :gutter="8">
      <a-col :span="showIpConfig ? 8 : 12">
        <a-form-item
          :wrapperCol="{ span: 24 }"
          class="mb-0 mr-1">
          <base-select
            ref="vpcSelect"
            class="w-100"
            v-decorator="decorator.vpc"
            :resource="vpcResource"
            remote
            :label-format="vpcLabelFormat"
            :isDefaultSelect="true"
            :need-params="true"
            :params="vpcParmasConcat"
            :mapper="vpcResourceMapper"
            :item.sync="selectedVpc"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_194') }"
            @update:initLoaded="onVpcInitLoaded" />
        </a-form-item>
      </a-col>
      <a-col :span="showIpConfig ? 8 : 12">
        <a-form-item
          :wrapperCol="{ span: 24 }"
          class="mb-0 mr-1">
          <base-select
            ref="networkSelect"
            class="w-100"
            v-decorator="decorator.network"
            resource="networks"
            remote
            :need-params="true"
            :isDefaultSelect="true"
            :params="networkParamsConcat"
            :mapper="networkResourceMapper"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_195') }"
            @update:initLoaded="onNetworkInitLoaded" />
            <div slot="extra" v-if="helplink">
              {{helplink.ipSubnetHelp}}<help-link :href="helplink.ipSubnetHref">{{$t('network.text_26')}}</help-link>
            </div>
        </a-form-item>
      </a-col>
      <a-col :span="8" v-if="showIpConfig">
        <a-button v-if="!ipShow" type="link" class="mr-1 mt-1" @click="triggerShowIp">{{$t('compute.text_198')}}</a-button>
        <a-row v-else>
          <a-col :span="21">
            <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
              <a-input
                :placeholder="$t('compute.text_197')"
                v-decorator="decorator.ip_addr" />
            </a-form-item>
          </a-col>
          <a-col :span="3">
            <a-button type="link" class="mt-1" @click="triggerShowIp">{{$t('compute.text_135')}}</a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </a-form-item>
</template>

<script>
import i18n from '@/locales'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'IpSubnet',
  mixins: [createFormFieldDraftMixin],
  // 对象写法，避免覆盖 mixin 草稿 inject
  inject: {
    form: { default: undefined },
  },
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    labelCol: {
      type: Object,
      default: () => {
        return {
          span: 24,
        }
      },
    },
    wrapperCol: {
      type: Object,
      default: () => {
        return {
          span: 24,
        }
      },
    },
    label: {
      type: String,
      default: i18n.t('dictionary.region'),
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    decorator: {
      type: Object,
      required: true,
    },
    networkParams: {
      type: Object,
    },
    networkResourceMapper: {
      type: Function,
      default: (data) => { return data },
    },
    vpcParams: {
      type: Object,
    },
    vpcResource: {
      type: String,
      default: 'vpcs', // 还可能是这样的resource cloudregions/{region_id}/vpcs
    },
    vpcResourceMapper: {
      type: Function,
      default: data => { return data },
    },
    showIpConfig: {
      type: Boolean,
      default: true,
    },
    helplink: {
      type: Object,
    },
  },
  data () {
    return {
      ipShow: false,
      selectedVpc: {},
    }
  },
  computed: {
    vpcField () {
      return (Array.isArray(this.decorator.vpc) && this.decorator.vpc[0]) || 'vpc'
    },
    networkField () {
      return (Array.isArray(this.decorator.network) && this.decorator.network[0]) || 'network'
    },
    ipAddrField () {
      return (Array.isArray(this.decorator.ip_addr) && this.decorator.ip_addr[0]) || 'ip_addr'
    },
    vpcParmasConcat () {
      return {
        limit: 0,
        show_emulated: true,
        ...this.vpcParams,
      }
    },
    networkParamsConcat () {
      return {
        vpc: this.selectedVpc.id,
        usable: true,
        ...this.networkParams,
      }
    },
  },
  watch: {
    selectedVpc (val) {
      if (this._ipSubnetDraftRestoring || this._pendingIpSubnetDraft) {
        this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
        return
      }
      this.persistFormFieldDraftSnapshot()
    },
    'form.fd.network' () {
      if (this._ipSubnetDraftRestoring || this._pendingIpSubnetDraft) {
        this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
        return
      }
      this.persistFormFieldDraftSnapshot()
    },
    'form.fd.ip_addr' () {
      if (this._ipSubnetDraftRestoring || this._pendingIpSubnetDraft) return
      this.persistFormFieldDraftSnapshot()
    },
    vpcParmasConcat: {
      deep: true,
      handler () {
        if (this._pendingIpSubnetDraft) {
          this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
        }
      },
    },
  },
  created () {
    this._pendingIpSubnetDraft = null
    this._ipSubnetDraftRestoring = false
    this._ipSubnetDraftRetryTimer = null
    this._ipSubnetDraftRetryCount = 0
  },
  beforeDestroy () {
    if (this._ipSubnetDraftRetryTimer) {
      clearTimeout(this._ipSubnetDraftRetryTimer)
      this._ipSubnetDraftRetryTimer = null
    }
  },
  methods: {
    getCreateFormFieldDraftSnapshot () {
      const fc = this.form?.fc
      if (!fc) return undefined
      const vpc = fc.getFieldValue(this.vpcField)
      const network = fc.getFieldValue(this.networkField)
      const ipAddr = fc.getFieldValue(this.ipAddrField)
      if (!vpc && !network && !ipAddr && !this.ipShow) return undefined
      return {
        vpc,
        network,
        ip_addr: ipAddr,
        ipShow: this.ipShow,
      }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || typeof draft !== 'object') return
      const hasAny = draft.vpc || draft.network || draft.ip_addr || draft.ipShow
      if (!hasAny) return
      this._pendingIpSubnetDraft = {
        vpc: draft.vpc,
        network: draft.network,
        ip_addr: draft.ip_addr,
        ipShow: !!(draft.ipShow || draft.ip_addr),
      }
      this._ipSubnetDraftRetryCount = 0
      if (this._pendingIpSubnetDraft.ipShow) {
        this.ipShow = true
      }
      this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
    },
    persistFormFieldDraftSnapshot (options = {}) {
      // 回填期间勿落盘，避免默认首项冲掉指定 IP / 网段草稿
      if (this._ipSubnetDraftRestoring || this._pendingIpSubnetDraft) return
      const data = this.serializeFormFieldDraft()
      if (data === undefined) return
      this.writeFormFieldDraft(data, options)
    },
    scheduleIpSubnetDraftRetry () {
      if (!this._pendingIpSubnetDraft) return
      if (this._ipSubnetDraftRetryCount >= 8) {
        this._pendingIpSubnetDraft = null
        return
      }
      if (this._ipSubnetDraftRetryTimer) clearTimeout(this._ipSubnetDraftRetryTimer)
      this._ipSubnetDraftRetryTimer = setTimeout(() => {
        this._ipSubnetDraftRetryCount += 1
        this.tryApplyPendingIpSubnetDraft()
      }, 300)
    },
    async tryApplyPendingIpSubnetDraft () {
      const draft = this._pendingIpSubnetDraft
      if (!draft || !this.form?.fc || this._ipSubnetDraftRestoring) return

      this._ipSubnetDraftRestoring = true
      try {
        if (draft.ipShow) this.ipShow = true

        if (draft.vpc) {
          const vpcList = this.$refs.vpcSelect?.sourceList || []
          // 列表空：不写回；仍在重试窗口内则等待
          if (!vpcList.length) {
            this.scheduleIpSubnetDraftRetry()
            return
          }
          if (!vpcList.some(item => item.id === draft.vpc)) {
            this._pendingIpSubnetDraft = null
            this._ipSubnetDraftRetryCount = 0
            return
          }
          this.form.fc.setFieldsValue({ [this.vpcField]: draft.vpc })
          if (!this.selectedVpc?.id || this.selectedVpc.id !== draft.vpc) {
            this.selectedVpc = { ...(this.selectedVpc || {}), id: draft.vpc }
          }
          await this.$nextTick()
        }

        if (draft.network) {
          await this.$nextTick()
          const networkList = this.$refs.networkSelect?.sourceList || []
          if (!networkList.length) {
            this.scheduleIpSubnetDraftRetry()
            return
          }
          if (!networkList.some(item => item.id === draft.network)) {
            draft.network = undefined
            draft.ip_addr = undefined
            this.form.fc.setFieldsValue({ [this.networkField]: undefined, [this.ipAddrField]: undefined })
          } else {
            this.form.fc.setFieldsValue({ [this.networkField]: draft.network })
          }
        }

        if (draft.ip_addr && this.ipShow && draft.network) {
          await this.$nextTick()
          this.form.fc.setFieldsValue({ [this.ipAddrField]: draft.ip_addr })
        }

        const vpcOk = !draft.vpc || this.form.fc.getFieldValue(this.vpcField) === draft.vpc
        const networkOk = !draft.network || this.form.fc.getFieldValue(this.networkField) === draft.network
        const ipOk = !draft.ip_addr || !this.ipShow || !draft.network ||
          this.form.fc.getFieldValue(this.ipAddrField) === draft.ip_addr
        if (vpcOk && networkOk && ipOk) {
          this._pendingIpSubnetDraft = null
          this._ipSubnetDraftRetryCount = 0
        } else {
          this.scheduleIpSubnetDraftRetry()
        }
      } finally {
        this._ipSubnetDraftRestoring = false
        if (!this._pendingIpSubnetDraft) {
          this.$nextTick(() => this.persistFormFieldDraftSnapshot())
        }
      }
    },
    onVpcInitLoaded () {
      if (this._pendingIpSubnetDraft) this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
    },
    onNetworkInitLoaded () {
      if (this._pendingIpSubnetDraft) this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
    },
    triggerShowIp () {
      this.ipShow = !this.ipShow
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
    vpcLabelFormat (item) {
      if (!item.cidr_block) return item.name
      return `${item.name}（${item.cidr_block}）`
    },
  },
}
</script>
