<template>
  <div>
    <page-header :title="$t('network.text_724')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" v-bind="formItemLayout" class="mb-0">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="domainChange" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :cloudregionParams="regionParams"
          :providerParams="cloudProviderParams"
          :isRequired="true"
          :region.sync="regionList"
          @change="cloudregionChange" />
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_743')" v-bind="formItemLayout" v-if="this.cloudEnv === 'onpremise'" v-show="showBgpTypes">
          <a-select v-decorator="decorators.bgp_type" @change="handleBgpTypeChange">
            <a-select-option v-for="item in bgpTypeOptions" :value="item" :key="item">{{ item === '' ? $t('network.text_749') : item }}</a-select-option>
          </a-select>
        </a-form-item>
        <template v-if="showIpSubnet">
          <ip-subnet
            :label="$t('network.text_211')"
            :isRequired="true"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :decorator="decorators"
            :vpcParams="vpcParams"
            :networkParams="networkParams"
            :vpcResourceMapper="vpcResourceMapper"
            :showIpConfig="cloudEnv !== 'public'"
            :helplink="{ipSubnetHelp: $t('network.eip.tip'), ipSubnetHref: '/network/create'}" />
        </template>
        <template v-if="cloudEnv !== 'private' || isHCSO">
          <a-form-item :label="$t('network.text_192')" v-bind="formItemLayout">
            <a-radio-group v-decorator="decorators.charge_type" @change="chargeTypeChange">
              <a-radio-button v-for="item in chargeTypeOptions" :value="item.value" :key="item.value">
                {{item.label}}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="$t('network.text_484')" v-bind="formItemLayout">
            <div class="d-flex align-items-center">
              <a-tooltip placement="top" :title="$t('network.eip.text_725', [maxBandwidth])">
                <a-input-number
                  style="width: 120px"
                  :min="1"
                  :max="maxBandwidth"
                  :step="cloudEnv === 'onpremise' ? 1 : 50"
                  :formatter="format"
                  :parse="format"
                  v-decorator="decorators.bandwidth" />
              </a-tooltip>
              <span class="ml-2">Mbps</span>
            </div>
          </a-form-item>
        </template>
        <a-form-item :label="$t('compute.text_15')" v-bind="formItemLayout" v-if="cloudEnv === 'public' || isHCSO" key="manager">
          <base-select
            :remote="true"
            v-decorator="decorators.manager"
            resource="cloudproviders"
            :params="providerParams"
            :mapper="providerMapper"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            @update:item="providerChange"
            :isDefaultSelect="true"
            :select-props="{ placeholder: $t('compute.text_1387') }"
            style="width: 320px" />
        </a-form-item>
        <a-form-item :label="$t('common.text00012')" class="mb-0" v-bind="formItemLayout">
          <tag
            v-decorator="decorators.__meta__" />
        </a-form-item>
      </a-form>
    </page-body>
    <bottom-bar
      :isHCSO="isHCSO"
      :current-cloudregion="selectedRegionItem"
      :size="bandwidth"
      :bgp-type="bgp_type"
      :cloudAccountId="cloudAccountId" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import IpSubnet from '@Network/sections/IpSubnet'
import AreaSelects from '@/sections/AreaSelects'
import DomainProject from '@/sections/DomainProject'
import validateForm, { isRequired } from '@/utils/validate'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import Tag from '@/sections/Tag'
import { HYPERVISORS_MAP } from '../../../../../src/constants'
import BottomBar from './components/BottomBar'

export default {
  name: 'EipCreate',
  components: {
    AreaSelects,
    DomainProject,
    IpSubnet,
    BottomBar,
    Tag,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('network_manage_brands', true)
    const queryType = this.$route.query.type
    let cloudEnv = queryType === 'idc' ? 'onpremise' : this.$route.query.type
    let routerQuery = this.$route.query.type
    if (!cloudEnvOptions.find(val => val.key === cloudEnv)) {
      cloudEnv = cloudEnvOptions[0].key
      routerQuery = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
    }
    return {
      loading: false,
      inputIpType: 'random',
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.cloudregion) {
              this.selectedRegionItem = this.regionList[values.cloudregion]
            }
            if (values.bandwidth) {
              this.bandwidth = values.bandwidth
            }
          },
        }),
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('dictionary.project'), trigger: 'change' },
            ],
          },
        ],
        manager: [
          'manager',
          {
            rules: [
              { required: true, message: this.$t('network.text_215') },
            ],
          },
        ],
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_212') },
            ],
          },
        ],
        network: [
          'network',
          {
            rules: [
              { required: true, message: this.$t('network.text_212') },
            ],
          },
        ],
        ip_addr: [
          'ip_addr',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_217') },
              { validator: this.$validate('IPv4') },
            ],
          },
        ],
        bandwidth: [
          'bandwidth',
          {
            initialValue: 30,
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_218') },
              { validator: this.$validate('serverName') },
            ],
          },
        ],
        description: ['description'],
        charge_type: [
          'charge_type',
        ],
        bgp_type: [
          'bgp_type',
        ],
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
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
      manager: '',
      cloudAccountId: '',
      selectedRegionItem: {},
      showBandwidth: true,
      charge_type: cloudEnv === 'onpremise' ? 'bandwidth' : 'traffic',
      providerC: '',
      domain_id: 'default',
      regionList: {},
      bandwidth: cloudEnv !== 'private' ? 30 : 0,
      bgpTypeOptions: [],
      bgp_type: undefined,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    sliderMarks () {
      let ret = { [this.maxBandwidth / 2]: `${this.maxBandwidth / 2}Mbps` }
      ret = { ...ret, ...{ 1: '1Mbps', [this.maxBandwidth]: `${this.maxBandwidth}Mbps` } }
      return ret
    },
    isHCSO () {
      if (this.selectedRegionItem) {
        return this.selectedRegionItem.provider === HYPERVISORS_MAP.hcso.provider
      }
      return false
    },
    providerParams () {
      const params = {
        enabled: 1,
        details: true,
        public_cloud: !this.isHCSO,
        scope: this.$store.getters.scope,
        usable: true,
      }
      if (this.isAdminMode) {
        params.project_domain_id = this.domain_id
      }
      if (!R.isEmpty(this.selectedRegionItem)) {
        params.cloudregion_id = this.selectedRegionItem.id
      }
      return params
    },
    showBgpTypes () {
      if (!this.bgpTypeOptions || this.bgpTypeOptions.length === 0) {
        return false
      }
      if (this.bgpTypeOptions.length === 1 && this.bgpTypeOptions[0] === '') {
        return false
      }

      return true
    },
    regionParams () {
      let params = {
        cloud_env: this.cloudEnv,
      }
      if (this.cloudEnv === 'onpremise') {
        params = {
          ...params,
          usable: true,
          show_emulated: true,
          scope: this.$store.getters.scope,
        }
      }
      if (this.isAdminMode) {
        params.project_domain = this.domain_id
        delete params.scope
      }
      return params
    },
    networkParams () {
      const ret = {
        limit: 0,
        scope: this.scope,
        bgp_type: this.bgp_type,
      }
      if (this.manager) {
        ret.manager = this.manager
        return ret
      }
      if (this.cloudEnv === 'onpremise' && !R.isEmpty(this.selectedRegionItem)) {
        ret.server_type = 'eip'
        ret.cloudregion_id = this.selectedRegionItem.id
        return ret
      }
      return ret
    },
    vpcParams () {
      const params = {
        scope: this.scope,
        cloudregion_id: this.selectedRegionItem.id,
      }
      if (this.isAdminMode) {
        params.project_domain = this.domain_id
        delete params.scope
      }
      return params
    },
    chargeTypeOptions () {
      const arr = [
        { label: this.$t('network.text_194'), value: 'bandwidth' },
        { label: this.$t('network.text_193'), value: 'traffic' },
      ]
      if (this.cloudEnv === 'onpremise') {
        return [arr[0]]
      }
      if (!this.showBandwidth) {
        arr.shift()
      }
      return arr
    },
    maxBandwidth () {
      if (this.cloudEnv === 'onpremise') {
        return 10000
      }
      let maxBandwidth = 200
      if (!R.isEmpty(this.selectedRegionItem)) {
        if (this.charge_type === 'bandwidth') {
          if (this.selectedRegionItem.provider === 'Huawei') {
            maxBandwidth = 2000
          } else if (this.selectedRegionItem.provider === 'Aliyun') {
            maxBandwidth = 500
          }
        } else {
          if (this.selectedRegionItem.provider === 'Huawei') {
            maxBandwidth = 300
          } else {
            maxBandwidth = 200
          }
        }
      }
      return maxBandwidth
    },
    updateProviderParams: {
      get () {
        return this.providerParams
      },
      set (newValue) {
        this.providerParams = newValue
      },
    },
    areaselectsName () {
      if (this.cloudEnv === 'private' || this.cloudEnv === 'onpremise') {
        return ['cloudregion']
      }
      return ['provider', 'cloudregion']
    },
    showIpSubnet () {
      if (this.selectedRegionItem.provider === HYPERVISORS_MAP.hcso.provider) return false
      if (this.providerC === 'zstack' || this.providerC === 'openstack') return true
      if (this.cloudEnv === 'onpremise' && this.selectedRegionItem && this.selectedRegionItem.id) return true
      if (this.cloudEnv === 'private' && this.selectedRegionItem && this.selectedRegionItem.id) return true
      return false
    },
    cloudProviderParams () {
      const param = {
        scope: this.scope,
        cloudEnv: this.cloudEnv,
      }
      if (this.isAdminMode) {
        param.project_domain_id = this.domain_id
        delete param.scope
      }
      return param
    },
    bgpTypeParams () {
      return {
        usable: true,
        limit: 0,
        scope: this.scope,
        server_type: 'eip',
        field: 'bgp_type',
      }
    },
  },
  watch: {
    cloudEnv (newValue) {
      if (R.has('public_cloud', this.updateProviderParams)) {
        Reflect.deleteProperty(this.updateProviderParams, 'public_cloud')
      } else {
        Reflect.deleteProperty(this.updateProviderParams, 'private_cloud')
      }
      const platform = newValue + '_cloud'
      this.updateProviderParams = {
        ...this.updateProviderParams,
        [platform]: true,
      }
      this.$refs.areaSelects.fetchs(this.areaselectsName)
      this.form.fc.resetFields(['manager'])
      this.manager = ''
      this.providerC = ''
      this.charge_type = newValue === 'onpremise' ? 'bandwidth' : 'traffic'
      this.$nextTick(() => {
        this.form.fc.getFieldDecorator('charge_type', { initialValue: newValue === 'onpremise' ? 'bandwidth' : 'traffic' })
      })
      this.bandwidth = newValue === 'private' && !this.isHCSO ? 0 : 30
    },
  },
  provide () {
    return {
      form: this.form,
      cloudEnv: this.cloudEnv,
    }
  },
  created () {
    this.fetchBgpType()
    this.$nextTick(() => {
      this.form.fc.getFieldDecorator('charge_type', { initialValue: this.cloudEnv === 'onpremise' ? 'bandwidth' : 'traffic' })
    })
  },
  methods: {
    fetchBgpType () {
      new this.$Manager('networks/distinct-field').list({
        params: {
          usable: true,
          limit: 0,
          field: 'bgp_type',
          scope: this.$store.getters.scope,
          server_type: 'eip',
        },
      }).then(({ data }) => {
        this.bgpTypeOptions = data.bgp_type
      })
    },
    handleBgpTypeChange (value) {
      this.bgp_type = value
    },
    format (val) {
      if (this.cloudEnv === 'onpremise') return val
      return +val || 1
    },
    vpcResourceMapper (data) {
      if (this.cloudEnv === 'onpremise') {
        data = data.filter(item => item.id === 'default')
        return data
      }
      return data
    },
    domainChange (item) {
      if (R.type(item) === 'Object') {
        this.domain_id = item.key
      } else {
        this.domain_id = item
      }
      if (this.isAdminMode) {
        this.updateProviderParams = {
          ...this.updateProviderParams,
          project_domain: this.domain_id,
        }
        delete this.updateProviderParams.scope
      } else {
        this.updateProviderParams = {
          ...this.updateProviderParams,
          scope: this.$store.getters.scope,
        }
      }
    },
    cloudregionChange (data) {
      if (!R.isNil(data.cloudregion) && !R.isEmpty(data.cloudregion)) {
        this.updateProviderParams = {
          ...this.updateProviderParams,
          cloudregion_id: data.cloudregion.id,
        }
      }
    },
    providerMapper (data) {
      data = data.filter(item => item.status === 'connected' && item.enabled)
      return data
    },
    providerChange (e) {
      if (e) {
        this.manager = e.id
        if (e.provider.toLowerCase() === 'azure') {
          this.form.fc.setFieldsValue({ bandwidth: 0 })
        } else {
          this.form.fc.setFieldsValue({ bandwidth: 30 })
        }
        this.hiddenBrandwidthHandle(e.provider)
        this.providerC = e.provider.toLowerCase()
        this.cloudAccountId = e.cloudaccount_id || ''
      } else {
        this.cloudAccountId = ''
      }
    },
    chargeTypeChange (e) {
      this.charge_type = e.target.value
    },
    hiddenBrandwidthHandle (selectedProvider) {
      const providers = ['Azure', 'Aws', 'Google']
      if (providers.some(v => v === selectedProvider)) {
        this.form.fc.setFieldsValue({ bandwidth: 1 })
        this.showBandwidth = false
      } else {
        this.form.fc.setFieldsValue({ bandwidth: 30 })
        this.showBandwidth = true
      }
    },
  },
}
</script>
