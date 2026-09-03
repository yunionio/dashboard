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
      }
    },
    'form.fd.network' () {
      if (this._ipSubnetDraftRestoring || this._pendingIpSubnetDraft) {
        this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
      }
    },
    vpcParmasConcat: {
      deep: true,
      handler () {
        this.$nextTick(() => this.restoreFormFieldDraftFields())
        if (this._pendingIpSubnetDraft) {
          this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
        }
      },
    },
  },
  created () {
    this._pendingIpSubnetDraft = null
    this._ipSubnetDraftRestoring = false
  },
  mounted () {
    this.$nextTick(() => this.restoreFormFieldDraftFields())
  },
  methods: {
    getCreateFormFieldDraftSnapshot () {
      const fc = this.form?.fc
      if (!fc) return null
      const vpc = fc.getFieldValue(this.vpcField)
      const network = fc.getFieldValue(this.networkField)
      // 指定 IP（输入）不落盘；无 vpc/network 则不写草稿
      if (!vpc && !network) return null
      return {
        vpc,
        network,
      }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || typeof draft !== 'object') return
      const hasAny = draft.vpc || draft.network
      if (!hasAny) return
      this._pendingIpSubnetDraft = {
        vpc: draft.vpc,
        network: draft.network,
      }
      this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
    },
    async tryApplyPendingIpSubnetDraft () {
      const draft = this._pendingIpSubnetDraft
      if (!draft || !this.form?.fc || this._ipSubnetDraftRestoring) return

      this._ipSubnetDraftRestoring = true
      try {
        if (draft.vpc) {
          const vpcList = this.$refs.vpcSelect?.sourceList || []
          // 列表空：不写回；等 onVpcInitLoaded 再试
          if (!vpcList.length) {
            return
          }
          if (!vpcList.some(item => item.id === draft.vpc)) {
            this._pendingIpSubnetDraft = null
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
            return
          }
          if (!networkList.some(item => item.id === draft.network)) {
            draft.network = undefined
            this.form.fc.setFieldsValue({ [this.networkField]: undefined })
          } else {
            this.form.fc.setFieldsValue({ [this.networkField]: draft.network })
          }
        }

        const vpcOk = !draft.vpc || this.form.fc.getFieldValue(this.vpcField) === draft.vpc
        const networkOk = !draft.network || this.form.fc.getFieldValue(this.networkField) === draft.network
        if (vpcOk && networkOk) {
          this._pendingIpSubnetDraft = null
        } else {
          await this.$nextTick()
          this.tryApplyPendingIpSubnetDraft()
        }
      } finally {
        this._ipSubnetDraftRestoring = false
      }
    },
    onVpcInitLoaded () {
      if (this._pendingIpSubnetDraft) this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
    },
    onNetworkInitLoaded () {
      if (this._pendingIpSubnetDraft) this.$nextTick(() => this.tryApplyPendingIpSubnetDraft())
    },
    triggerShowIp () {
      const next = !this.ipShow
      if (!next) {
        // 取消指定 IP：清字段，避免展示关闭但提交仍带 ip
        if (this.form && this.form.fc) {
          this.form.fc.setFieldsValue({ [this.ipAddrField]: undefined })
        }
        if (this.form && this.form.fd) this.$delete(this.form.fd, this.ipAddrField)
      }
      this.ipShow = next
    },
    vpcLabelFormat (item) {
      if (!item.cidr_block) return item.name
      return `${item.name}（${item.cidr_block}）`
    },
  },
}
</script>
