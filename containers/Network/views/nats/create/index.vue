<template>
  <div>
    <page-header :title="$t('network.create_nat')" />
    <page-body>
      <a-form
        class="mt-3"
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('network.text_205', [$t('dictionary.domain')])" v-if="$store.getters.isAdminMode">
          <domain-select v-decorator="decorators.project_domain" @change="handleDomainChange" />
        </a-form-item>
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <!-- 计费方式 -->
        <clearing-radios v-bind="formItemLayout" :auto_renew="false" />
        <a-form-item :label="$t('network.expired_release')" v-if="form.fd.billing_type !== 'prepaid'">
          <duration :decorators="decorators.duration" :form="form" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :providerParams="providerParams"
          :cloudregionParams="regionParams"
          :isRequired="true"
          filterBrandResource="nat_engine"
          @change="handleRegionChange" />
        <!-- 套餐 -->
        <s-k-u ref="REF_SKU" />
        <!-- 网络 -->
        <template>
          <network-selects
            ref="REF_NETWORK"
            :label="$t('network.text_16')"
            :isDefaultFetch="false"
            :vpcFormat="vpcFormat"
            :vpcParams="vpcParams"
            :networkParams="netParams"
            v-bind="formItemLayout" />
        </template>
        <template>
          <eip-config v-if="form.getFieldValue('provider') !== 'Huawei'"
            :decorators="decorators.eip"
            :eip-params="eipParams"
            :hypervisor="hypervisor"
            :showBind="false"
            :isServertemplate="false"
            :cloud-env="cloudEnv"
            :form="form"
            :hasPublicIp="false"
            :formItemLayout="formItemLayout" />
        </template>
        <a-form-item :label="$t('common.text00012')" class="mb-0" v-bind="formItemLayout">
          <tag
            v-decorator="decorators.__meta__" />
        </a-form-item>
      </a-form>
      <bottom-bar :values="form.fc.getFieldsValue()" :cloudAccountId="cloudAccountId" />
    </page-body>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DomainSelect from '@/sections/DomainSelect'
import { DECORATORS } from '@Network/views/nats/constants'
import Duration from '@Compute/sections/Duration'
import NetworkSelects from '@/sections/NetworkSelects'
import { PROVIDER_MAP } from '@/constants'
import AreaSelects from '@/sections/AreaSelects'
import EipConfig from '@Compute/sections/EipConfig'
import Tag from '@/sections/Tag'
import changeMinxin from './changeMinxin'
import BottomBar from './components/BottomBar'
import SKU from './components/SKU'

export default {
  name: 'NatCreate',
  components: {
    DomainSelect,
    Duration,
    AreaSelects,
    SKU,
    NetworkSelects,
    EipConfig,
    BottomBar,
    Tag,
  },
  mixins: [changeMinxin],
  data () {
    return {
      loading: false,
      decorators: DECORATORS,
      selectedRegionItem: {},
      formItemLayout: {
        wrapperCol: {
          md: { span: 17 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 7 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
      tailFormItemLayout: {
        wrapperCol: {
          lg: { span: 18, offset: 6 },
          xl: { span: 20, offset: 4 },
          xxl: { span: 21, offset: 3 },
        },
      },
      vpcList: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    areaselectsName () {
      return ['provider', 'cloudregion']
    },
    cloudEnv () {
      return 'public'
    },
    hypervisor () {
      if (R.is(Object, this.form.fd.sku)) {
        const { provider } = this.form.fd.sku
        if (provider) {
          return PROVIDER_MAP[provider].hypervisor
        }
      }
      return ''
    },
    cloudAccountId () {
      const values = this.form.getFieldsValue()
      const currentVpc = this.vpcList.filter(item => item.id === values.vpc)
      if (currentVpc[0]) {
        return currentVpc[0].account_id
      }
      return ''
    },
  },
  created () {
    this.$nextTick(() => {
      this.form.fc.setFieldsValue({ project_domain: this.$store.getters.userInfo.projectDomainId })
    })
  },
  methods: {
    vpcFormat (vpc) {
      const { name, manager } = vpc
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ name }>{ name }</span>
          <span style="color: #8492a6; font-size: 13px">{ this.$t('network.manager', [manager]) }</span>
        </div>
      )
    },
    fetchVpc () {
      this.$refs.REF_NETWORK.fetchVpc(this.vpcListChange)
    },
    vpcListChange ({ vpcList }) {
      this.vpcList = vpcList
    },
    handleDomainChange (val) {
      this.project_domain = val
      this.$refs.areaSelects.fetchs(this.areaselectsName)
    },
    providerParams () {
      const params = {
        limit: 0,
        enabled: 1,
        // cloud_env: 'public',
        scope: this.scope,
        provider: this.$store.getters.capability.nat_brands.filter(v => v !== 'Aws'),
      }
      if (!this.$store.getters.capability.nat_brands || this.$store.getters.capability.nat_brands.length === 0) {
        params.provider = 'Other'
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.project_domain
        delete params.scope
      }
      return params
    },
    regionParams () {
      const params = {
        usable: true,
        show_emulated: true,
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.project_domain
        delete params.scope
      }
      return params
    },
    vpcParams () {
      const params = {
        cloudregion_id: this.form.fd.cloudregion_id || this.form.fd.cloudregion,
        scope: this.scope,
      }
      return params
    },
    netParams () {
      const { fd } = this.form
      const params = {
        cloudregion_id: fd.cloudregion_id || fd.cloudregion,
        scope: this.scope,
      }
      const zoneStr = this.$refs.REF_SKU.getZone()
      if (zoneStr) {
        const zoneArr = zoneStr.split(',')
        if (zoneArr && zoneArr.length > 0) {
          params.zones = zoneArr
        }
      }
      return params
    },
    eipParams () {
      const cloudregion_id = this.$refs.REF_SKU.getCloudregionId()
      const params = {
        cloudregion_id: cloudregion_id,
      }
      return params
    },
  },
}
</script>
